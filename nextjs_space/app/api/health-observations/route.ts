import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

// GET /api/health-observations - Get health observations with optional filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const dogProfileId = searchParams.get('dogProfileId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '30');

    const whereClause: any = { userId: user.id };

    if (dogProfileId) {
      whereClause.dogProfileId = dogProfileId;
    }

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = new Date(startDate);
      if (endDate) whereClause.date.lte = new Date(endDate);
    }

    const observations = await prisma.healthObservation.findMany({
      where: whereClause,
      include: {
        dogProfile: {
          select: {
            id: true,
            name: true,
            breed: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
      take: limit,
    });

    return NextResponse.json({ observations });
  } catch (error: any) {
    console.error('Error fetching health observations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch health observations', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/health-observations - Create a new health observation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      dogProfileId,
      date,
      energyLevel,
      stoolQuality,
      coatCondition,
      symptoms,
      weight,
      notes,
    } = body;

    // Validate required fields
    if (!dogProfileId || !date) {
      return NextResponse.json(
        { error: 'Missing required fields: dogProfileId, date' },
        { status: 400 }
      );
    }

    // Verify dog profile belongs to user
    const dogProfile = await prisma.dogProfile.findFirst({
      where: {
        id: dogProfileId,
        userId: user.id,
      },
    });

    if (!dogProfile) {
      return NextResponse.json(
        { error: 'Dog profile not found' },
        { status: 404 }
      );
    }

    // Validate scales
    if (energyLevel && (energyLevel < 1 || energyLevel > 5)) {
      return NextResponse.json(
        { error: 'Energy level must be between 1-5' },
        { status: 400 }
      );
    }

    if (stoolQuality && (stoolQuality < 1 || stoolQuality > 5)) {
      return NextResponse.json(
        { error: 'Stool quality must be between 1-5' },
        { status: 400 }
      );
    }

    const validCoatConditions = ['excellent', 'good', 'fair', 'poor'];
    if (coatCondition && !validCoatConditions.includes(coatCondition)) {
      return NextResponse.json(
        { error: `Coat condition must be one of: ${validCoatConditions.join(', ')}` },
        { status: 400 }
      );
    }

    const observation = await prisma.healthObservation.create({
      data: {
        userId: user.id,
        dogProfileId,
        date: new Date(date),
        energyLevel: energyLevel || null,
        stoolQuality: stoolQuality || null,
        coatCondition: coatCondition || null,
        symptoms: symptoms || [],
        weight: weight ? parseFloat(weight) : null,
        notes: notes || null,
      },
      include: {
        dogProfile: {
          select: {
            id: true,
            name: true,
            breed: true,
          },
        },
      },
    });

    return NextResponse.json({ observation }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating health observation:', error);
    return NextResponse.json(
      { error: 'Failed to create health observation', details: error.message },
      { status: 500 }
    );
  }
}
