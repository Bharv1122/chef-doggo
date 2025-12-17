import { Router } from "express";
import { invokeLLM } from "./_core/llm";

const router = Router();

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

    let prompt = "Create a homemade dog food recipe for:\n";
    prompt += "- Name: " + dog.name + "\n";
    prompt += "- Breed: " + (dog.breed || "Mixed breed") + "\n";
    prompt += "- Weight: " + dog.weightLbs + " lbs\n";
    prompt += "- Age: " + dog.ageYears + " years\n";
    prompt += "- Life Stage: " + dog.lifeStage + "\n";
    prompt += "- Size Category: " + dog.sizeCategory + "\n";
    prompt += "- Activity Level: " + dog.activityLevel + "\n";
    prompt += "- Daily Calorie Needs: " + dog.dailyCalories + " calories\n";
    
    if (allergies.length > 0) {
      prompt += "- ALLERGIES (MUST AVOID): " + allergies.join(", ") + "\n";
    }
    if (restrictions.length > 0) {
      prompt += "- Dietary Restrictions: " + restrictions.join(", ") + "\n";
    }
    if (healthConditions.length > 0) {
      prompt += "- Health Conditions: " + healthConditions.join(", ") + "\n";
    }
    if (kibbleIngredients) {
      prompt += "- Current kibble ingredients to match: " + kibbleIngredients + "\n";
    }
    
    prompt += "\nCreate a nutritionally balanced recipe that:\n";
    prompt += "1. Meets AAFCO nutritional guidelines\n";
    prompt += "2. Avoids all allergens listed\n";
    prompt += "3. Provides appropriate calories for this dog\n";
    prompt += "4. Includes required supplements with specific amounts\n";
    prompt += "5. Is practical to prepare at home\n";

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
              ingredients: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    amount: { type: "string" },
                    unit: { type: "string" },
                    category: { type: "string", enum: ["protein", "vegetable", "carb", "supplement", "other"] }
                  },
                  required: ["name", "amount", "unit", "category"],
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
                  caloriesPerServing: { type: "number" },
                  protein: { type: "number" },
                  fat: { type: "number" },
                  carbohydrates: { type: "number" }
                },
                required: ["caloriesPerServing", "protein", "fat", "carbohydrates"],
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
              servingSize: { type: "string" },
              servingsPerDay: { type: "number" },
              prepTimeMinutes: { type: "number" },
              cookTimeMinutes: { type: "number" }
            },
            required: ["name", "description", "ingredients", "instructions", "nutrition", "supplements", "servingSize", "servingsPerDay", "prepTimeMinutes", "cookTimeMinutes"],
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
    res.json(recipe);
  } catch (error) {
    console.error("Error generating recipe:", error);
    res.status(500).json({ error: "Failed to generate recipe" });
  }
});

export default router;
