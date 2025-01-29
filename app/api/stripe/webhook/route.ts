import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-01-01',
});
const prisma = new PrismaClient();

export async function POST(request: Request) {
  const payload = await request.text();
  const sig = request.headers.get('stripe-signature')!;

  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const duration = parseInt(session.metadata?.duration || '0');
      
      if (duration && session.customer) {
        await prisma.timePurchase.create({
          data: {
            customerId: session.customer.toString(),
            duration,
            remainingTime: duration * 60, // Convert minutes to seconds
            expiresAt: new Date(Date.now() + duration * 60 * 1000), // Current time + duration
          },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
} 