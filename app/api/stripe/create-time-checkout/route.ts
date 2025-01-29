import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-01-27.acacia',
});

// Log available environment variables (without sensitive data)
console.log('Environment variables check:', {
  has_secret_key: !!process.env.STRIPE_SECRET_KEY,
  has_10min_price: !!process.env.STRIPE_10MIN_PRICE_ID,
  has_30min_price: !!process.env.STRIPE_30MIN_PRICE_ID,
  has_60min_price: !!process.env.STRIPE_60MIN_PRICE_ID,
  base_url: process.env.NEXT_PUBLIC_BASE_URL,
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
  try {
    const { duration, customerId } = await request.json();
    console.log('Request received:', { duration, customerId });

    // Validate duration
    if (!TIME_PRODUCTS[duration as keyof typeof TIME_PRODUCTS]) {
      console.log('Invalid duration:', duration);
      return NextResponse.json(
        { error: `Invalid duration: ${duration}` },
        { status: 400 }
      );
    }

    const priceId = TIME_PRODUCTS[duration as keyof typeof TIME_PRODUCTS].priceId;
    console.log('Selected price ID:', priceId);

    if (!priceId) {
      console.log('Price ID not found for duration:', duration);
      return NextResponse.json(
        { error: `Price ID not configured for ${duration} minutes` },
        { status: 400 }
      );
    }

    // Log the checkout session parameters
    console.log('Creating checkout session with:', {
      mode: 'payment',
      priceId,
      customerId,
      successUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
    });

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
      customer: customerId || undefined,
      metadata: {
        duration: duration.toString(),
      },
    });

    console.log('Checkout session created:', { sessionId: session.id });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    // Log the full error
    console.error('Full error details:', error);

    if (error instanceof Stripe.errors.StripeError) {
      console.error('Stripe error:', {
        type: error.type,
        code: error.code,
        message: error.message,
      });
    }

    return NextResponse.json(
      { 
        error: 'Error creating checkout session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 