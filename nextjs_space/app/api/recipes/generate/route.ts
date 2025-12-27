import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { generateRecipe } from '@/lib/recipe-generator';
import { getHealthConditionRestrictions } from '@/lib/nutrition-utils';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// POST generate recipe
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any)?.id;
    const body = await req.json();

    const { dogProfileId, kibbleNutrition } = body;

    if (!dogProfileId || !kibbleNutrition) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get dog profile
    const dogProfile = await prisma.dogProfile.findFirst({
      where: {
        id: dogProfileId,
        userId,
      },
    });

    if (!dogProfile) {
      return NextResponse.json({ error: 'Dog profile not found' }, { status: 404 });
    }

    // Check health conditions for critical warnings
    const healthConditions = (dogProfile.healthConditions as string[]) ?? [];
    const restrictions = getHealthConditionRestrictions(healthConditions);

    // Generate recipe
    const result = generateRecipe({
      dogName: dogProfile.name,
      dogWeight: dogProfile.weight,
      lifeStage: dogProfile.lifeStage,
      dailyCalories: dogProfile.dailyCalories ?? 0,
      nutritionPhilosophy: dogProfile.nutritionPhilosophy ?? undefined,
      allergies: (dogProfile.allergies as string[]) ?? [],
      healthConditions,
      dietaryRestrictions: (dogProfile.dietaryRestrictions as string[]) ?? [],
      kibbleNutrition: {
        protein: parseFloat(kibbleNutrition.protein),
        fat: parseFloat(kibbleNutrition.fat),
        fiber: parseFloat(kibbleNutrition.fiber),
        calcium: kibbleNutrition.calcium ? parseFloat(kibbleNutrition.calcium) : undefined,
        phosphorus: kibbleNutrition.phosphorus ? parseFloat(kibbleNutrition.phosphorus) : undefined,
      },
    });

    // Check if generation failed
    if ('error' in result) {
      // Check if it's a critical/hard block error
      const isCritical = result.error.includes('DANGEROUS') || result.error.includes('toxic');
      return NextResponse.json(
        {
          error: result.error,
          disclaimerTier: isCritical ? 'critical' : 'standard',
          healthRestrictions: restrictions,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      recipe: result,
      healthRestrictions: restrictions,
      disclaimerTier: 'standard',
    });
  } catch (error) {
    console.error('Generate recipe error:', error);
    return NextResponse.json({ error: 'Failed to generate recipe' }, { status: 500 });
  }
}