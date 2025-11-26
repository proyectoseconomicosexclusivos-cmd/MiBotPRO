import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import configRoutes from './routes/configuration.routes';
import settingsRoutes from './routes/settings.routes';
import paymentRoutes from './routes/payment.routes';
import adminRoutes from './routes/admin.routes';
import { stripeWebhook } from './controllers/payment.controller';

dotenv.config();

// Fix: Explicitly type `app` as `Express` to help resolve type conflicts
// with middleware handlers that were causing "No overload matches this call" errors.
const app: Express = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
}));


// Stripe webhook needs raw body, so we attach it before express.json()
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/configurations', configRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Export the app for Vercel
export default app;