import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { generateRecipe } from '@/lib/recipe-generator';
import { getHealthConditionRestrictions } from '@/lib/nutrition-utils';
import { checkMedicationInteractions, getMedicationDisclaimerTier } from '@/lib/medication-interactions';
import { calculateRecipeCost } from '@/lib/cost-estimation';
import { determineTCVMConstitution, checkTCVMAlignment } from '@/lib/tcvm';
import { determineDosha, checkAyurvedaAlignment, detectHolisticConflicts } from '@/lib/ayurveda';
import { validateRecipeSafety, getSafetyReport } from '@/lib/safety-validation';
import { getBreedHealthInfo } from '@/lib/breed-health-database';

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
        protein: result.nutritionSummary?.protein,
        fat: result.nutritionSummary?.fat,
      },
      weight: dogProfile.weight,
      dailyCalories: dogProfile.dailyCalories ?? 0,
      portionCalories: result.nutritionSummary?.calories,
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

    // Phase 2: Enhanced holistic medicine integration (TCVM & Ayurveda)
    let holisticRecommendations: any = null;
    let holisticConflicts: any = null;
    let thermalNatureAnalysis: any = null;

    const hasHolisticOptions = dogProfile.tcvmConstitution || dogProfile.tcvmThermalNature || dogProfile.ayurvedicDosha || dogProfile.conditionDiet;

    if (hasHolisticOptions) {
      holisticRecommendations = {};
      const ingredients = ingredientsForChecking.map(ing => ing.name);

      // TCVM Analysis
      if (dogProfile.tcvmConstitution || dogProfile.tcvmThermalNature) {
        // Use explicit constitution if provided, otherwise determine from health conditions
        const tcvmConstitution = dogProfile.tcvmConstitution 
          ? determineTCVMConstitution(healthConditions) 
          : determineTCVMConstitution(healthConditions);
        
        // Check alignment for each ingredient
        const alignmentResults = ingredients.map(ingredient => ({
          ingredient,
          ...checkTCVMAlignment(ingredient, tcvmConstitution)
        }));
        
        const aligned = alignmentResults.filter(r => r.aligned);
        const misaligned = alignmentResults.filter(r => !r.aligned);
        
        // Import thermal nature function
        const { TCVM_FOOD_ENERGETICS } = require('@/lib/tcvm');
        
        // Add thermal nature for each ingredient
        const ingredientThermalNature = ingredients.map(ing => ({
          ingredient: ing,
          thermalNature: TCVM_FOOD_ENERGETICS[ing.toLowerCase()] || 'neutral',
        }));
        
        holisticRecommendations.tcvm = {
          constitution: tcvmConstitution.constitution,
          thermalNature: dogProfile.tcvmThermalNature || 'auto-detected',
          aligned: aligned.map(r => r.ingredient),
          misaligned: misaligned.map(r => ({ ingredient: r.ingredient, note: r.note })),
          ingredientThermalNature,
          recommendations: tcvmConstitution.recommendations,
        };
        
        thermalNatureAnalysis = ingredientThermalNature;
      }

      // Ayurveda Analysis
      if (dogProfile.ayurvedicDosha) {
        // Determine size based on weight
        let size = 'medium';
        if (dogProfile.weight < 25) size = 'small';
        else if (dogProfile.weight > 60) size = 'large';

        // Always use determineDosha to get full profile structure
        const ayurvedaProfile = determineDosha(size, dogProfile.activityLevel, healthConditions);
        
        // Check alignment for each ingredient
        const alignmentResults = ingredients.map(ingredient => ({
          ingredient,
          ...checkAyurvedaAlignment(ingredient, ayurvedaProfile)
        }));
        
        const aligned = alignmentResults.filter(r => r.aligned);
        const misaligned = alignmentResults.filter(r => !r.aligned);
        
        holisticRecommendations.ayurveda = {
          dosha: ayurvedaProfile.primaryDosha,
          aligned: aligned.map(r => r.ingredient),
          misaligned: misaligned.map(r => ({ ingredient: r.ingredient, note: r.note })),
          recommendations: ayurvedaProfile.recommendations,
        };
      }

      // Condition-Specific Diet Notes
      if (dogProfile.conditionDiet) {
        const conditionDietNotes: Record<string, string> = {
          'anti-inflammatory': 'Recipe focuses on omega-3 rich ingredients and antioxidants to reduce inflammation.',
          'ketogenic': 'High-fat, low-carb recipe designed for ketogenic diet. Requires veterinary supervision.',
          'renal': 'Low protein, low phosphorus recipe to support kidney health.',
          'cardiac': 'Low sodium recipe to support heart health.',
          'diabetic': 'High fiber, complex carbs for stable blood sugar levels.',
          'elimination': 'Single protein source to identify food sensitivities.',
        };
        
        holisticRecommendations.conditionDiet = {
          type: dogProfile.conditionDiet,
          notes: conditionDietNotes[dogProfile.conditionDiet] || 'Specialized therapeutic diet.',
        };
      }

      // Check for conflicts between TCVM and Ayurveda
      if ((dogProfile.tcvmConstitution || dogProfile.tcvmThermalNature) && dogProfile.ayurvedicDosha) {
        const tcvmMisaligned = holisticRecommendations.tcvm?.misaligned.map((m: any) => m.ingredient) || [];
        const tcvmAligned = holisticRecommendations.tcvm?.aligned || [];
        const ayurvedaMisaligned = holisticRecommendations.ayurveda?.misaligned.map((m: any) => m.ingredient) || [];
        const ayurvedaAligned = holisticRecommendations.ayurveda?.aligned || [];
        
        holisticConflicts = detectHolisticConflicts(
          tcvmMisaligned,
          tcvmAligned,
          ayurvedaMisaligned,
          ayurvedaAligned
        );
      }
    }

    // Determine disclaimer tier (priority: critical > therapeutic > holistic > medication > standard)
    let disclaimerTier = 'standard';
    if (healthConditions.some(c => c.toLowerCase().includes('kidney') || c.toLowerCase().includes('pancreatitis'))) {
      disclaimerTier = 'therapeutic';
    } else if (holisticConflicts && holisticConflicts.hasConflict) {
      disclaimerTier = 'holistic';
    } else if (medicationTier) {
      disclaimerTier = medicationTier;
    }

    // Get breed-specific health information
    const breedHealthInfo = dogProfile.breed ? getBreedHealthInfo(dogProfile.breed) : null;
    const breedWarnings = breedHealthInfo ? {
      breed: breedHealthInfo.breed,
      commonIssues: breedHealthInfo.commonIssues,
      dietaryConsiderations: breedHealthInfo.dietaryConsiderations,
      riskFactors: breedHealthInfo.riskFactors,
    } : null;

    return NextResponse.json({
      recipe: result,
      costEstimate,
      medicationInteractions,
      healthRestrictions: restrictions,
      holisticRecommendations,
      holisticConflicts,
      thermalNatureAnalysis,
      safetyCheck: safetyCheck.isSafe ? null : safetyCheck,
      breedWarnings,
      disclaimerTier,
    });
  } catch (error) {
    console.error('Generate recipe error:', error);
    return NextResponse.json({ error: 'Failed to generate recipe' }, { status: 500 });
  }
}