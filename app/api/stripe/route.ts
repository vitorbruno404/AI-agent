import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-01-27.acacia',
});

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const prices = await stripe.prices.list({
      active: true,
      limit: 10,
    });

    const priceMapping = {
      '10min': prices.data.find(price => price.metadata.duration === '10')?.id,
      '30min': prices.data.find(price => price.metadata.duration === '30')?.id,
      '60min': prices.data.find(price => price.metadata.duration === '60')?.id,
    };

    console.log('Available Price IDs:', priceMapping);

    return NextResponse.json(priceMapping);
  } catch (error) {
    console.error('Stripe API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prices' },
      { status: 500 }
    );
  }
}