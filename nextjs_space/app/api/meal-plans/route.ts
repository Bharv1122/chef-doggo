import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

// GET /api/meal-plans - Get all meal plans for logged-in user
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

    // Get query params for filtering
    const searchParams = request.nextUrl.searchParams;
    const dogProfileId = searchParams.get('dogProfileId');
    const active = searchParams.get('active'); // 'true' to get only active plans

    const now = new Date();
    const whereClause: any = { userId: user.id };

    if (dogProfileId) {
      whereClause.dogProfileId = dogProfileId;
    }

    if (active === 'true') {
      whereClause.startDate = { lte: now };
      whereClause.OR = [
        { endDate: null },
        { endDate: { gte: now } },
      ];
    }

    const mealPlans = await prisma.mealPlan.findMany({
      where: whereClause,
      include: {
        dogProfile: {
          select: {
            id: true,
            name: true,
            breed: true,
          },
        },
        entries: {
          include: {
            recipe: {
              select: {
                id: true,
                name: true,
                recipeImageUrl: true,
              },
            },
          },
          orderBy: {
            date: 'asc',
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    return NextResponse.json({ mealPlans });
  } catch (error: any) {
    console.error('Error fetching meal plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meal plans', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/meal-plans - Create a new meal plan
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
    const { dogProfileId, name, startDate, endDate } = body;

    // Validate required fields
    if (!dogProfileId || !name || !startDate) {
      return NextResponse.json(
        { error: 'Missing required fields: dogProfileId, name, startDate' },
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
        { error: 'Dog profile not found or does not belong to user' },
        { status: 404 }
      );
    }

    // Create meal plan
    const mealPlan = await prisma.mealPlan.create({
      data: {
        userId: user.id,
        dogProfileId,
        name,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
      },
      include: {
        dogProfile: {
          select: {
            id: true,
            name: true,
            breed: true,
          },
        },
        entries: true,
      },
    });

    return NextResponse.json({ mealPlan }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating meal plan:', error);
    return NextResponse.json(
      { error: 'Failed to create meal plan', details: error.message },
      { status: 500 }
    );
  }
}
