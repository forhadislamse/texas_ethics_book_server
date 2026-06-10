import express from 'express';
import { PaymentController } from './payment.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router.post('/create-subscription-intent', auth(), PaymentController.createSubscriptionIntent);
router.post('/confirm-payment/:id', auth(), PaymentController.confirmPayment);
router.get('/my-payment-history', auth(), PaymentController.getMyPaymentHistory);
router.post('/webhook', PaymentController.handleWebhook);

export const PaymentRoutes = router;
