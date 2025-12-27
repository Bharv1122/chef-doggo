import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { calculateDailyCalories } from '@/lib/nutrition-utils';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// GET all dogs for logged-in user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any)?.id;

    const dogs = await prisma.dogProfile.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ dogs });
  } catch (error) {
    console.error('Get dogs error:', error);
    return NextResponse.json({ error: 'Failed to fetch dogs' }, { status: 500 });
  }
}

// POST create new dog profile
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any)?.id;
    const body = await req.json();

    const {
      name,
      breed,
      weight,
      age,
      size,
      lifeStage,
      activityLevel,
      allergies,
      healthConditions,
      dietaryRestrictions,
      nutritionPhilosophy,
    } = body;

    if (!name || !weight || !age || !size || !lifeStage || !activityLevel) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Calculate daily calories
    const dailyCalories = calculateDailyCalories(
      parseFloat(weight),
      parseFloat(age),
      activityLevel,
      lifeStage
    );

    const dog = await prisma.dogProfile.create({
      data: {
        userId,
        name,
        breed: breed ?? null,
        weight: parseFloat(weight),
        age: parseFloat(age),
        size,
        lifeStage,
        activityLevel,
        allergies: allergies ?? [],
        healthConditions: healthConditions ?? [],
        dietaryRestrictions: dietaryRestrictions ?? [],
        nutritionPhilosophy: nutritionPhilosophy ?? 'Balanced',
        dailyCalories,
      },
    });

    return NextResponse.json({ dog }, { status: 201 });
  } catch (error) {
    console.error('Create dog error:', error);
    return NextResponse.json({ error: 'Failed to create dog profile' }, { status: 500 });
  }
}