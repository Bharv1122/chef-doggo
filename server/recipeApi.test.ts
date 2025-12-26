import { describe, expect, it } from "vitest";

// Test the portion calculation logic
// These functions are extracted from recipeApi.ts for testing

function calculateDailyFoodVolume(weightLbs: number, activityLevel: string): { cups: number; ounces: number } {
  // Base: 1 cup per 10 lbs
  let cupsPerDay = weightLbs / 10;
  
  // Adjust for activity level
  switch (activityLevel) {
    case 'sedentary':
      cupsPerDay *= 0.8;
      break;
    case 'moderate':
      cupsPerDay *= 1.0;
      break;
    case 'active':
      cupsPerDay *= 1.2;
      break;
    case 'very_active':
      cupsPerDay *= 1.4;
      break;
  }
  
  // Round to nearest 0.5 cup
  cupsPerDay = Math.round(cupsPerDay * 2) / 2;
  
  // Minimum 1 cup, maximum reasonable amount
  cupsPerDay = Math.max(1, Math.min(cupsPerDay, 12));
  
  return {
    cups: cupsPerDay,
    ounces: cupsPerDay * 8
  };
}

function calculateIngredientBreakdown(totalCups: number): {
  proteinCups: number;
  vegetableCups: number;
  carbCups: number;
  fatCups: number;
} {
  // Ideal ratio for dogs: 50% protein, 25% vegetables, 20% carbs, 5% healthy fats
  return {
    proteinCups: Math.round(totalCups * 0.50 * 10) / 10,
    vegetableCups: Math.round(totalCups * 0.25 * 10) / 10,
    carbCups: Math.round(totalCups * 0.20 * 10) / 10,
    fatCups: Math.round(totalCups * 0.05 * 10) / 10
  };
}

describe("Recipe Portion Calculations", () => {
  describe("calculateDailyFoodVolume", () => {
    it("calculates correct volume for a 10lb dog with moderate activity", () => {
      const result = calculateDailyFoodVolume(10, 'moderate');
      expect(result.cups).toBe(1);
      expect(result.ounces).toBe(8);
    });

    it("calculates correct volume for a 50lb dog with moderate activity", () => {
      const result = calculateDailyFoodVolume(50, 'moderate');
      expect(result.cups).toBe(5);
      expect(result.ounces).toBe(40);
    });

    it("calculates correct volume for a 100lb dog with moderate activity", () => {
      const result = calculateDailyFoodVolume(100, 'moderate');
      expect(result.cups).toBe(10);
      expect(result.ounces).toBe(80);
    });

    it("reduces volume for sedentary dogs", () => {
      const moderate = calculateDailyFoodVolume(50, 'moderate');
      const sedentary = calculateDailyFoodVolume(50, 'sedentary');
      expect(sedentary.cups).toBeLessThan(moderate.cups);
    });

    it("increases volume for active dogs", () => {
      const moderate = calculateDailyFoodVolume(50, 'moderate');
      const active = calculateDailyFoodVolume(50, 'active');
      expect(active.cups).toBeGreaterThan(moderate.cups);
    });

    it("increases volume for very active dogs", () => {
      const active = calculateDailyFoodVolume(50, 'active');
      const veryActive = calculateDailyFoodVolume(50, 'very_active');
      expect(veryActive.cups).toBeGreaterThan(active.cups);
    });

    it("enforces minimum of 1 cup for tiny dogs", () => {
      const result = calculateDailyFoodVolume(3, 'sedentary');
      expect(result.cups).toBeGreaterThanOrEqual(1);
    });

    it("enforces maximum of 12 cups for giant dogs", () => {
      const result = calculateDailyFoodVolume(200, 'very_active');
      expect(result.cups).toBeLessThanOrEqual(12);
    });

    it("rounds to nearest 0.5 cup", () => {
      const result = calculateDailyFoodVolume(35, 'moderate');
      // 35/10 = 3.5, should round to 3.5
      expect(result.cups % 0.5).toBe(0);
    });
  });

  describe("calculateIngredientBreakdown", () => {
    it("calculates correct breakdown for 5 cups total", () => {
      const result = calculateIngredientBreakdown(5);
      expect(result.proteinCups).toBe(2.5); // 50%
      expect(result.vegetableCups).toBe(1.3); // 25% rounded
      expect(result.carbCups).toBe(1); // 20%
      expect(result.fatCups).toBe(0.3); // 5% rounded
    });

    it("calculates correct breakdown for 10 cups total", () => {
      const result = calculateIngredientBreakdown(10);
      expect(result.proteinCups).toBe(5); // 50%
      expect(result.vegetableCups).toBe(2.5); // 25%
      expect(result.carbCups).toBe(2); // 20%
      expect(result.fatCups).toBe(0.5); // 5%
    });

    it("breakdown sums to approximately total cups", () => {
      const totalCups = 6;
      const result = calculateIngredientBreakdown(totalCups);
      const sum = result.proteinCups + result.vegetableCups + result.carbCups + result.fatCups;
      // Allow for rounding differences
      expect(sum).toBeGreaterThan(totalCups * 0.95);
      expect(sum).toBeLessThan(totalCups * 1.05);
    });

    it("protein is always the largest component", () => {
      const result = calculateIngredientBreakdown(8);
      expect(result.proteinCups).toBeGreaterThan(result.vegetableCups);
      expect(result.proteinCups).toBeGreaterThan(result.carbCups);
      expect(result.proteinCups).toBeGreaterThan(result.fatCups);
    });

    it("fat is always the smallest component", () => {
      const result = calculateIngredientBreakdown(8);
      expect(result.fatCups).toBeLessThan(result.proteinCups);
      expect(result.fatCups).toBeLessThan(result.vegetableCups);
      expect(result.fatCups).toBeLessThan(result.carbCups);
    });
  });

  describe("Real-world scenarios", () => {
    it("calculates appropriate portions for a small dog (Chihuahua, 5lbs, sedentary)", () => {
      const volume = calculateDailyFoodVolume(5, 'sedentary');
      const breakdown = calculateIngredientBreakdown(volume.cups);
      
      // Small dog should get minimum 1 cup
      expect(volume.cups).toBe(1);
      expect(breakdown.proteinCups).toBe(0.5);
    });

    it("calculates appropriate portions for a medium dog (Beagle, 25lbs, moderate)", () => {
      const volume = calculateDailyFoodVolume(25, 'moderate');
      const breakdown = calculateIngredientBreakdown(volume.cups);
      
      expect(volume.cups).toBe(2.5);
      expect(breakdown.proteinCups).toBe(1.3); // ~50% of 2.5
    });

    it("calculates appropriate portions for a large dog (Lab, 70lbs, active)", () => {
      const volume = calculateDailyFoodVolume(70, 'active');
      const breakdown = calculateIngredientBreakdown(volume.cups);
      
      // 70/10 * 1.2 = 8.4, rounds to 8.5
      expect(volume.cups).toBe(8.5);
      expect(breakdown.proteinCups).toBe(4.3); // ~50% of 8.5
    });

    it("calculates appropriate portions for a giant dog (Great Dane, 140lbs, moderate)", () => {
      const volume = calculateDailyFoodVolume(140, 'moderate');
      const breakdown = calculateIngredientBreakdown(volume.cups);
      
      // 140/10 = 14, but capped at 12
      expect(volume.cups).toBe(12);
      expect(breakdown.proteinCups).toBe(6); // 50% of 12
    });
  });
});
