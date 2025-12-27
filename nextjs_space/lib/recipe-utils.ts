/**
 * Recipe Utility Functions
 * Batch scaling, shopping lists, and export features
 */

export interface Ingredient {
  name: string;
  amount: string;
}

export interface ScaledRecipe {
  batchSize: number; // Number of days
  scaledIngredients: Ingredient[];
  totalCost?: number;
  storageInstructions: string;
}

export interface ShoppingListItem {
  ingredient: string;
  totalAmount: string;
  estimatedCost?: string;
  category: string;
}

// Ingredient categories for shopping list organization
const INGREDIENT_CATEGORIES: Record<string, string> = {
  // Proteins
  'chicken': 'Proteins',
  'turkey': 'Proteins',
  'beef': 'Proteins',
  'lamb': 'Proteins',
  'fish': 'Proteins',
  'salmon': 'Proteins',
  'egg': 'Proteins',
  'eggs': 'Proteins',
  
  // Vegetables
  'carrot': 'Vegetables',
  'carrots': 'Vegetables',
  'sweet potato': 'Vegetables',
  'pumpkin': 'Vegetables',
  'broccoli': 'Vegetables',
  'spinach': 'Vegetables',
  'peas': 'Vegetables',
  'green beans': 'Vegetables',
  'zucchini': 'Vegetables',
  
  // Grains
  'rice': 'Grains',
  'brown rice': 'Grains',
  'oats': 'Grains',
  'quinoa': 'Grains',
  'barley': 'Grains',
  
  // Oils & Fats
  'oil': 'Oils & Fats',
  'olive oil': 'Oils & Fats',
  'coconut oil': 'Oils & Fats',
  'fish oil': 'Oils & Fats',
  
  // Supplements
  'calcium': 'Supplements',
  'vitamin': 'Supplements',
  'supplement': 'Supplements',
};

/**
 * Parse ingredient amount (handle cups, tbsp, tsp, oz, lb, grams)
 */
function parseAmount(amountStr: string): { value: number; unit: string } {
  const match = amountStr.match(/([\d.]+)\s*([a-zA-Z]*)/);  if (!match) return { value: 0, unit: '' };
  
  const value = parseFloat(match[1]);
  const unit = match[2].toLowerCase();
  
  return { value, unit };
}

/**
 * Format ingredient amount back to string
 */
function formatAmount(value: number, unit: string): string {
  // Round to 2 decimal places
  const rounded = Math.round(value * 100) / 100;
  
  // Convert fractions for common measurements
  if (unit === 'cup' || unit === 'cups') {
    if (rounded === 0.25) return '1/4 cup';
    if (rounded === 0.33) return '1/3 cup';
    if (rounded === 0.5) return '1/2 cup';
    if (rounded === 0.75) return '3/4 cup';
  }
  
  if (unit === 'tbsp') {
    if (rounded === 0.5) return '1/2 tbsp';
  }
  
  if (unit === 'tsp') {
    if (rounded === 0.5) return '1/2 tsp';
  }
  
  return `${rounded} ${unit}`.trim();
}

/**
 * Scale a recipe for batch cooking
 * @param ingredients - Original recipe ingredients
 * @param originalBatchSize - Original batch size (default 7 days)
 * @param targetBatchSize - Desired batch size in days
 */
export function scaleRecipe(
  ingredients: Ingredient[],
  originalBatchSize: number = 7,
  targetBatchSize: number = 14
): ScaledRecipe {
  const scaleFactor = targetBatchSize / originalBatchSize;
  
  const scaledIngredients = ingredients.map(ing => {
    const { value, unit } = parseAmount(ing.amount);
    const scaledValue = value * scaleFactor;
    
    return {
      name: ing.name,
      amount: formatAmount(scaledValue, unit),
    };
  });
  
  // Storage instructions based on batch size
  let storageInstructions = '';
  if (targetBatchSize <= 3) {
    storageInstructions = 'Store in refrigerator for up to 3 days in airtight containers.';
  } else if (targetBatchSize <= 7) {
    storageInstructions = 'Store in refrigerator for up to 5 days. Consider freezing portions for days 6-7.';
  } else if (targetBatchSize <= 14) {
    storageInstructions = 'Divide into daily portions. Store 3-5 days worth in refrigerator, freeze the rest. Thaw overnight in refrigerator before serving.';
  } else {
    storageInstructions = 'IMPORTANT: Divide into daily portions immediately. Store 3-5 days worth in refrigerator, freeze all remaining portions. Label with dates. Thaw one portion at a time overnight in refrigerator.';
  }
  
  return {
    batchSize: targetBatchSize,
    scaledIngredients,
    storageInstructions,
  };
}

/**
 * Generate organized shopping list from recipe ingredients
 * Groups by category and consolidates amounts
 */
export function generateShoppingList(
  recipes: Array<{ ingredients: Ingredient[]; servings?: number }>
): ShoppingListItem[] {
  const ingredientMap = new Map<string, { totalAmount: string; category: string }>();
  
  // Consolidate all ingredients
  for (const recipe of recipes) {
    const servings = recipe.servings ?? 1;
    
    for (const ing of recipe.ingredients) {
      const normalizedName = ing.name.toLowerCase().trim();
      const { value, unit } = parseAmount(ing.amount);
      const scaledValue = value * servings;
      
      if (ingredientMap.has(normalizedName)) {
        const existing = ingredientMap.get(normalizedName)!;
        const existingParsed = parseAmount(existing.totalAmount);
        
        // Only add if same unit (otherwise keep separate)
        if (existingParsed.unit === unit) {
          const newTotal = existingParsed.value + scaledValue;
          existing.totalAmount = formatAmount(newTotal, unit);
        } else {
          // Different units - append
          existing.totalAmount += ` + ${formatAmount(scaledValue, unit)}`;
        }
      } else {
        // Determine category
        let category = 'Other';
        for (const [key, cat] of Object.entries(INGREDIENT_CATEGORIES)) {
          if (normalizedName.includes(key)) {
            category = cat;
            break;
          }
        }
        
        ingredientMap.set(normalizedName, {
          totalAmount: formatAmount(scaledValue, unit),
          category,
        });
      }
    }
  }
  
  // Convert to array and sort by category
  const shoppingList: ShoppingListItem[] = [];
  
  for (const [ingredient, data] of ingredientMap.entries()) {
    shoppingList.push({
      ingredient: ingredient.charAt(0).toUpperCase() + ingredient.slice(1),
      totalAmount: data.totalAmount,
      category: data.category,
    });
  }
  
  // Sort by category, then by ingredient name
  shoppingList.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.ingredient.localeCompare(b.ingredient);
  });
  
  return shoppingList;
}

/**
 * Format recipe as plain text for export
 */
export function formatRecipeAsText(recipe: any): string {
  let text = '';
  
  text += `Recipe: ${recipe.name}\n`;
  text += `For: ${recipe.dogName}\n`;
  text += `\n`;
  
  if (recipe.description) {
    text += `${recipe.description}\n\n`;
  }
  
  text += `INGREDIENTS:\n`;
  text += `=============\n`;
  for (const ing of recipe.ingredients) {
    text += `• ${ing.amount} ${ing.name}\n`;
  }
  text += `\n`;
  
  text += `INSTRUCTIONS:\n`;
  text += `==============\n`;
  if (recipe.instructions) {
    const instructions = Array.isArray(recipe.instructions)
      ? recipe.instructions
      : recipe.instructions.split('\n').filter((s: string) => s.trim());
    
    instructions.forEach((instruction: string, index: number) => {
      text += `${index + 1}. ${instruction}\n`;
    });
  }
  text += `\n`;
  
  if (recipe.dailyCalories) {
    text += `Daily Calories: ${recipe.dailyCalories} kcal\n`;
  }
  
  if (recipe.nutrients) {
    text += `\nNUTRITIONAL INFORMATION:\n`;
    text += `========================\n`;
    if (recipe.nutrients.protein) text += `Protein: ${recipe.nutrients.protein}%\n`;
    if (recipe.nutrients.fat) text += `Fat: ${recipe.nutrients.fat}%\n`;
    if (recipe.nutrients.fiber) text += `Fiber: ${recipe.nutrients.fiber}%\n`;
    if (recipe.nutrients.calcium) text += `Calcium: ${recipe.nutrients.calcium}%\n`;
    if (recipe.nutrients.phosphorus) text += `Phosphorus: ${recipe.nutrients.phosphorus}%\n`;
  }
  
  if (recipe.transitionGuide) {
    text += `\nTRANSITION GUIDE:\n`;
    text += `=================\n`;
    text += recipe.transitionGuide + '\n';
  }
  
  text += `\n`;
  text += `⚠️ IMPORTANT: Always consult with your veterinarian before making major dietary changes.\n`;
  text += `This recipe is intended to supplement professional veterinary advice, not replace it.\n`;
  
  return text;
}

/**
 * Format shopping list as plain text
 */
export function formatShoppingListAsText(shoppingList: ShoppingListItem[]): string {
  let text = '';
  
  text += `CHEF DOGGO SHOPPING LIST\n`;
  text += `========================\n\n`;
  
  let currentCategory = '';
  
  for (const item of shoppingList) {
    if (item.category !== currentCategory) {
      currentCategory = item.category;
      text += `\n${currentCategory.toUpperCase()}:\n`;
      text += '-'.repeat(currentCategory.length + 1) + '\n';
    }
    
    text += `☐ ${item.ingredient} - ${item.totalAmount}`;
    if (item.estimatedCost) {
      text += ` (Est. ${item.estimatedCost})`;
    }
    text += '\n';
  }
  
  text += `\n`;
  text += `Generated by Chef Doggo\n`;
  text += `Date: ${new Date().toLocaleDateString()}\n`;
  
  return text;
}

/**
 * Download text content as a file
 */
export function downloadAsFile(content: string, filename: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
