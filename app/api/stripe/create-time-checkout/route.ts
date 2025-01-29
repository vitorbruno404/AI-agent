import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-01-27.acacia',
});

// Debug log to see what price IDs we have
console.log('Available Price IDs:', {
  '10min': process.env.STRIPE_10MIN_PRICE_ID,
  '30min': process.env.STRIPE_30MIN_PRICE_ID,
  '60min': process.env.STRIPE_60MIN_PRICE_ID
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
    
    // Debug log
    console.log('Processing request for:', {
      duration,
      customerId,
      availablePriceId: TIME_PRODUCTS[duration as keyof typeof TIME_PRODUCTS]?.priceId
    });

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
      console.error('Price ID is missing for duration:', duration);
      return NextResponse.json(
        { error: `Price ID not configured for ${duration} minutes` },
        { status: 400 }
      );
    }

    // Verify the price exists in Stripe
    try {
      console.log('Attempting to retrieve price:', priceId);
      const price = await stripe.prices.retrieve(priceId);
      console.log('Successfully retrieved price:', {
        id: price.id,
        active: price.active,
        product: price.product
      });
    } catch (error) {
      console.error('Failed to retrieve price from Stripe:', error);
      return NextResponse.json(
        { 
          error: `Invalid price ID for ${duration} minutes`,
          details: error instanceof Error ? error.message : 'Unknown error',
          priceId: priceId // Include the price ID in the error for debugging
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
    console.error('Checkout session creation failed:', error);
    return NextResponse.json(
      { 
        error: 'Error creating checkout session', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 