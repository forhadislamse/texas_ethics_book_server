
import Stripe from 'stripe';
import config from '../../../config';
import prisma from '../../../shared/prisma';

const stripe = new Stripe(config.stripe.secret_key as string, {
    apiVersion: '2024-06-20' as any,
});

const createCheckoutSession = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new Error('User not found');
    }

    // Use existing customer or create a new one
    let customerId = user.stripeCustomerId;
    if (!customerId) {
        const customer = await stripe.customers.create({
            email: user.email as string,
            metadata: {
                userId: user.id,
            },
        });
        customerId = customer.id;
        await prisma.user.update({
            where: { id: user.id },
            data: { stripeCustomerId: customerId },
        });
    }

    const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Legal Guide Subscription',
                        description: 'Unlimited access to the Legal Practice Guide',
                    },
                    unit_amount: 4900, // $49.00
                    recurring: {
                        interval: 'month',
                    },
                },
                quantity: 1,
            },
        ],
        mode: 'subscription',
        success_url: `${config.client.url}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${config.client.url}/payment/cancel`,
        metadata: {
            userId: user.id,
        },
    });

    return { url: session.url };
};

const handleWebhook = async (payload: string, sig: string) => {
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            payload,
            sig,
            config.stripe.webhook_secret as string
        );
    } catch (err: any) {
        throw new Error(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session.metadata?.userId;
            const subscriptionId = session.subscription as string;

            if (userId) {
                const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                const expiresAt = new Date(subscription.current_period_end * 1000);

                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        isSubscribed: true,
                        subscriptionExpiresAt: expiresAt,
                    },
                });
            }
            break;

        case 'invoice.payment_succeeded':
            const invoice = event.data.object as Stripe.Invoice;
            const subId = invoice.subscription as string;
            
            if (subId) {
                const subscription = await stripe.subscriptions.retrieve(subId);
                const expiresAt = new Date(subscription.current_period_end * 1000);
                
                // Find user by stripeCustomerId
                const customer = await prisma.user.findFirst({
                    where: { stripeCustomerId: invoice.customer as string }
                });

                if (customer) {
                    await prisma.user.update({
                        where: { id: customer.id },
                        data: {
                            isSubscribed: true,
                            subscriptionExpiresAt: expiresAt,
                        },
                    });
                }
            }
            break;

        case 'customer.subscription.deleted':
            const subDeleted = event.data.object as Stripe.Subscription;
            const customerId = subDeleted.customer as string;

            const userToUnsub = await prisma.user.findFirst({
                where: { stripeCustomerId: customerId }
            });

            if (userToUnsub) {
                await prisma.user.update({
                    where: { id: userToUnsub.id },
                    data: {
                        isSubscribed: false,
                        subscriptionExpiresAt: null,
                    },
                });
            }
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return { received: true };
};

export const PaymentServices = {
    createCheckoutSession,
    handleWebhook,
};
