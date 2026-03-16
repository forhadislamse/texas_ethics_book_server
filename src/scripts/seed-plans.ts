
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
        duration: 'free',
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
        price: 899,
        duration: 'monthly',
        isPopular: true,
        features: [
          'Full access to all chapters and sections',
          'Powerful keyword search',
          'Internal rule popups for quick reference',
          'External links to cases and opinions',
          'Access on desktop, tablet, and mobile'
        ]
      },
      {
        name: 'Yearly Plan',
        price: 2499,
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
