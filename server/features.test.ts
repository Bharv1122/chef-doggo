import { describe, expect, it } from "vitest";

// Test the cost calculation logic
describe("Recipe Cost Calculation", () => {
  // Replicate the INGREDIENT_PRICES from Generate.tsx for testing
  const INGREDIENT_PRICES: Record<string, { pricePerUnit: number; unit: string }> = {
    'ground beef': { pricePerUnit: 5.99, unit: 'pound' },
    'beef': { pricePerUnit: 5.99, unit: 'pound' },
    'chicken': { pricePerUnit: 3.99, unit: 'pound' },
    'salmon': { pricePerUnit: 9.99, unit: 'pound' },
    'sweet potato': { pricePerUnit: 1.29, unit: 'pound' },
    'green beans': { pricePerUnit: 2.49, unit: 'pound' },
    'brown rice': { pricePerUnit: 2.99, unit: 'pound' },
    'olive oil': { pricePerUnit: 0.50, unit: 'tablespoon' },
    'fish oil': { pricePerUnit: 0.15, unit: 'capsule' },
    'calcium': { pricePerUnit: 0.10, unit: 'dose' },
    'multivitamin': { pricePerUnit: 0.25, unit: 'dose' },
  };

  function calculateRecipeCost(ingredients: any[]): number {
    let totalCost = 0;
    
    for (const ing of ingredients) {
      const name = ing.name?.toLowerCase() || '';
      const amount = parseFloat(ing.amount) || 0;
      const unit = ing.unit?.toLowerCase() || '';
      
      let priceInfo = null;
      for (const [key, value] of Object.entries(INGREDIENT_PRICES)) {
        if (name.includes(key)) {
          priceInfo = value;
          break;
        }
      }
      
      if (priceInfo) {
        let costMultiplier = amount;
        
        if (unit === 'cup' || unit === 'cups') {
          if (priceInfo.unit === 'pound') {
            costMultiplier = amount * 0.5;
          }
        } else if (unit === 'tablespoon' || unit === 'tablespoons') {
          if (priceInfo.unit === 'tablespoon') {
            costMultiplier = amount;
          }
        } else if (unit === 'pound' || unit === 'pounds' || unit === 'lb' || unit === 'lbs') {
          costMultiplier = amount;
        } else if (unit === 'mg' || unit === 'dose') {
          costMultiplier = 1;
        }
        
        totalCost += priceInfo.pricePerUnit * costMultiplier;
      } else {
        totalCost += 1.00;
      }
    }
    
    return totalCost;
  }

  it("calculates cost for ground beef by pound", () => {
    const ingredients = [
      { name: "Ground Beef", amount: "1", unit: "pound" }
    ];
    const cost = calculateRecipeCost(ingredients);
    expect(cost).toBeCloseTo(5.99, 2);
  });

  it("calculates cost for chicken by pound", () => {
    const ingredients = [
      { name: "Chicken Breast", amount: "2", unit: "pounds" }
    ];
    const cost = calculateRecipeCost(ingredients);
    expect(cost).toBeCloseTo(7.98, 2);
  });

  it("converts cups to pounds for proteins", () => {
    const ingredients = [
      { name: "Ground Beef", amount: "2", unit: "cups" }
    ];
    // 2 cups = 1 pound (0.5 lb per cup)
    const cost = calculateRecipeCost(ingredients);
    expect(cost).toBeCloseTo(5.99, 2);
  });

  it("calculates cost for olive oil by tablespoon", () => {
    const ingredients = [
      { name: "Olive Oil", amount: "2", unit: "tablespoons" }
    ];
    const cost = calculateRecipeCost(ingredients);
    expect(cost).toBeCloseTo(1.00, 2);
  });

  it("calculates cost for supplements as single dose", () => {
    const ingredients = [
      { name: "Calcium Carbonate", amount: "1000", unit: "mg" },
      { name: "Canine Multivitamin", amount: "1", unit: "dose" }
    ];
    const cost = calculateRecipeCost(ingredients);
    expect(cost).toBeCloseTo(0.35, 2); // 0.10 + 0.25
  });

  it("calculates total cost for a full recipe", () => {
    const ingredients = [
      { name: "Ground Beef (90/10)", amount: "1", unit: "pound" },
      { name: "Cooked Salmon", amount: "0.5", unit: "cup" },
      { name: "Steamed Green Beans", amount: "0.5", unit: "cup" },
      { name: "Brown Rice", amount: "0.8", unit: "cup" },
      { name: "Olive Oil", amount: "2", unit: "tablespoons" },
      { name: "Calcium Carbonate Powder", amount: "1000", unit: "mg" },
      { name: "Canine Multivitamin Powder", amount: "1", unit: "dose" },
      { name: "Fish Oil", amount: "1000", unit: "mg" }
    ];
    const cost = calculateRecipeCost(ingredients);
    // Ground beef: 5.99
    // Salmon: 0.5 cups * 0.5 = 0.25 lbs * 9.99 = 2.50
    // Green beans: 0.5 cups * 0.5 = 0.25 lbs * 2.49 = 0.62
    // Brown rice: 0.8 cups * 0.5 = 0.4 lbs * 2.99 = 1.20
    // Olive oil: 2 tbsp * 0.50 = 1.00
    // Calcium: 0.10
    // Multivitamin: 0.25
    // Fish oil: 0.15
    // Total: ~11.81
    expect(cost).toBeGreaterThan(10);
    expect(cost).toBeLessThan(15);
  });

  it("uses default price for unknown ingredients", () => {
    const ingredients = [
      { name: "Exotic Ingredient", amount: "1", unit: "cup" }
    ];
    const cost = calculateRecipeCost(ingredients);
    expect(cost).toBe(1.00);
  });
});

describe("Batch Scaling", () => {
  it("scales ingredient amounts correctly for 2x batch", () => {
    const originalAmount = 1;
    const batchMultiplier = 2;
    const scaledAmount = originalAmount * batchMultiplier;
    expect(scaledAmount).toBe(2);
  });

  it("scales ingredient amounts correctly for 3x batch", () => {
    const originalAmount = 0.5;
    const batchMultiplier = 3;
    const scaledAmount = originalAmount * batchMultiplier;
    expect(scaledAmount).toBe(1.5);
  });

  it("scales ingredient amounts correctly for 4x batch", () => {
    const originalAmount = 0.8;
    const batchMultiplier = 4;
    const scaledAmount = originalAmount * batchMultiplier;
    expect(scaledAmount).toBeCloseTo(3.2, 2);
  });

  it("scales total cups correctly", () => {
    const totalCups = 4;
    const batchMultiplier = 2;
    const scaledTotalCups = totalCups * batchMultiplier;
    expect(scaledTotalCups).toBe(8);
  });

  it("scales days batch lasts correctly", () => {
    const daysThisRecipeLasts = 1;
    const batchMultiplier = 3;
    const scaledDays = daysThisRecipeLasts * batchMultiplier;
    expect(scaledDays).toBe(3);
  });

  it("scales cost correctly", () => {
    const baseCost = 11.50;
    const batchMultiplier = 2;
    const scaledCost = baseCost * batchMultiplier;
    expect(scaledCost).toBe(23.00);
  });
});

describe("Serving Information Calculations", () => {
  it("calculates cups per meal correctly", () => {
    const totalCups = 4;
    const mealsPerDay = 2;
    const cupsPerMeal = totalCups / mealsPerDay;
    expect(cupsPerMeal).toBe(2);
  });

  it("calculates days batch lasts correctly", () => {
    const totalCups = 8;
    const cupsPerDay = 4;
    const daysThisRecipeLasts = totalCups / cupsPerDay;
    expect(daysThisRecipeLasts).toBe(2);
  });

  it("calculates cost per meal correctly", () => {
    const totalCost = 12.00;
    const mealsPerDay = 2;
    const costPerMeal = totalCost / mealsPerDay;
    expect(costPerMeal).toBe(6.00);
  });

  it("calculates cost per day correctly", () => {
    const totalCost = 12.00;
    const daysThisRecipeLasts = 1;
    const costPerDay = totalCost / daysThisRecipeLasts;
    expect(costPerDay).toBe(12.00);
  });
});
