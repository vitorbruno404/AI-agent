import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

// Add more detailed error checking for environment variables
const requiredEnvVars = {
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  STRIPE_10MIN_PRICE_ID: process.env.STRIPE_10MIN_PRICE_ID,
  STRIPE_30MIN_PRICE_ID: process.env.STRIPE_30MIN_PRICE_ID,
  STRIPE_60MIN_PRICE_ID: process.env.STRIPE_60MIN_PRICE_ID,
};

// Check all required environment variables
const missingEnvVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
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
  try {
    const { duration, customerId } = await request.json();

    console.log('Received request:', { duration, customerId });

    if (!duration) {
      return NextResponse.json(
        { error: 'Duration is required' },
        { status: 400 }
      );
    }

    const timeProduct = TIME_PRODUCTS[duration as keyof typeof TIME_PRODUCTS];
    if (!timeProduct) {
      return NextResponse.json(
        { error: `Invalid duration: ${duration}` },
        { status: 400 }
      );
    }

    if (!timeProduct.priceId) {
      return NextResponse.json(
        { error: `Price ID not configured for ${duration} minutes` },
        { status: 500 }
      );
    }

    console.log('Creating checkout session with:', {
      priceId: timeProduct.priceId,
      customerId,
      duration,
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: timeProduct.priceId,
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

    console.log('Checkout session created:', {
      sessionId: session.id,
      url: session.url,
    });

    if (!session.url) {
      throw new Error('No checkout URL in session response');
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Detailed error in create-time-checkout:', error);
    
    // More detailed error response
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = error instanceof Stripe.errors.StripeError
      ? {
          type: error.type,
          code: error.code,
          param: error.param,
        }
      : {};

    return NextResponse.json(
      {
        error: 'Error creating checkout session',
        details: errorMessage,
        ...errorDetails,
      },
      { status: 500 }
    );
  }
} 