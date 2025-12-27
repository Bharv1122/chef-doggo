import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { generateRecipe } from '@/lib/recipe-generator';
import { getHealthConditionRestrictions } from '@/lib/nutrition-utils';
import { checkMedicationInteractions, getMedicationDisclaimerTier } from '@/lib/medication-interactions';
import { calculateRecipeCost } from '@/lib/cost-estimation';

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

    // Phase 1B: Check medication interactions
    const medications = (dogProfile.medications as string[]) ?? [];
    // Map ingredients from {name, amount} to {name, quantity} for compatibility
    const ingredientsForChecking = result.ingredients.map(ing => ({
      name: ing.name,
      quantity: ing.amount
    }));
    const medicationInteractions = checkMedicationInteractions(medications, ingredientsForChecking);
    const medicationTier = getMedicationDisclaimerTier(medicationInteractions);

    // Phase 1B: Calculate cost estimation
    const costEstimate = calculateRecipeCost(
      ingredientsForChecking,
      7, // servingsPerBatch - typically 7 days worth
      1, // servingsPerDay
      60 // default kibbleCostPerMonth
    );

    // Determine disclaimer tier (priority: critical > therapeutic > medication > standard)
    let disclaimerTier = 'standard';
    if (healthConditions.some(c => c.toLowerCase().includes('kidney') || c.toLowerCase().includes('pancreatitis'))) {
      disclaimerTier = 'therapeutic';
    } else if (medicationTier) {
      disclaimerTier = medicationTier;
    }

    return NextResponse.json({
      recipe: result,
      costEstimate,
      medicationInteractions,
      healthRestrictions: restrictions,
      disclaimerTier,
    });
  } catch (error) {
    console.error('Generate recipe error:', error);
    return NextResponse.json({ error: 'Failed to generate recipe' }, { status: 500 });
  }
}