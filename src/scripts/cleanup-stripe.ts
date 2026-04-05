import Stripe from 'stripe';
import * as dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2024-06-20' as any,
});

const prisma = new PrismaClient();

async function cleanupStripe() {
    try {
        console.log('Fetching plans from Database...');
        const dbPlans = await prisma.subscriptionPlan.findMany();
        const planMap = new Map(dbPlans.map(p => [p.id, p]));

        console.log('Fetching all active prices from Stripe...');
        const prices = await stripe.prices.list({
            limit: 100,
            active: true
        });
        
        let deactivatedCount = 0;

        for (const price of prices.data) {
            const lookupKey = price.lookup_key || '';
            const amount = price.unit_amount ? price.unit_amount / 100 : 0;
            
            let shouldDeactivate = false;
            let reason = '';

            // 1. Check if it's the old lookup key format: plan_<id>
            const oldFormatMatch = lookupKey.match(/^plan_([a-f0-9]{24})$/);
            if (oldFormatMatch) {
                shouldDeactivate = true;
                reason = 'Old lookup key format (no price suffix)';
            }

            // 2. Check if it's the new format: plan_<id>_<price>
            const newFormatMatch = lookupKey.match(/^plan_([a-f0-9]{24})_(.*)$/);
            if (newFormatMatch) {
                const planId = newFormatMatch[1];
                const priceInKey = parseFloat(newFormatMatch[2]);
                const dbPlan = planMap.get(planId);

                if (!dbPlan || dbPlan.price !== priceInKey || amount !== dbPlan.price) {
                    shouldDeactivate = true;
                    reason = `Price mismatch or plan not found (Key Price: ${priceInKey}, DB Price: ${dbPlan?.price}, Stripe Amount: ${amount})`;
                }
            }

            // 3. Known old amounts without lookup keys
            if (!lookupKey && (amount === 899 || amount === 2499 || amount === 199)) {
                shouldDeactivate = true;
                reason = `Known old amount without lookup key: ${amount}`;
            }

            if (shouldDeactivate) {
                console.log(`Deactivating price: ${price.id} | Amount: ${amount} | Key: ${lookupKey} | Reason: ${reason}`);
                await stripe.prices.update(price.id, { active: false });
                deactivatedCount++;
            }
        }
        console.log(`Stripe cleanup completed. Deactivated ${deactivatedCount} prices.`);
    } catch (e) {
        console.error('Stripe cleanup error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

cleanupStripe();
