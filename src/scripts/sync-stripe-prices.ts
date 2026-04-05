import Stripe from 'stripe';
import * as dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2024-06-20' as any,
});

const prisma = new PrismaClient();

async function syncStripePrices() {
    try {
        console.log('Fetching plans from Database...');
        const plans = await prisma.subscriptionPlan.findMany({
            where: { isActive: true }
        });

        for (const plan of plans) {
            if (plan.price === 0) {
                console.log(`Skipping free plan: ${plan.name}`);
                continue;
            }

            const lookupKey = `plan_${plan.id}_${plan.price}`;
            console.log(`Checking price for ${plan.name} (${plan.price} ${plan.currency}) with key: ${lookupKey}`);

            const prices = await stripe.prices.list({
                lookup_keys: [lookupKey],
                limit: 1,
                active: true
            });

            if (prices.data.length > 0) {
                console.log(`- Price already exists: ${prices.data[0].id}`);
            } else {
                console.log(`- Price not found. Creating new product and price...`);
                
                const product = await stripe.products.create({
                    name: plan.name,
                    description: plan.features.join(', ').substring(0, 250),
                    metadata: { planId: plan.id }
                });
                
                const price = await stripe.prices.create({
                    product: product.id,
                    unit_amount: Math.round(plan.price * 100),
                    currency: plan.currency.toLowerCase(),
                    recurring: {
                        interval: plan.duration === 'yearly' ? 'year' : 'month',
                    },
                    lookup_key: lookupKey
                });
                console.log(`- Created new price: ${price.id}`);
            }
        }
        console.log('Stripe price synchronization completed.');
    } catch (e) {
        console.error('Stripe sync error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

syncStripePrices();
