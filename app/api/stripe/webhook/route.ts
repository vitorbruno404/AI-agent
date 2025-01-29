import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

// Check environment variables at startup
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error('STRIPE_WEBHOOK_SECRET is not defined in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-01-27.acacia',
});
const prisma = new PrismaClient();

const DURATION_TO_SECONDS = {
  10: 600,   // 10 minutes in seconds
  30: 1800,  // 30 minutes in seconds
  60: 3600   // 60 minutes in seconds
};

// Use the new route segment config
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Get customer ID and duration from the session
      const customerId = session.customer as string;
      const duration = parseInt(session.metadata?.duration || '0');
      
      if (!duration || !DURATION_TO_SECONDS[duration as keyof typeof DURATION_TO_SECONDS]) {
        console.error('Invalid duration:', duration);
        return NextResponse.json(
          { error: 'Invalid duration' },
          { status: 400 }
        );
      }

      // Calculate time in seconds
      const timeInSeconds = DURATION_TO_SECONDS[duration as keyof typeof DURATION_TO_SECONDS];
      
      // Set expiration date (30 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      // Create new time purchase record
      await prisma.timePurchase.create({
        data: {
          customerId,
          remainingTime: timeInSeconds,
          expiresAt,
          stripeSessionId: session.id,
        },
      });

      console.log(`Added ${timeInSeconds} seconds for customer ${customerId}`);
      return NextResponse.json({ received: true });
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

export const config = {
  api: {
    bodyParser: false,
  },
}; 