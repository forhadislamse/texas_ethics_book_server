import Stripe from 'stripe';
import * as dotenv from 'dotenv';
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2024-06-20' as any,
});

async function run() {
    console.log('--- Current Active Prices in Stripe ---');
    const prices = await stripe.prices.list({ limit: 100, active: true });
    for (const p of prices.data) {
        console.log(`ID: ${p.id} | Amount: ${p.unit_amount} | Key: [${p.lookup_key}] | Product: ${(p.product as any).name || p.product}`);
    }
}
run();
