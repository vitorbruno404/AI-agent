import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-01-27.acacia',
});

// Log all environment variables (except secret key)
console.log('Environment Variables Check:', {
  STRIPE_10MIN_PRICE_ID: process.env.STRIPE_10MIN_PRICE_ID,
  STRIPE_30MIN_PRICE_ID: process.env.STRIPE_30MIN_PRICE_ID,
  STRIPE_60MIN_PRICE_ID: process.env.STRIPE_60MIN_PRICE_ID,
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL
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
    console.log('Attempting to use price ID:', priceId);
    
    if (!priceId) {
      console.log('Price ID is undefined for duration:', duration);
      return NextResponse.json(
        { error: `Price ID not configured for ${duration} minutes` },
        { status: 400 }
      );
    }

    // Verify the price exists in Stripe
    try {
      console.log('Retrieving price from Stripe:', priceId);
      const price = await stripe.prices.retrieve(priceId);
      console.log('Price retrieved successfully:', {
        id: price.id,
        active: price.active,
        currency: price.currency,
        unit_amount: price.unit_amount
      });
    } catch (error) {
      console.error('Error retrieving price from Stripe:', error);
      return NextResponse.json(
        { 
          error: `Invalid price ID for ${duration} minutes`,
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 400 }
      );
    }

    console.log('Creating checkout session with price:', priceId);
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

    console.log('Checkout session created successfully:', {
      id: session.id,
      url: session.url
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    return NextResponse.json(
      { 
        error: 'Error creating checkout session', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 