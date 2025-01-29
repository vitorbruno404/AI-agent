import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get('customerId');

  if (!customerId) {
    return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
  }

  try {
    // Here you would:
    // 1. Query your database for the customer's time purchase
    // 2. Check if it's still valid
    // 3. Calculate remaining time
    
    // This is a placeholder response
    const remainingTime = 0; // Replace with actual DB query
    const expiresAt = Date.now() + (remainingTime * 1000);

    return NextResponse.json({
      remainingTime,
      expiresAt
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch time remaining' }, { status: 500 });
  }
} 