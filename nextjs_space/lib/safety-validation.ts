/**
 * P0 Safety Validation Layer
 * Critical safety checks for all generated recipes
 * Hard blocks on dangerous combinations
 */

export interface SafetyViolation {
  severity: 'critical' | 'high' | 'moderate';
  category: string;
  message: string;
  ingredients?: string[];
}

export interface SafetyCheckResult {
  isSafe: boolean;
  violations: SafetyViolation[];
  hardBlock: boolean;
}

// Comprehensive toxic ingredients database
const TOXIC_INGREDIENTS = [
  // P0 Critical - Always fatal or severely toxic
  'chocolate', 'cocoa', 'theobromine',
  'xylitol', 'birch sugar',
  'grapes', 'raisins', 'currants',
  'onions', 'garlic', 'leeks', 'shallots', 'chives',
  'macadamia nuts', 'macadamia',
  'avocado', 'persin',
  'alcohol', 'ethanol', 'beer', 'wine', 'liquor',
  'caffeine', 'coffee', 'tea',
  'raw yeast', 'bread dough',
  
  // P1 High risk - Highly toxic
  'nutmeg',
  'star anise',
  'hops',
  'moldy food', 'moldy',
  'raw potato', 'potato skin', 'green potato',
  'rhubarb', 'rhubarb leaves',
  'cherry pits', 'peach pits', 'apricot pits', 'plum pits',
  'apple seeds',
  'mushrooms', 'wild mushrooms',
  
  // Artificial sweeteners
  'aspartame', 'sucralose', 'stevia',
  
  // Preservatives and additives
  'msg', 'monosodium glutamate',
  'propylene glycol',
];

// Dangerous ingredient combinations
const DANGEROUS_COMBINATIONS = [
  {
    ingredients: ['liver', 'vitamin a supplement'],
    reason: 'Excessive Vitamin A can cause toxicity',
    severity: 'high' as const,
  },
  {
    ingredients: ['calcium supplement', 'vitamin d supplement'],
    reason: 'Excessive calcium + Vitamin D can cause hypercalcemia',
    severity: 'high' as const,
  },
  {
    ingredients: ['fish oil', 'vitamin e deficiency'],
    reason: 'High omega-3 without Vitamin E can cause deficiency',
    severity: 'moderate' as const,
  },
];

// Health condition restrictions
const HEALTH_CONDITION_RESTRICTIONS: Record<string, {
  bannedIngredients: string[];
  maxNutrients?: { protein?: number; fat?: number; sodium?: number; phosphorus?: number };
  reason: string;
}> = {
  'kidney disease': {
    bannedIngredients: ['organ meats', 'liver', 'kidney', 'sardines'],
    maxNutrients: { protein: 18, phosphorus: 0.4 },
    reason: 'High phosphorus and protein can worsen kidney function',
  },
  'chronic kidney disease': {
    bannedIngredients: ['organ meats', 'liver', 'kidney', 'sardines'],
    maxNutrients: { protein: 18, phosphorus: 0.4 },
    reason: 'High phosphorus and protein can worsen kidney function',
  },
  'pancreatitis': {
    bannedIngredients: ['fatty meats', 'pork belly', 'lamb', 'bacon'],
    maxNutrients: { fat: 8 },
    reason: 'High fat can trigger pancreatitis attacks',
  },
  'heart disease': {
    bannedIngredients: ['high sodium foods', 'processed meats', 'cheese'],
    maxNutrients: { sodium: 0.3 },
    reason: 'High sodium worsens heart function',
  },
  'liver disease': {
    bannedIngredients: ['high copper foods', 'liver', 'shellfish'],
    maxNutrients: { protein: 20 },
    reason: 'Restricted protein and copper for liver health',
  },
  'diabetes': {
    bannedIngredients: ['high glycemic foods', 'white rice', 'white bread'],
    maxNutrients: {},
    reason: 'High glycemic foods cause blood sugar spikes',
  },
};

/**
 * Check if an ingredient is toxic to dogs
 */
export function isToxicIngredient(ingredient: string): boolean {
  const lowerIngredient = ingredient.toLowerCase();
  return TOXIC_INGREDIENTS.some(toxic => 
    lowerIngredient.includes(toxic.toLowerCase())
  );
}

/**
 * Check for dangerous ingredient combinations
 */
function checkDangerousCombinations(ingredients: string[]): SafetyViolation[] {
  const violations: SafetyViolation[] = [];
  const lowerIngredients = ingredients.map(i => i.toLowerCase());

  for (const combo of DANGEROUS_COMBINATIONS) {
    const hasAllIngredients = combo.ingredients.every(ing =>
      lowerIngredients.some(li => li.includes(ing.toLowerCase()))
    );

    if (hasAllIngredients) {
      violations.push({
        severity: combo.severity,
        category: 'Dangerous Combination',
        message: `${combo.ingredients.join(' + ')}: ${combo.reason}`,
        ingredients: combo.ingredients,
      });
    }
  }

  return violations;
}

/**
 * Check health condition restrictions
 */
function checkHealthConditionRestrictions(
  ingredients: string[],
  healthConditions: string[],
  nutrients?: { protein?: number; fat?: number; sodium?: number; phosphorus?: number }
): SafetyViolation[] {
  const violations: SafetyViolation[] = [];
  const lowerIngredients = ingredients.map(i => i.toLowerCase());

  for (const condition of healthConditions) {
    const lowerCondition = condition.toLowerCase();
    const restriction = Object.entries(HEALTH_CONDITION_RESTRICTIONS).find(
      ([key]) => lowerCondition.includes(key)
    );

    if (!restriction) continue;

    const [conditionName, rules] = restriction;

    // Check banned ingredients
    for (const banned of rules.bannedIngredients) {
      const found = lowerIngredients.find(ing => ing.includes(banned.toLowerCase()));
      if (found) {
        violations.push({
          severity: 'critical',
          category: 'Health Condition Violation',
          message: `${found} is dangerous for dogs with ${conditionName}. ${rules.reason}`,
          ingredients: [found],
        });
      }
    }

    // Check nutrient limits
    if (nutrients && rules.maxNutrients) {
      if (nutrients.protein && rules.maxNutrients.protein && nutrients.protein > rules.maxNutrients.protein) {
        violations.push({
          severity: 'high',
          category: 'Nutrient Limit Exceeded',
          message: `Protein (${nutrients.protein}%) exceeds safe limit (${rules.maxNutrients.protein}%) for ${conditionName}`,
        });
      }

      if (nutrients.fat && rules.maxNutrients.fat && nutrients.fat > rules.maxNutrients.fat) {
        violations.push({
          severity: 'high',
          category: 'Nutrient Limit Exceeded',
          message: `Fat (${nutrients.fat}%) exceeds safe limit (${rules.maxNutrients.fat}%) for ${conditionName}`,
        });
      }

      if (nutrients.sodium && rules.maxNutrients.sodium && nutrients.sodium > rules.maxNutrients.sodium) {
        violations.push({
          severity: 'high',
          category: 'Nutrient Limit Exceeded',
          message: `Sodium (${nutrients.sodium}%) exceeds safe limit (${rules.maxNutrients.sodium}%) for ${conditionName}`,
        });
      }

      if (nutrients.phosphorus && rules.maxNutrients.phosphorus && nutrients.phosphorus > rules.maxNutrients.phosphorus) {
        violations.push({
          severity: 'critical',
          category: 'Nutrient Limit Exceeded',
          message: `Phosphorus (${nutrients.phosphorus}%) exceeds safe limit (${rules.maxNutrients.phosphorus}%) for ${conditionName}. This is extremely dangerous for kidney disease.`,
        });
      }
    }
  }

  return violations;
}

/**
 * Check portion sizes for safety
 */
function checkPortionSafety(
  weight: number,
  dailyCalories: number,
  portionCalories: number
): SafetyViolation[] {
  const violations: SafetyViolation[] = [];

  // Check if portion is too large (>25% over recommended)
  if (portionCalories > dailyCalories * 1.25) {
    violations.push({
      severity: 'high',
      category: 'Portion Size',
      message: `Daily portion (${portionCalories} cal) is ${Math.round((portionCalories / dailyCalories - 1) * 100)}% over recommended (${dailyCalories} cal). This can lead to obesity and health issues.`,
    });
  }

  // Check if portion is dangerously small (<50% of recommended)
  if (portionCalories < dailyCalories * 0.5) {
    violations.push({
      severity: 'high',
      category: 'Portion Size',
      message: `Daily portion (${portionCalories} cal) is only ${Math.round((portionCalories / dailyCalories) * 100)}% of recommended (${dailyCalories} cal). This is insufficient for nutritional needs.`,
    });
  }

  return violations;
}

/**
 * Comprehensive P0 safety validation
 * Returns detailed safety check results
 */
export function validateRecipeSafety({
  ingredients,
  healthConditions = [],
  nutrients,
  weight,
  dailyCalories,
  portionCalories,
}: {
  ingredients: string[];
  healthConditions?: string[];
  nutrients?: { protein?: number; fat?: number; sodium?: number; phosphorus?: number };
  weight?: number;
  dailyCalories?: number;
  portionCalories?: number;
}): SafetyCheckResult {
  const violations: SafetyViolation[] = [];

  // 1. Check for toxic ingredients (P0 - HARD BLOCK)
  for (const ingredient of ingredients) {
    if (isToxicIngredient(ingredient)) {
      violations.push({
        severity: 'critical',
        category: 'Toxic Ingredient',
        message: `${ingredient} is TOXIC to dogs and can cause serious harm or death. This recipe cannot be generated.`,
        ingredients: [ingredient],
      });
    }
  }

  // 2. Check for dangerous combinations
  violations.push(...checkDangerousCombinations(ingredients));

  // 3. Check health condition restrictions
  if (healthConditions.length > 0) {
    violations.push(...checkHealthConditionRestrictions(ingredients, healthConditions, nutrients));
  }

  // 4. Check portion safety
  if (weight && dailyCalories && portionCalories) {
    violations.push(...checkPortionSafety(weight, dailyCalories, portionCalories));
  }

  // Determine if this is a hard block
  const hardBlock = violations.some(v => v.severity === 'critical');

  return {
    isSafe: violations.length === 0,
    violations,
    hardBlock,
  };
}

/**
 * Get a human-readable safety report
 */
export function getSafetyReport(result: SafetyCheckResult): string {
  if (result.isSafe) {
    return 'Recipe passed all safety checks.';
  }

  const criticalCount = result.violations.filter(v => v.severity === 'critical').length;
  const highCount = result.violations.filter(v => v.severity === 'high').length;
  const moderateCount = result.violations.filter(v => v.severity === 'moderate').length;

  let report = `Safety validation found ${result.violations.length} issue(s):\n\n`;

  if (criticalCount > 0) {
    report += `🚨 CRITICAL (${criticalCount}):\n`;
    result.violations
      .filter(v => v.severity === 'critical')
      .forEach(v => {
        report += `- ${v.category}: ${v.message}\n`;
      });
    report += '\n';
  }

  if (highCount > 0) {
    report += `⚠️ HIGH RISK (${highCount}):\n`;
    result.violations
      .filter(v => v.severity === 'high')
      .forEach(v => {
        report += `- ${v.category}: ${v.message}\n`;
      });
    report += '\n';
  }

  if (moderateCount > 0) {
    report += `⚡ MODERATE (${moderateCount}):\n`;
    result.violations
      .filter(v => v.severity === 'moderate')
      .forEach(v => {
        report += `- ${v.category}: ${v.message}\n`;
      });
  }

  if (result.hardBlock) {
    report += '\n❌ This recipe CANNOT be generated due to critical safety violations.';
  }

  return report;
}
