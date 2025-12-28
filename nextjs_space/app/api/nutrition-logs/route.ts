import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

// GET /api/nutrition-logs - Get nutrition logs with optional filters
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

    const logs = await prisma.nutritionLog.findMany({
      where: whereClause,
      include: {
        dogProfile: {
          select: {
            id: true,
            name: true,
            breed: true,
          },
        },
        recipe: {
          select: {
            id: true,
            name: true,
            recipeImageUrl: true,
            nutritionSummary: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
      take: limit,
    });

    return NextResponse.json({ logs });
  } catch (error: any) {
    console.error('Error fetching nutrition logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nutrition logs', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/nutrition-logs - Create a new nutrition log entry
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
      recipeId,
      customEntry,
      portionSize,
      treats,
      waterIntake,
      notes,
    } = body;

    // Validate required fields
    if (!dogProfileId || !date || !portionSize) {
      return NextResponse.json(
        { error: 'Missing required fields: dogProfileId, date, portionSize' },
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

    // If recipeId provided, verify it exists
    if (recipeId) {
      const recipe = await prisma.recipe.findFirst({
        where: {
          id: recipeId,
          userId: user.id,
        },
      });

      if (!recipe) {
        return NextResponse.json(
          { error: 'Recipe not found' },
          { status: 404 }
        );
      }
    }

    const log = await prisma.nutritionLog.create({
      data: {
        userId: user.id,
        dogProfileId,
        date: new Date(date),
        recipeId: recipeId || null,
        customEntry: customEntry || null,
        portionSize: parseFloat(portionSize),
        treats: treats || null,
        waterIntake: waterIntake ? parseFloat(waterIntake) : null,
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
        recipe: {
          select: {
            id: true,
            name: true,
            recipeImageUrl: true,
            nutritionSummary: true,
          },
        },
      },
    });

    return NextResponse.json({ log }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating nutrition log:', error);
    return NextResponse.json(
      { error: 'Failed to create nutrition log', details: error.message },
      { status: 500 }
    );
  }
}
