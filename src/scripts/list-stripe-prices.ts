import Stripe from 'stripe';
import * as dotenv from 'dotenv';
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2024-06-20' as any,
});

async function listStripePrices() {
    try {
        const prices = await stripe.prices.list({
            expand: ['data.product'],
            limit: 100
        });
        
        console.log('--- Stripe Prices ---');
        prices.data.forEach(p => {
            const product = p.product as Stripe.Product;
            const amount = p.unit_amount !== null ? (p.unit_amount / 100).toFixed(2) : 'N/A';
            console.log(`Product: ${product.name} | Price: ${amount} ${p.currency.toUpperCase()} | Lookup Key: ${p.lookup_key ?? 'None'} | Active: ${p.active}`);
        });
    } catch (e) {
        console.error(e);
    }
}

listStripePrices();
