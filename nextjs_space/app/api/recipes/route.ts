import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// GET all recipes for logged-in user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any)?.id;
    const { searchParams } = new URL(req.url);
    const dogProfileId = searchParams.get('dogProfileId');

    const where: any = { userId };
    if (dogProfileId) {
      where.dogProfileId = dogProfileId;
    }

    const recipes = await prisma.recipe.findMany({
      where,
      include: {
        dogProfile: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ recipes });
  } catch (error) {
    console.error('Get recipes error:', error);
    return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 });
  }
}

// POST create new recipe
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any)?.id;
    const body = await req.json();

    const {
      dogProfileId,
      name,
      ingredients,
      instructions,
      nutritionSummary,
      supplements,
      servingSize,
      transitionGuide,
    } = body;

    if (!dogProfileId || !name || !ingredients || !instructions) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify dog profile ownership
    const dogProfile = await prisma.dogProfile.findFirst({
      where: {
        id: dogProfileId,
        userId,
      },
    });

    if (!dogProfile) {
      return NextResponse.json({ error: 'Dog profile not found' }, { status: 404 });
    }

    const recipe = await prisma.recipe.create({
      data: {
        userId,
        dogProfileId,
        name,
        ingredients,
        instructions,
        nutritionSummary,
        supplements,
        servingSize,
        transitionGuide: transitionGuide ?? [],
      },
    });

    return NextResponse.json({ recipe }, { status: 201 });
  } catch (error) {
    console.error('Create recipe error:', error);
    return NextResponse.json({ error: 'Failed to create recipe' }, { status: 500 });
  }
}