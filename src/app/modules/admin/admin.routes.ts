import { UserRole } from '@prisma/client';
import express from 'express';
import auth from '../../middlewares/auth';
import { AdminController } from './admin.controller';

const router = express.Router();

router.get(
  '/paid-transactions',
  auth(UserRole.ADMIN),
  AdminController.getAllPaidTransactions
);

router.get(
  '/users',
  auth(UserRole.ADMIN),
  AdminController.getAllUsers
);

router.get(
  '/dashboard-stats',
  auth(UserRole.ADMIN),
  AdminController.getDashboardStats
);

router.get(
  '/subscriptions',
  auth(UserRole.ADMIN),
  AdminController.getSubscriptionAnalytics
);

export const AdminRoutes = router;
