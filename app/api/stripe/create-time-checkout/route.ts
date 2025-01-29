import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-01-27.acacia',
});

// Log available environment variables (without exposing sensitive data)
console.log('Environment variables check:', {
  hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
  hasBaseUrl: !!process.env.NEXT_PUBLIC_BASE_URL,
  has10MinPrice: !!process.env.STRIPE_10MIN_PRICE_ID,
  has30MinPrice: !!process.env.STRIPE_30MIN_PRICE_ID,
  has60MinPrice: !!process.env.STRIPE_60MIN_PRICE_ID,
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

    // Log the selected price ID
    const selectedProduct = TIME_PRODUCTS[duration as keyof typeof TIME_PRODUCTS];
    console.log('Selected product:', {
      duration,
      priceId: selectedProduct?.priceId,
      amount: selectedProduct?.amount
    });

    if (!selectedProduct || !selectedProduct.priceId) {
      throw new Error(`Invalid or missing price ID for duration: ${duration}`);
    }

    // Verify the price exists in Stripe before creating the session
    try {
      const price = await stripe.prices.retrieve(selectedProduct.priceId);
      console.log('Price verified in Stripe:', {
        priceId: price.id,
        active: price.active
      });
    } catch (priceError) {
      console.error('Error verifying price:', priceError);
      throw new Error(`Invalid price ID: ${selectedProduct.priceId}`);
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: selectedProduct.priceId,
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

    console.log('Session created successfully:', {
      sessionId: session.id,
      hasUrl: !!session.url
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Detailed checkout error:', error);
    return NextResponse.json(
      { 
        error: 'Error creating checkout session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 