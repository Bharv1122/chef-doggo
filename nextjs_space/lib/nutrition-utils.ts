// Calorie calculation based on dog's weight, age, activity level, and life stage
export function calculateDailyCalories(
  weight: number,
  age: number,
  activityLevel: string,
  lifeStage: string
): number {
  // Base: RER (Resting Energy Requirement) = 70 * (weight in kg)^0.75
  const weightKg = weight * 0.453592;
  const rer = 70 * Math.pow(weightKg, 0.75);

  // Activity multipliers
  let multiplier = 1.6; // default for adult moderate activity

  if (lifeStage === 'puppy') {
    multiplier = age < 0.33 ? 3.0 : 2.0; // younger puppies need more
  } else if (lifeStage === 'senior') {
    multiplier = activityLevel === 'low' ? 1.2 : activityLevel === 'high' ? 1.6 : 1.4;
  } else {
    // adult
    multiplier = activityLevel === 'low' ? 1.4 : activityLevel === 'high' ? 2.0 : 1.6;
  }

  return Math.round(rer * multiplier);
}

// Toxic ingredients that must be blocked
export const TOXIC_INGREDIENTS = [
  'xylitol',
  'chocolate',
  'cocoa',
  'grapes',
  'raisins',
  'onions',
  'onion',
  'garlic',
  'macadamia nuts',
  'macadamia',
  'avocado',
  'alcohol',
  'beer',
  'wine',
  'liquor',
];

// Validate recipe for toxic ingredients
export function validateToxicIngredients(ingredients: string[]): {
  isSafe: boolean;
  toxicFound: string[];
} {
  const toxicFound: string[] = [];

  ingredients?.forEach?.((ingredient) => {
    const lowerIngredient = ingredient?.toLowerCase?.() ?? '';
    TOXIC_INGREDIENTS.forEach((toxic) => {
      if (lowerIngredient.includes(toxic)) {
        toxicFound.push(toxic);
      }
    });
  });

  return {
    isSafe: toxicFound.length === 0,
    toxicFound: [...new Set(toxicFound)],
  };
}

// AAFCO standards validation
export function validateAAFCOStandards(nutritionData: {
  protein: number;
  fat: number;
  calcium?: number;
  phosphorus?: number;
  lifeStage: string;
}): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  const minProtein = nutritionData.lifeStage === 'puppy' ? 22 : 18;
  const minFat = 5;
  const minCalcium = 0.5;
  const maxCalcium = 2.5;
  const minPhosphorus = 0.4;
  const maxPhosphorus = 1.6;

  if ((nutritionData?.protein ?? 0) < minProtein) {
    errors.push(`Protein must be at least ${minProtein}% for ${nutritionData.lifeStage} dogs`);
  }

  if ((nutritionData?.fat ?? 0) < minFat) {
    errors.push(`Fat must be at least ${minFat}%`);
  }

  if (nutritionData.calcium !== undefined && nutritionData.phosphorus !== undefined) {
    const caPhosphorusRatio = nutritionData.calcium / nutritionData.phosphorus;
    if (caPhosphorusRatio < 1 || caPhosphorusRatio > 2) {
      errors.push('Calcium to Phosphorus ratio must be between 1:1 and 2:1');
    }

    if (nutritionData.calcium < minCalcium || nutritionData.calcium > maxCalcium) {
      errors.push(`Calcium must be between ${minCalcium}% and ${maxCalcium}%`);
    }

    if (nutritionData.phosphorus < minPhosphorus || nutritionData.phosphorus > maxPhosphorus) {
      errors.push(`Phosphorus must be between ${minPhosphorus}% and ${maxPhosphorus}%`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Health condition specific recommendations
export function getHealthConditionRestrictions(healthConditions: string[]): {
  avoidIngredients: string[];
  recommendations: string[];
} {
  const avoidIngredients: string[] = [];
  const recommendations: string[] = [];

  healthConditions?.forEach?.((condition) => {
    const lowerCondition = condition?.toLowerCase?.() ?? '';
    
    if (lowerCondition.includes('pancreatitis')) {
      avoidIngredients.push('high-fat meats', 'fatty fish', 'organ meats');
      recommendations.push('Use lean proteins and keep fat content below 10%');
    }
    
    if (lowerCondition.includes('kidney') || lowerCondition.includes('renal')) {
      avoidIngredients.push('high-phosphorus foods', 'organ meats');
      recommendations.push('Reduce protein and phosphorus levels, consult vet for specific ratios');
    }
    
    if (lowerCondition.includes('diabetes') || lowerCondition.includes('diabetic')) {
      avoidIngredients.push('high-glycemic carbs', 'simple sugars');
      recommendations.push('Use complex carbohydrates and high-fiber ingredients');
    }
    
    if (lowerCondition.includes('heart') || lowerCondition.includes('cardiac')) {
      avoidIngredients.push('high-sodium foods');
      recommendations.push('Reduce sodium content and ensure adequate taurine');
    }
  });

  return {
    avoidIngredients: [...new Set(avoidIngredients)],
    recommendations: [...new Set(recommendations)],
  };
}