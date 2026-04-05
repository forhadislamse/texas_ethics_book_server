import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import fs from 'fs';

dotenv.config();

const prisma = new PrismaClient();

async function testVercelEndpoint() {
    try {
        const user = await prisma.user.findFirst();
        const plan = await prisma.subscriptionPlan.findFirst({
            where: { name: 'Monthly Plan' }
        });

        if (!user || !plan) {
            console.error('User or Plan not found');
            return;
        }

        // Mint token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET as string,
            { expiresIn: '1h' }
        );

        console.log(`Testing against Vercel for User: ${user.email}, Plan: ${plan.name} (${plan.id})`);
        
        const response = await axios.post(
            'https://andcates-server.vercel.app/api/v1/payment/create-subscription-intent',
            { planId: plan.id },
            { headers: { Authorization: token } }
        );

        console.log('Success:', response.data);
    } catch (e: any) {
        if (e.response) {
            fs.writeFileSync('vercel_error.json', JSON.stringify(e.response.data, null, 2), 'utf-8');
            console.error('Error from Vercel Backend: Wrote to vercel_error.json');
        } else {
            console.error('Request failed:', e.message);
        }
    } finally {
        await prisma.$disconnect();
    }
}

testVercelEndpoint();
