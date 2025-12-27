import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { generateRecipe } from '@/lib/recipe-generator';
import { getHealthConditionRestrictions } from '@/lib/nutrition-utils';
import { checkMedicationInteractions, getMedicationDisclaimerTier } from '@/lib/medication-interactions';
import { calculateRecipeCost } from '@/lib/cost-estimation';
import { determineTCVMConstitution, checkTCVMAlignment } from '@/lib/tcvm';
import { determineDoshas, checkAyurvedicAlignment, detectConflicts } from '@/lib/ayurveda';
import { validateRecipeSafety, getSafetyReport } from '@/lib/safety-validation';

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

    // Phase 1C: P0 Safety Validation - HARD BLOCK on critical violations
    const ingredientsForSafety = result.ingredients.map(ing => ing.name);
    const safetyCheck = validateRecipeSafety({
      ingredients: ingredientsForSafety,
      healthConditions,
      nutrients: {
        protein: result.nutrients?.protein,
        fat: result.nutrients?.fat,
      },
      weight: dogProfile.weight,
      dailyCalories: dogProfile.dailyCalories ?? 0,
      portionCalories: result.dailyCalories,
    });

    // HARD BLOCK if critical safety violations found
    if (safetyCheck.hardBlock) {
      const safetyReport = getSafetyReport(safetyCheck);
      return NextResponse.json(
        {
          error: `SAFETY VIOLATION: Recipe cannot be generated.\\n\\n${safetyReport}`,
          disclaimerTier: 'critical',
          healthRestrictions: restrictions,
          safetyViolations: safetyCheck.violations,
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

    // Phase 1C: Holistic medicine integration (TCVM & Ayurveda)
    let holisticRecommendations: any = null;
    let holisticConflicts: any[] = [];

    if (dogProfile.useTCVM || dogProfile.useAyurveda) {
      const dogCharacteristics = {
        age: dogProfile.age,
        weight: dogProfile.weight,
        breed: dogProfile.breed,
        activityLevel: dogProfile.activityLevel,
        healthConditions: healthConditions,
        temperament: 'balanced', // Default - could be added to profile later
      };

      holisticRecommendations = {};

      if (dogProfile.useTCVM) {
        const tcvmConstitution = determineTCVMConstitution(dogCharacteristics);
        const tcvmAlignment = checkTCVMAlignment(
          ingredientsForChecking.map(ing => ing.name),
          tcvmConstitution
        );
        holisticRecommendations.tcvm = {
          constitution: tcvmConstitution,
          alignment: tcvmAlignment,
        };
      }

      if (dogProfile.useAyurveda) {
        const doshas = determineDoshas(dogCharacteristics);
        const ayurvedicAlignment = checkAyurvedicAlignment(
          ingredientsForChecking.map(ing => ing.name),
          doshas.primary
        );
        holisticRecommendations.ayurveda = {
          doshas,
          alignment: ayurvedicAlignment,
        };
      }

      // Check for conflicts between TCVM and Ayurveda
      if (dogProfile.useTCVM && dogProfile.useAyurveda) {
        holisticConflicts = detectConflicts(
          ingredientsForChecking.map(ing => ing.name),
          holisticRecommendations.tcvm.constitution,
          holisticRecommendations.ayurveda.doshas.primary
        );
      }
    }

    // Determine disclaimer tier (priority: critical > therapeutic > holistic > medication > standard)
    let disclaimerTier = 'standard';
    if (healthConditions.some(c => c.toLowerCase().includes('kidney') || c.toLowerCase().includes('pancreatitis'))) {
      disclaimerTier = 'therapeutic';
    } else if (holisticConflicts.length > 0) {
      disclaimerTier = 'holistic';
    } else if (medicationTier) {
      disclaimerTier = medicationTier;
    }

    return NextResponse.json({
      recipe: result,
      costEstimate,
      medicationInteractions,
      healthRestrictions: restrictions,
      holisticRecommendations,
      holisticConflicts,
      safetyCheck: safetyCheck.isSafe ? null : safetyCheck,
      disclaimerTier,
    });
  } catch (error) {
    console.error('Generate recipe error:', error);
    return NextResponse.json({ error: 'Failed to generate recipe' }, { status: 500 });
  }
}