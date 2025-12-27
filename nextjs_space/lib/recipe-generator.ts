import { validateToxicIngredients, validateAAFCOStandards } from './nutrition-utils';

interface RecipeGenerationParams {
  dogName: string;
  dogWeight: number;
  lifeStage: string;
  dailyCalories: number;
  nutritionPhilosophy?: string;
  allergies: string[];
  healthConditions: string[];
  dietaryRestrictions: string[];
  kibbleNutrition: {
    protein: number;
    fat: number;
    fiber: number;
    calcium?: number;
    phosphorus?: number;
  };
}

interface GeneratedRecipe {
  name: string;
  ingredients: Array<{ name: string; amount: string; notes?: string }>;
  instructions: string[];
  nutritionSummary: {
    protein: number;
    fat: number;
    fiber: number;
    calcium: number;
    phosphorus: number;
    calories: number;
  };
  supplements: Array<{
    name: string;
    amount: string;
    reason: string;
    affiliateLinks: Array<{ retailer: string; url: string }>;
  }>;
  servingSize: string;
  transitionGuide: Array<{ day: string; kibble: string; homemade: string; notes: string }>;
}

// Creative recipe name generator
function generateRecipeName(philosophy?: string): string {
  const adjectives = ['Wholesome', 'Hearty', 'Nutritious', 'Balanced', 'Gourmet', 'Premium', 'Delicious'];
  const themes = ['Bowl', 'Feast', 'Delight', 'Medley', 'Blend', 'Mix', 'Meal'];
  
  let prefix = adjectives[Math.floor(Math.random() * adjectives.length)];
  
  if (philosophy === 'High-Protein') {
    prefix = 'Protein-Packed';
  } else if (philosophy === 'Low-Fat') {
    prefix = 'Lean & Light';
  } else if (philosophy === 'Grain-Free') {
    prefix = 'Grain-Free';
  }
  
  const suffix = themes[Math.floor(Math.random() * themes.length)];
  return `${prefix} ${suffix}`;
}

// Main recipe generator
export function generateRecipe(params: RecipeGenerationParams): GeneratedRecipe | { error: string } {
  try {
    // Validate AAFCO standards
    const aafcoValidation = validateAAFCOStandards({
      protein: params.kibbleNutrition.protein,
      fat: params.kibbleNutrition.fat,
      calcium: params.kibbleNutrition.calcium,
      phosphorus: params.kibbleNutrition.phosphorus,
      lifeStage: params.lifeStage,
    });

    if (!aafcoValidation.isValid) {
      return {
        error: `AAFCO Standards Not Met: ${aafcoValidation.errors.join(', ')}`,
      };
    }

    // Generate base ingredients based on calorie needs and nutrition philosophy
    const ingredients = generateIngredients(params);

    // Validate for toxic ingredients
    const ingredientNames = ingredients.map(i => i.name);
    const toxicCheck = validateToxicIngredients(ingredientNames);

    if (!toxicCheck.isSafe) {
      return {
        error: `DANGEROUS: Recipe contains toxic ingredients: ${toxicCheck.toxicFound.join(', ')}. This recipe cannot be generated.`,
      };
    }

    // Generate instructions
    const instructions = generateInstructions(ingredients);

    // Generate supplement recommendations
    const supplements = generateSupplements(params);

    // Calculate nutrition summary
    const nutritionSummary = {
      protein: params.kibbleNutrition.protein,
      fat: params.kibbleNutrition.fat,
      fiber: params.kibbleNutrition.fiber,
      calcium: params.kibbleNutrition.calcium ?? 1.2,
      phosphorus: params.kibbleNutrition.phosphorus ?? 1.0,
      calories: params.dailyCalories,
    };

    // Generate transition guide
    const transitionGuide = generateTransitionGuide();

    // Calculate serving size
    const servingSize = calculateServingSize(params.dogWeight, params.dailyCalories);

    return {
      name: generateRecipeName(params.nutritionPhilosophy),
      ingredients,
      instructions,
      nutritionSummary,
      supplements,
      servingSize,
      transitionGuide,
    };
  } catch (error) {
    return {
      error: `Recipe generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

function generateIngredients(params: RecipeGenerationParams) {
  const ingredients: Array<{ name: string; amount: string; notes?: string }> = [];
  
  // Calculate portions based on calorie needs
  const caloriesPerDay = params.dailyCalories;
  
  // 40% protein sources
  const proteinCalories = caloriesPerDay * 0.4;
  let proteinSource = 'chicken breast';
  
  if (params.nutritionPhilosophy === 'High-Protein') {
    proteinSource = 'lean ground turkey';
  } else if (params.allergies?.some?.(a => a?.toLowerCase?.()?.includes?.('chicken'))) {
    proteinSource = 'lean ground beef';
  }
  
  const proteinOunces = Math.round((proteinCalories / 165) * 10) / 10; // ~165 cal per 4oz
  ingredients.push({
    name: proteinSource,
    amount: `${proteinOunces} oz`,
    notes: 'Lean, cooked',
  });
  
  // 30% vegetables
  const isGrainFree = params.nutritionPhilosophy === 'Grain-Free';
  
  ingredients.push({
    name: 'sweet potato',
    amount: `${Math.round(params.dogWeight * 0.15 * 10) / 10} oz`,
    notes: 'Cooked and mashed',
  });
  
  ingredients.push({
    name: 'carrots',
    amount: `${Math.round(params.dogWeight * 0.1 * 10) / 10} oz`,
    notes: 'Cooked and chopped',
  });
  
  ingredients.push({
    name: 'green beans',
    amount: `${Math.round(params.dogWeight * 0.08 * 10) / 10} oz`,
    notes: 'Steamed',
  });
  
  // 20% carbs
  if (!isGrainFree) {
    ingredients.push({
      name: 'brown rice',
      amount: `${Math.round(params.dogWeight * 0.2 * 10) / 10} oz`,
      notes: 'Cooked',
    });
  } else {
    ingredients.push({
      name: 'pumpkin puree',
      amount: `${Math.round(params.dogWeight * 0.15 * 10) / 10} oz`,
      notes: 'Plain, no spices',
    });
  }
  
  // 10% healthy fats
  if (params.nutritionPhilosophy !== 'Low-Fat') {
    ingredients.push({
      name: 'fish oil',
      amount: '1 tsp',
      notes: 'For omega-3 fatty acids',
    });
  }
  
  return ingredients;
}

function generateInstructions(ingredients: Array<{ name: string; amount: string }>): string[] {
  return [
    'Wash your hands and clean all cooking surfaces and utensils.',
    `Cook the ${ingredients[0]?.name ?? 'protein'} thoroughly until no pink remains. Let cool and chop into bite-sized pieces.`,
    'Cook all vegetables until soft. Sweet potatoes should be mashed, carrots chopped, and green beans cut into small pieces.',
    'If using grains, cook according to package directions and let cool.',
    'In a large bowl, combine all cooked ingredients and mix thoroughly.',
    'Add fish oil or other supplements and mix well.',
    'Divide into meal-sized portions and store in airtight containers.',
    'Refrigerate portions for up to 3 days, or freeze for up to 3 months.',
    'Always serve at room temperature or slightly warmed. Never serve hot food.',
  ];
}

function generateSupplements(params: RecipeGenerationParams) {
  const supplements = [
    {
      name: 'Calcium Carbonate',
      amount: `${Math.round(params.dogWeight * 50)} mg per day`,
      reason: 'Essential for bone health and proper Ca:P ratio',
      affiliateLinks: [
        { retailer: 'Chewy', url: 'https://www.chewy.com/s?query=calcium+carbonate+dogs' },
        { retailer: 'Amazon', url: 'https://www.amazon.com/s?k=calcium+carbonate+for+dogs' },
      ],
    },
    {
      name: 'Fish Oil (Omega-3)',
      amount: '1000mg per 30 lbs of body weight',
      reason: 'Supports skin, coat, joint, and heart health',
      affiliateLinks: [
        { retailer: 'Chewy', url: 'https://www.chewy.com/s?query=fish+oil+dogs' },
        { retailer: 'Amazon', url: 'https://www.amazon.com/s?k=fish+oil+for+dogs' },
      ],
    },
    {
      name: 'Multivitamin for Dogs',
      amount: 'As directed on product label',
      reason: 'Ensures complete nutrition and fills any gaps',
      affiliateLinks: [
        { retailer: 'Chewy', url: 'https://www.chewy.com/s?query=dog+multivitamin' },
        { retailer: 'Amazon', url: 'https://www.amazon.com/s?k=dog+multivitamin' },
      ],
    },
  ];
  
  return supplements;
}

function generateTransitionGuide() {
  return [
    { day: 'Days 1-2', kibble: '75%', homemade: '25%', notes: 'Monitor for any digestive upset' },
    { day: 'Days 3-4', kibble: '50%', homemade: '50%', notes: 'Watch stool consistency' },
    { day: 'Days 5-6', kibble: '25%', homemade: '75%', notes: 'Almost there!' },
    { day: 'Day 7+', kibble: '0%', homemade: '100%', notes: 'Full transition complete' },
  ];
}

function calculateServingSize(weight: number, calories: number): string {
  const cupsPerDay = Math.round((calories / 400) * 10) / 10; // rough estimate
  return `${cupsPerDay} cups per day (split into 2 meals)`;
}