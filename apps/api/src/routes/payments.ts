import { Router } from 'express';
import Stripe from 'stripe';
import { prisma } from '../util/prisma.js';

export const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-06-20' });

router.post('/create-intent', async (req, res) => {
	const { amountCents, currency = 'usd', tripId } = req.body || {};
	if (!amountCents || !tripId) return res.status(400).json({ message: 'Missing amountCents or tripId' });
	const intent = await stripe.paymentIntents.create({ amount: amountCents, currency, automatic_payment_methods: { enabled: true } });
	await prisma.payment.create({ data: { tripId, provider: 'STRIPE', providerPaymentId: intent.id, status: 'PENDING' } });
	res.json({ clientSecret: intent.client_secret });
});

router.post('/webhook', async (req, res) => {
	const signature = req.headers['stripe-signature'];
	const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
	let event: Stripe.Event;
	try {
		if (!signature || !webhookSecret) throw new Error('Missing signature');
		event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
	} catch (err: any) {
		return res.status(400).send(`Webhook Error: ${err.message}`);
	}
	try {
		switch (event.type) {
			case 'payment_intent.succeeded': {
				const pi = event.data.object as Stripe.PaymentIntent;
				await prisma.payment.update({ where: { providerPaymentId: pi.id }, data: { status: 'SUCCEEDED' } });
				break;
			}
			case 'payment_intent.payment_failed': {
				const pi = event.data.object as Stripe.PaymentIntent;
				await prisma.payment.update({ where: { providerPaymentId: pi.id }, data: { status: 'FAILED' } });
				break;
			}
		}
		res.json({ received: true });
	} catch (e: any) {
		res.status(500).json({ message: e.message });
	}
});