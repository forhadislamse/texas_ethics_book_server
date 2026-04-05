
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPlans() {
  try {
    console.log('Seeding subscription plans...');

    // Delete existing plans if needed (optional, but good for clean seed)
    // await prisma.subscriptionPlan.deleteMany({});

    const plans = [
      {
        name: 'Free Plan',
        price: 0,
        currency: 'USD',
        duration: 'unlimited',
        isPopular: false,
        features: [
          'Access to selected preview chapters',
          'Limited search functionality',
          'View sample rules and commentary',
          'Experience the digital reading interface'
        ]
      },
      {
        name: 'Monthly Plan',
        price: 19.99,
        currency: 'USD',
        duration: 'monthly',
        isPopular: true,
        features: [
          'Full access to all chapters and sections',
          'Powerful keyword search',
          'Practice Notes & Citations',
          'Ethics Commission Opinions Database',
          'Case Law & Attorney General Opinions',
          'Access on all devices'
        ]
      },
      {
        name: 'Yearly Plan',
        price: 199.99,
        currency: 'USD',
        duration: 'yearly',
        isPopular: false,
        features: [
          'Everything included in Monthly Access',
          'Full guide access for 12 months',
          'Priority updates when new content is added',
          'Best value for attorneys and legal researchers'
        ]
      }
    ];

    for (const plan of plans) {
      await prisma.subscriptionPlan.upsert({
        where: { name: plan.name },
        update: plan,
        create: plan
      });
      console.log(`- ${plan.name} seeded.`);
    }

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding plans:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedPlans();
