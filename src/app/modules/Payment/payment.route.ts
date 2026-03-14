
import express from 'express';
import { PaymentController } from './payment.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router.post('/create-checkout-session', auth(), PaymentController.createCheckoutSession);
router.post('/webhook', express.raw({ type: 'application/json' }), PaymentController.handleWebhook);

export const PaymentRoutes = router;
