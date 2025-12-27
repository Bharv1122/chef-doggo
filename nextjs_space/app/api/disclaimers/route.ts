import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// POST create disclaimer acknowledgment
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any)?.id;
    const body = await req.json();

    const { dogProfileId, recipeId, disclaimerTier } = body;

    if (!disclaimerTier) {
      return NextResponse.json({ error: 'Missing disclaimerTier' }, { status: 400 });
    }

    // Get IP address
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') ?? 'unknown';

    const acknowledgment = await prisma.disclaimerAcknowledgment.create({
      data: {
        userId,
        dogProfileId: dogProfileId ?? null,
        recipeId: recipeId ?? null,
        disclaimerTier,
        ipAddress: ip,
      },
    });

    return NextResponse.json({ acknowledgment }, { status: 201 });
  } catch (error) {
    console.error('Create disclaimer acknowledgment error:', error);
    return NextResponse.json({ error: 'Failed to create acknowledgment' }, { status: 500 });
  }
}