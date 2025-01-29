import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

// Add error handling for missing API key
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-01-27.acacia',
});

const TIME_PRODUCTS = {
  10: {
    priceId: process.env.STRIPE_10MIN_PRICE_ID,
    amount: 1500, // $15.00
  },
  30: {
    priceId: process.env.STRIPE_30MIN_PRICE_ID,
    amount: 2500, // $25.00
  },
  60: {
    priceId: process.env.STRIPE_60MIN_PRICE_ID,
    amount: 4500, // $45.00
  },
};

export async function POST(request: NextRequest) {
  if (!process.env.NEXT_PUBLIC_BASE_URL) {
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  try {
    const { duration, customerId } = await request.json();

    if (!TIME_PRODUCTS[duration as keyof typeof TIME_PRODUCTS]) {
      return NextResponse.json({ error: 'Invalid duration' }, { status: 400 });
    }

    const priceId = TIME_PRODUCTS[duration as keyof typeof TIME_PRODUCTS].priceId;
    if (!priceId) {
      return NextResponse.json(
        { error: `Price ID not configured for ${duration} minutes` },
        { status: 500 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
      customer: customerId,
      metadata: {
        duration: duration.toString(),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Error creating checkout session' },
      { status: 500 }
    );
  }
} 