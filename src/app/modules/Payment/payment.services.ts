import Stripe from 'stripe';
import config from '../../../config';
import prisma from '../../../shared/prisma';
import ApiError from '../../../errors/ApiErrors';

const stripe = new Stripe(config.stripe.secret_key as string, {
    apiVersion: '2024-06-20' as any,
});

/**
 * Creates a Stripe Subscription (Incomplete) and returns the client_secret 
 * so the frontend can confirm the payment using Stripe Elements.
 */
const createSubscriptionIntent = async (userId: string, planId: string) => {
    // 1. Fetch User
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    // 2. Fetch Subscription Plan
    const plan = await prisma.subscriptionPlan.findUnique({
        where: { id: planId }
    });

    if (!plan) {
        throw new ApiError(404, 'Subscription plan not found');
    }

    if (!plan.isActive) {
        throw new ApiError(400, 'This plan is currently not active');
    }

    // Free plan bypass (No Stripe needed)
    if (plan.price === 0) {
        // Handle free plan logic directly here or via a separate endpoint
        // For now, return a specific response that frontend can use to bypass Stripe
        return { isFree: true, planDetails: plan };
    }

    // 3. Ensure User is a Stripe Customer
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

    // 4. Handle Stripe Products/Prices dynamically
    // In a prod app, you might map DB plans to actual Stripe Price IDs.
    // Since we only have DB pricing, we can dynamically create a Price/Product on the fly
    // or use adhoc prices. Stripe requires a `price` ID for subscriptions.
    
    // Check if we need to create a Stripe Product and Price
    // For simplicity, we search for an existing product based on the plan ID, or create it.
    let stripePriceId: string;
    
    // We use Stripe's metadata to link Stripe Prices with our DB Plans
    const prices = await stripe.prices.list({
        lookup_keys: [`plan_${plan.id}`],
        limit: 1
    });

    if (prices.data.length > 0) {
        stripePriceId = prices.data[0].id;
    } else {
        // Create Product
        const product = await stripe.products.create({
            name: plan.name,
            description: plan.features.join(', ').substring(0, 250), // Truncate if too long
            metadata: { planId: plan.id }
        });
        
        // Create Price
        const price = await stripe.prices.create({
            product: product.id,
            unit_amount: Math.round(plan.price * 100), // Stripe expects cents
            currency: plan.currency.toLowerCase(),
            recurring: {
                interval: plan.duration === 'yearly' ? 'year' : 'month',
            },
            lookup_key: `plan_${plan.id}`
        });

        stripePriceId = price.id;
    }

    // 5. Create Subscription with state: incomplete
    const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: stripePriceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
            userId: user.id,
            planId: plan.id
        }
    });

    // Extract client secret
    const invoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

    if (!paymentIntent?.client_secret) {
        throw new ApiError(500, 'Failed to generate payment intent');
    }

    return { 
        subscriptionId: subscription.id, 
        clientSecret: paymentIntent.client_secret 
    };
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
    createSubscriptionIntent,
    handleWebhook,
};
