
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkChapters() {
    try {
        const chapters = await prisma.chapter.findMany({
            orderBy: { order: 'asc' },
            take: 5
        });
        console.log('--- Chapters (First 5) ---');
        console.table(chapters.map(c => ({ id: c.id, number: c.number, title: c.title, order: c.order })));

        const user = await prisma.user.findFirst({
            where: { role: 'USER' as any }
        });
        if (user) {
            console.log('--- Sample User ---');
            console.log({ name: (user as any).fullName, isSubscribed: user.isSubscribed, expiresAt: user.subscriptionExpiresAt });
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkChapters();
