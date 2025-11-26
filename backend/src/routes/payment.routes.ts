import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { createCheckoutSession } from '../controllers/payment.controller';

const router = Router();

router.post('/create-checkout-session', protect, createCheckoutSession);

// The stripe webhook is defined in server.ts to handle raw body parsing correctly

export default router;