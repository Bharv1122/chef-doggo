import { Router } from "express";
import { invokeLLM } from "./_core/llm";

const router = Router();

// Calculate daily food volume based on dog's weight
// General guideline: dogs eat 2-3% of body weight per day in fresh food
// This translates to roughly 1 cup per 10 lbs of body weight
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

// Calculate ingredient breakdown by category
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

// Canine nutrition knowledge for recipe generation
const CANINE_NUTRITION_CONTEXT = `
You are an expert canine nutritionist creating homemade dog food recipes. Follow these guidelines:

SAFE PROTEINS: Chicken, turkey, beef, pork, lamb, salmon, sardines, eggs (cooked)
SAFE VEGETABLES: Carrots, green beans, peas, sweet potatoes, pumpkin, spinach, broccoli, zucchini
SAFE CARBS: Brown rice, white rice, oatmeal, quinoa, barley
SAFE FRUITS: Blueberries, apples (no seeds), bananas, watermelon (no seeds)

TOXIC FOODS TO NEVER INCLUDE:
- Xylitol (extremely toxic)
- Chocolate
- Grapes/raisins
- Onions/garlic
- Macadamia nuts
- Avocado
- Alcohol
- Caffeine
- Raw yeast dough

NUTRITIONAL GUIDELINES (AAFCO):
- Protein: 18-25% for adults, 22-32% for puppies
- Fat: 5-8% for adults, 8-10% for puppies
- Calcium: 1-1.8% (critical for homemade diets)
- Phosphorus: 0.8-1.6%
- Ca:P ratio: 1:1 to 2:1

REQUIRED SUPPLEMENTS for homemade diets:
1. Calcium supplement (most critical) - 1000mg per pound of meat
2. Fish oil/Omega-3 - for skin and coat health
3. Multivitamin - to cover trace minerals

VOLUME CONVERSIONS:
- 1 pound of cooked meat = approximately 2 cups
- 1 pound of cooked vegetables = approximately 2-3 cups
- 1 cup of cooked rice = 1 cup
- 1 pound of sweet potato (mashed) = approximately 2 cups
`;

// Analyze kibble label image
router.post("/api/analyze-kibble", async (req, res) => {
  try {
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: "No image provided" });
    }

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are an expert at reading pet food ingredient labels. Extract and list all ingredients from the image. Return only the ingredients as a comma-separated list, nothing else."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please read this dog food ingredient label and list all the ingredients you can see."
            },
            {
              type: "image_url",
              image_url: {
                url: image,
                detail: "high"
              }
            }
          ]
        }
      ]
    });

    const ingredients = response.choices[0]?.message?.content || "";
    
    res.json({ ingredients });
  } catch (error) {
    console.error("Error analyzing kibble:", error);
    res.status(500).json({ error: "Failed to analyze image" });
  }
});

// Generate recipe based on dog profile
router.post("/api/generate-recipe", async (req, res) => {
  try {
    const { dog, kibbleIngredients } = req.body;
    
    if (!dog) {
      return res.status(400).json({ error: "No dog profile provided" });
    }

    const allergies = dog.allergies ? JSON.parse(dog.allergies) : [];
    const restrictions = dog.dietaryRestrictions ? JSON.parse(dog.dietaryRestrictions) : [];
    const healthConditions = dog.healthConditions ? JSON.parse(dog.healthConditions) : [];

    // Calculate proper food volume for this dog
    const dailyVolume = calculateDailyFoodVolume(dog.weightLbs, dog.activityLevel || 'moderate');
    const breakdown = calculateIngredientBreakdown(dailyVolume.cups);

    let prompt = `Create a homemade dog food recipe for:
- Name: ${dog.name}
- Breed: ${dog.breed || "Mixed breed"}
- Weight: ${dog.weightLbs} lbs
- Age: ${dog.ageYears} years
- Life Stage: ${dog.lifeStage}
- Size Category: ${dog.sizeCategory}
- Activity Level: ${dog.activityLevel}
- Daily Calorie Needs: ${dog.dailyCalories} calories

**CRITICAL PORTION REQUIREMENTS:**
This dog needs ${dailyVolume.cups} cups of food per day (${dailyVolume.ounces} oz).

The recipe MUST produce EXACTLY ${dailyVolume.cups} cups total when all ingredients are combined:
- Protein (meat/fish/eggs): ${breakdown.proteinCups} cups (approximately ${Math.round(breakdown.proteinCups / 2 * 10) / 10} lbs of cooked meat)
- Vegetables: ${breakdown.vegetableCups} cups
- Carbohydrates (rice/oats): ${breakdown.carbCups} cups (cooked)
- Healthy fats/oils: ${breakdown.fatCups} cups (or equivalent tablespoons)

Use these volume targets when specifying ingredient amounts. Express amounts in CUPS for easy measuring, not pounds.
`;
    
    if (allergies.length > 0) {
      prompt += `\n- ALLERGIES (MUST AVOID): ${allergies.join(", ")}`;
    }
    if (restrictions.length > 0) {
      prompt += `\n- Dietary Restrictions: ${restrictions.join(", ")}`;
    }
    if (healthConditions.length > 0) {
      prompt += `\n- Health Conditions: ${healthConditions.join(", ")}`;
    }
    if (kibbleIngredients) {
      prompt += `\n- Current kibble ingredients to match: ${kibbleIngredients}`;
    }
    
    prompt += `

Create a nutritionally balanced recipe that:
1. Meets AAFCO nutritional guidelines
2. Avoids all allergens listed
3. Provides ${dog.dailyCalories} calories total
4. Produces EXACTLY ${dailyVolume.cups} cups of food when combined
5. Includes required supplements with specific amounts
6. Is practical to prepare at home
7. Uses CUPS as the primary measurement unit for easy portioning

IMPORTANT: Double-check that the total volume of all ingredients equals ${dailyVolume.cups} cups.`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: CANINE_NUTRITION_CONTEXT
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "dog_recipe",
          strict: true,
          schema: {
            type: "object",
            properties: {
              name: { type: "string", description: "Creative recipe name" },
              description: { type: "string", description: "Brief description of the recipe" },
              totalVolumeCups: { type: "number", description: "Total volume of the recipe in cups" },
              ingredients: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    amount: { type: "string" },
                    unit: { type: "string" },
                    volumeCups: { type: "number", description: "Volume contribution in cups" },
                    category: { type: "string", enum: ["protein", "vegetable", "carb", "fat", "supplement", "other"] }
                  },
                  required: ["name", "amount", "unit", "volumeCups", "category"],
                  additionalProperties: false
                }
              },
              instructions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    step: { type: "number" },
                    instruction: { type: "string" }
                  },
                  required: ["step", "instruction"],
                  additionalProperties: false
                }
              },
              nutrition: {
                type: "object",
                properties: {
                  totalCalories: { type: "number", description: "Total calories for the entire recipe" },
                  caloriesPerCup: { type: "number", description: "Calories per cup" },
                  proteinGrams: { type: "number" },
                  fatGrams: { type: "number" },
                  carbGrams: { type: "number" },
                  fiberGrams: { type: "number" }
                },
                required: ["totalCalories", "caloriesPerCup", "proteinGrams", "fatGrams", "carbGrams", "fiberGrams"],
                additionalProperties: false
              },
              supplements: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    amount: { type: "string" },
                    reason: { type: "string" }
                  },
                  required: ["name", "amount", "reason"],
                  additionalProperties: false
                }
              },
              servingInfo: {
                type: "object",
                properties: {
                  totalCups: { type: "number", description: "Total cups this recipe makes" },
                  cupsPerMeal: { type: "number", description: "Cups per meal" },
                  mealsPerDay: { type: "number", description: "Number of meals per day" },
                  daysThisRecipeLasts: { type: "number", description: "How many days this batch lasts" }
                },
                required: ["totalCups", "cupsPerMeal", "mealsPerDay", "daysThisRecipeLasts"],
                additionalProperties: false
              },
              prepTimeMinutes: { type: "number" },
              cookTimeMinutes: { type: "number" }
            },
            required: ["name", "description", "totalVolumeCups", "ingredients", "instructions", "nutrition", "supplements", "servingInfo", "prepTimeMinutes", "cookTimeMinutes"],
            additionalProperties: false
          }
        }
      }
    });

    const recipeContent = response.choices[0]?.message?.content;
    if (!recipeContent || typeof recipeContent !== 'string') {
      throw new Error("No recipe generated");
    }

    const recipe = JSON.parse(recipeContent);
    
    // Add the calculated daily volume to the response for reference
    recipe.calculatedDailyVolume = dailyVolume;
    recipe.ingredientBreakdown = breakdown;
    
    res.json(recipe);
  } catch (error) {
    console.error("Error generating recipe:", error);
    res.status(500).json({ error: "Failed to generate recipe" });
  }
});

export default router;
