import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get('customerId');

  if (!customerId) {
    return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
  }

  try {
    const activePurchase = await prisma.timePurchase.findFirst({
      where: {
        customerId,
        expiresAt: {
          gt: new Date(),
        },
        remainingTime: {
          gt: 0,
        },
      },
      orderBy: {
        expiresAt: 'desc',
      },
    });

    if (!activePurchase) {
      return NextResponse.json({
        remainingTime: 0,
        expiresAt: Date.now(),
      });
    }

    return NextResponse.json({
      remainingTime: activePurchase.remainingTime,
      expiresAt: activePurchase.expiresAt.getTime(),
    });
  } catch (error) {
    console.error('Error fetching time remaining:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time remaining' },
      { status: 500 }
    );
  }
} 