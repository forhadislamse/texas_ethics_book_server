
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
        duration: 'free',
        isPopular: false,
        features: [
          'Access to selected preview chapters',
          'Limited search functionality',
          'Read-only access to TOC',
          'Experience the digital interface'
        ]
      },
      {
        name: 'Monthly Plan',
        price: 899,
        currency: 'USD',
        duration: 'monthly',
        isPopular: true,
        features: [
          'Full access to all chapters and sections',
          'Powerful keyword search',
          'Practice Notes & Citations',
          'Ethics Opinions Database',
          'Case Law & AG Opinions',
          'Access on all devices'
        ]
      },
      {
        name: 'Yearly Plan',
        price: 2499,
        currency: 'USD',
        duration: 'yearly',
        isPopular: false,
        features: [
          'Everything in Monthly Access',
          'Cost-effective yearly billing',
          'Priority support',
          'Updates to all future editions'
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
