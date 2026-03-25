
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkPlans() {
    try {
        const plans = await prisma.subscriptionPlan.findMany({});
        console.log('--- Subscription Plans ---');
        console.table(plans.map(p => ({ id: p.id, name: p.name, price: p.price })));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkPlans();
