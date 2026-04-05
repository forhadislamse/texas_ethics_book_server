import Stripe from 'stripe';
import * as dotenv from 'dotenv';
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2024-06-20' as any,
});

async function run() {
    const result: any = { monthly: [], yearly: [] };

    const list = await stripe.prices.list({
        lookup_keys: ['plan_69b7c3384b0bf1312b60f77d'],
        limit: 10
    });
    list.data.forEach(p => {
        result.monthly.push({ id: p.id, active: p.active, amount: p.unit_amount });
    });

    const yearlyList = await stripe.prices.list({
        lookup_keys: ['plan_69b7c3384b0bf1312b60f77e_199.99'],
        limit: 10
    });
    yearlyList.data.forEach(p => {
        result.yearly.push({ id: p.id, active: p.active, amount: p.unit_amount });
    });

    const fs = require('fs');
    fs.writeFileSync('check-inactive.json', JSON.stringify(result, null, 2));
    console.log('Results written to check-inactive.json');
}

run();
