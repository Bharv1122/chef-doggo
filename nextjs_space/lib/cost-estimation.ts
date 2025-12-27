// Cost Estimation Utility (Phase 1B)

export interface IngredientCost {
  name: string;
  pricePerPound: number; // Average US price per pound
  category: 'protein' | 'vegetable' | 'carb' | 'fat' | 'supplement';
}

// Average ingredient costs (US prices, approximate)
export const INGREDIENT_COSTS: IngredientCost[] = [
  // Proteins
  { name: 'chicken breast', pricePerPound: 3.50, category: 'protein' },
  { name: 'ground chicken', pricePerPound: 3.00, category: 'protein' },
  { name: 'turkey', pricePerPound: 4.00, category: 'protein' },
  { name: 'ground turkey', pricePerPound: 3.50, category: 'protein' },
  { name: 'ground beef', pricePerPound: 5.00, category: 'protein' },
  { name: 'beef', pricePerPound: 6.00, category: 'protein' },
  { name: 'lamb', pricePerPound: 8.00, category: 'protein' },
  { name: 'pork', pricePerPound: 4.50, category: 'protein' },
  { name: 'fish', pricePerPound: 7.00, category: 'protein' },
  { name: 'salmon', pricePerPound: 10.00, category: 'protein' },
  { name: 'eggs', pricePerPound: 2.50, category: 'protein' },
  
  // Vegetables
  { name: 'carrot', pricePerPound: 1.00, category: 'vegetable' },
  { name: 'green beans', pricePerPound: 2.00, category: 'vegetable' },
  { name: 'broccoli', pricePerPound: 2.50, category: 'vegetable' },
  { name: 'spinach', pricePerPound: 3.00, category: 'vegetable' },
  { name: 'kale', pricePerPound: 3.50, category: 'vegetable' },
  { name: 'peas', pricePerPound: 2.00, category: 'vegetable' },
  { name: 'pumpkin', pricePerPound: 1.50, category: 'vegetable' },
  { name: 'squash', pricePerPound: 1.50, category: 'vegetable' },
  
  // Carbs
  { name: 'rice', pricePerPound: 1.50, category: 'carb' },
  { name: 'brown rice', pricePerPound: 2.00, category: 'carb' },
  { name: 'sweet potato', pricePerPound: 1.50, category: 'carb' },
  { name: 'potato', pricePerPound: 1.00, category: 'carb' },
  { name: 'oats', pricePerPound: 1.00, category: 'carb' },
  { name: 'quinoa', pricePerPound: 4.00, category: 'carb' },
  
  // Fats
  { name: 'olive oil', pricePerPound: 8.00, category: 'fat' },
  { name: 'coconut oil', pricePerPound: 10.00, category: 'fat' },
  { name: 'fish oil', pricePerPound: 15.00, category: 'supplement' },
];

// Parse quantity string to pounds (approximations)
function parseQuantityToPounds(quantity: string): number {
  const lowerQty = quantity.toLowerCase();
  
  // Extract number
  const numMatch = lowerQty.match(/([\d.]+)/);
  if (!numMatch) return 0.5; // Default to half pound if no number found
  
  const num = parseFloat(numMatch[1]);
  
  // Convert to pounds based on unit
  if (lowerQty.includes('lb') || lowerQty.includes('pound')) {
    return num;
  } else if (lowerQty.includes('oz') || lowerQty.includes('ounce')) {
    return num / 16;
  } else if (lowerQty.includes('cup')) {
    // Rough approximation: 1 cup ≈ 0.5 lbs
    return num * 0.5;
  } else if (lowerQty.includes('tbsp') || lowerQty.includes('tablespoon')) {
    return num * 0.03; // 1 tbsp ≈ 0.03 lbs
  } else if (lowerQty.includes('tsp') || lowerQty.includes('teaspoon')) {
    return num * 0.01; // 1 tsp ≈ 0.01 lbs
  }
  
  // Default to treating as pounds
  return num;
}

// Find cost for an ingredient
function findIngredientCost(ingredientName: string): number {
  const lowerName = ingredientName.toLowerCase();
  
  // Try exact match first
  const exactMatch = INGREDIENT_COSTS.find(cost => 
    lowerName.includes(cost.name.toLowerCase())
  );
  
  if (exactMatch) return exactMatch.pricePerPound;
  
  // Default costs by category keyword
  if (lowerName.includes('chicken') || lowerName.includes('turkey')) return 3.50;
  if (lowerName.includes('beef') || lowerName.includes('meat')) return 5.00;
  if (lowerName.includes('fish') || lowerName.includes('salmon')) return 7.00;
  if (lowerName.includes('vegetable') || lowerName.includes('veggie')) return 2.00;
  if (lowerName.includes('rice') || lowerName.includes('grain')) return 1.50;
  if (lowerName.includes('oil')) return 8.00;
  
  // Default unknown ingredient
  return 2.50;
}

export interface CostEstimate {
  total: number;
  perServing: number;
  perDay: number;
  kibbleComparison: {
    kibbleCostPerDay: number;
    savingsPerDay: number;
    savingsPerMonth: number;
    savingsPercentage: number;
  };
  breakdown: Array<{
    ingredient: string;
    cost: number;
  }>;
}

// Calculate recipe cost
export function calculateRecipeCost(
  ingredients: Array<{ name: string; quantity: string }>,
  servingsPerBatch: number = 7,
  servingsPerDay: number = 1,
  kibbleCostPerMonth: number = 60 // Average monthly kibble cost
): CostEstimate {
  const breakdown: Array<{ ingredient: string; cost: number }> = [];
  let total = 0;

  for (const ingredient of ingredients) {
    const pounds = parseQuantityToPounds(ingredient.quantity);
    const pricePerPound = findIngredientCost(ingredient.name);
    const cost = pounds * pricePerPound;
    
    breakdown.push({
      ingredient: ingredient.name,
      cost: parseFloat(cost.toFixed(2))
    });
    
    total += cost;
  }

  const perServing = total / servingsPerBatch;
  const perDay = perServing * servingsPerDay;
  
  // Kibble comparison
  const kibbleCostPerDay = kibbleCostPerMonth / 30;
  const savingsPerDay = kibbleCostPerDay - perDay;
  const savingsPerMonth = savingsPerDay * 30;
  const savingsPercentage = ((savingsPerDay / kibbleCostPerDay) * 100);

  return {
    total: parseFloat(total.toFixed(2)),
    perServing: parseFloat(perServing.toFixed(2)),
    perDay: parseFloat(perDay.toFixed(2)),
    kibbleComparison: {
      kibbleCostPerDay: parseFloat(kibbleCostPerDay.toFixed(2)),
      savingsPerDay: parseFloat(savingsPerDay.toFixed(2)),
      savingsPerMonth: parseFloat(savingsPerMonth.toFixed(2)),
      savingsPercentage: parseFloat(savingsPercentage.toFixed(1))
    },
    breakdown
  };
}
