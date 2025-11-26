import { RequestHandler } from 'express';
import Stripe from 'stripe';
import prisma from '../db';
import { BOT_PRICES } from '../constants';

const stripe = new Stripe(process.env.STRIPE_API_KEY!);

const getPriceForTemplate = (templateId: string): number | null => {
    return BOT_PRICES[templateId] || null;
}

export const createCheckoutSession: RequestHandler = async (req, res) => {
    const { configId } = req.body;
    const userId = req.user!.id;

    try {
        const config = await prisma.userConfiguration.findFirst({
            where: { id: configId, userId: userId },
        });

        if (!config) {
            return res.status(404).json({ message: 'Configuration not found' });
        }

        const priceInEur = getPriceForTemplate(config.templateId);

        if (priceInEur === null) {
            return res.status(400).json({ message: 'Invalid bot template or price not found' });
        }

        const priceInCents = priceInEur * 100;
        const frontendUrl = process.env.FRONTEND_URL;

        if (!frontendUrl) {
            return res.status(500).json({ message: 'Server configuration error.' });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: config.templateTitle,
                            description: `Suscripción mensual para el bot de ${config.businessName}`,
                        },
                        unit_amount: priceInCents,
                        recurring: { interval: 'month' } 
                    },
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${frontendUrl}/#/dashboard?payment=success`,
            cancel_url: `${frontendUrl}/#/dashboard?payment=cancelled`,
            metadata: {
                configId: config.id,
                userId: userId.toString(),
            },
            subscription_data: {
                metadata: {
                    configId: config.id, 
                    userId: userId.toString()
                }
            }
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Stripe session error:', error);
        res.status(500).json({ message: 'Error creating payment session' });
    }
};

export const stripeWebhook: RequestHandler = async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.log(`Webhook signature verification failed.`, errorMessage);
        return res.status(400).send(`Webhook Error: ${errorMessage}`);
    }

    const handleSubscriptionUpdate = async (configId: string, status: string, subscriptionId?: string) => {
        if (!configId) return;
        try {
            const data: any = { status: status };
            // In a real schema we would save the subscriptionId too
            // if (subscriptionId) data.stripeSubscriptionId = subscriptionId;
            
            await prisma.userConfiguration.update({
                where: { id: configId },
                data: data
            });
            console.log(`UPDATED STATUS for ${configId} to ${status}`);
        } catch (e) {
            console.error(`Failed to update config ${configId}`, e);
        }
    };

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const { configId } = session.metadata!;
                
                // Active status immediately upon successful checkout
                await handleSubscriptionUpdate(configId, 'active', session.subscription as string);
                break;
            }

            case 'invoice.payment_failed': {
                // CRITICAL: This event fires when the monthly recurring payment fails
                const invoice = event.data.object as Stripe.Invoice;
                if (invoice.subscription) {
                    const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription.id;
                    
                    // Retrieve subscription to get metadata (configId)
                    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                    const configId = subscription.metadata.configId;

                    if (configId) {
                        console.log(`⛔ PAYMENT FAILED for ${configId}. Suspending service.`);
                        await handleSubscriptionUpdate(configId, 'suspended');
                    }
                }
                break;
            }
            
            case 'customer.subscription.deleted': {
                // Handle cancellation
                const subscription = event.data.object as Stripe.Subscription;
                const configId = subscription.metadata.configId;
                if (configId) {
                    console.log(`🗑️ SUBSCRIPTION DELETED for ${configId}. Suspending service.`);
                    await handleSubscriptionUpdate(configId, 'suspended');
                }
                break;
            }

            case 'invoice.payment_succeeded': {
                // Handle renewal success (reactivate if it was suspended)
                const invoice = event.data.object as Stripe.Invoice;
                if (invoice.subscription && invoice.billing_reason === 'subscription_cycle') {
                     const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription.id;
                     const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                     const configId = subscription.metadata.configId;
                     
                     if (configId) {
                         console.log(`✅ RENEWAL SUCCESS for ${configId}. Ensuring active status.`);
                         await handleSubscriptionUpdate(configId, 'active');
                     }
                }
                break;
            }
        }
    } catch (err) {
        console.error("Webhook processing error:", err);
        return res.status(500).send("Webhook processing error");
    }

    res.status(200).send();
};