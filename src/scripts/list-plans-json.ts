import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function listPlans() {
    try {
        const plans = await prisma.subscriptionPlan.findMany({
            orderBy: { price: 'asc' }
        });
        console.log(JSON.stringify(plans, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

listPlans();
