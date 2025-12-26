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

// ============================================================================
// COMPREHENSIVE HOLISTIC NUTRITION KNOWLEDGE BASE
// ============================================================================

const CANINE_NUTRITION_CONTEXT = `
You are an expert canine nutritionist with deep knowledge of both Western veterinary nutrition and holistic approaches including Traditional Chinese Veterinary Medicine (TCVM), Ayurvedic veterinary medicine, and functional foods. You create balanced, safe homemade dog food recipes.

=== SAFE FOODS ===
PROTEINS: Chicken, turkey, beef, pork, lamb, salmon, sardines, eggs (cooked), duck, rabbit, venison
VEGETABLES: Carrots, green beans, peas, sweet potatoes, pumpkin, spinach, broccoli, zucchini, celery, cucumber
CARBS: Brown rice, white rice, oatmeal, quinoa, barley, millet
FRUITS: Blueberries, apples (no seeds), bananas, watermelon (no seeds), cranberries

=== TOXIC FOODS - NEVER INCLUDE ===
- Xylitol (extremely toxic)
- Chocolate, Grapes/raisins, Onions/garlic, Macadamia nuts
- Avocado, Alcohol, Caffeine, Raw yeast dough

=== AAFCO NUTRITIONAL GUIDELINES ===
- Protein: 18-25% for adults, 22-32% for puppies
- Fat: 5-8% for adults, 8-10% for puppies
- Calcium: 1-1.8% (critical for homemade diets)
- Phosphorus: 0.8-1.6%
- Ca:P ratio: 1:1 to 2:1

=== REQUIRED SUPPLEMENTS ===
1. Calcium supplement - 1000mg per pound of meat
2. Fish oil/Omega-3 - for skin and coat
3. Multivitamin - trace minerals
`;

// TCVM Food Energetics Knowledge
const TCVM_KNOWLEDGE = `
=== TRADITIONAL CHINESE VETERINARY MEDICINE (TCVM) FOOD THERAPY ===

**FOOD ENERGETICS (Thermal Nature):**

HOT Foods (Yang) - Use for Cold conditions, winter, senior dogs, lethargy:
- Venison, lamb, chicken, trout
- Ginger, cinnamon, turmeric

WARM Foods - Gentle warming, good for most dogs:
- Turkey, beef, ham, shrimp
- Oats, sweet potato, squash, kale

NEUTRAL Foods - Balanced, safe for all constitutions:
- Pork, salmon, eggs, beef liver
- Rice, carrots, green beans, apples

COOL Foods - Use for Hot conditions, inflammation, allergies:
- Duck, rabbit, cod, whitefish
- Barley, millet, spinach, celery, cucumber, watermelon

COLD Foods (Yin) - Strong cooling, use sparingly:
- Clams, crab, tofu
- Banana, seaweed, kelp

**FIVE ELEMENT CONSTITUTIONS:**

WOOD (Liver/Gallbladder) - Competitive, athletic, prone to tendon issues:
- Needs: Cooling foods, leafy greens
- Avoid: Excessive fats, hot foods
- Best proteins: Duck, rabbit, fish
- Best veggies: Celery, spinach, broccoli

FIRE (Heart/Small Intestine) - Excitable, anxious, sensitive:
- Needs: Cooling, calming foods
- Avoid: Stimulating foods, excess protein
- Best proteins: Duck, pork, fish
- Best veggies: Cucumber, celery, bitter greens

EARTH (Spleen/Stomach) - Easygoing, prone to digestive issues, weight gain:
- Needs: Easily digestible, warm foods
- Avoid: Cold, raw, damp foods
- Best proteins: Beef, chicken, lamb
- Best veggies: Sweet potato, carrots, pumpkin

METAL (Lung/Large Intestine) - Aloof, prone to skin/respiratory issues:
- Needs: Moistening foods, white foods
- Avoid: Drying foods
- Best proteins: Duck, pork, fish
- Best veggies: Radish, turnip, cauliflower

WATER (Kidney/Bladder) - Fearful, prone to bone/joint issues, aging:
- Needs: Warming, kidney-supporting foods
- Avoid: Cold, raw foods
- Best proteins: Lamb, venison, kidney meats
- Best veggies: Black beans, sweet potato
`;

// Ayurvedic Knowledge
const AYURVEDIC_KNOWLEDGE = `
=== AYURVEDIC VETERINARY MEDICINE (DOSHA BALANCING) ===

**VATA DOSHA** (Air + Ether) - Thin, nervous, dry skin, constipation:
- Constitution: Anxious, hyperactive, cold-seeking
- Needs: Warm, moist, grounding foods
- Best foods: Cooked grains, warm proteins, healthy fats
- Spices: Ginger, cinnamon, fennel
- Avoid: Raw, cold, dry foods

**PITTA DOSHA** (Fire + Water) - Hot, inflamed, skin issues, digestive fire:
- Constitution: Intense, competitive, heat-intolerant
- Needs: Cooling, calming foods
- Best foods: Sweet vegetables, cooling proteins (fish, turkey)
- Spices: Coriander, fennel, mint
- Avoid: Spicy, sour, fermented foods

**KAPHA DOSHA** (Earth + Water) - Heavy, sluggish, prone to obesity:
- Constitution: Calm, slow, prone to weight gain
- Needs: Light, warming, stimulating foods
- Best foods: Lean proteins, bitter vegetables, minimal grains
- Spices: Turmeric, ginger, black pepper
- Avoid: Heavy, oily, sweet foods
`;

// Raw/BARF Diet Knowledge
const RAW_DIET_KNOWLEDGE = `
=== RAW/BARF DIET PRINCIPLES ===

**Biologically Appropriate Raw Food (BARF) Ratios:**
- 70% muscle meat
- 10% raw meaty bones (calcium source)
- 10% organs (5% liver, 5% other organs)
- 10% vegetables/fruits

**Safety Considerations:**
- Source high-quality, human-grade meats
- Freeze meat for 2-3 weeks to kill parasites
- Handle with strict hygiene
- Not recommended for immunocompromised dogs

**Benefits claimed:**
- Shinier coat, healthier skin
- Cleaner teeth, fresher breath
- Higher energy levels
- Smaller, less odorous stools

**Transition:** Gradual over 7-14 days, mixing with current food
`;

// Condition-Specific Diets
const CONDITION_DIETS = `
=== CONDITION-SPECIFIC THERAPEUTIC DIETS ===

**ANTI-INFLAMMATORY DIET:**
- Focus: Omega-3 rich foods, antioxidants
- Best proteins: Salmon, sardines, mackerel
- Include: Blueberries, turmeric, leafy greens
- Avoid: Grains, nightshades, processed foods
- Supplements: Fish oil (high EPA/DHA), curcumin

**KETOGENIC DIET (for epilepsy/cancer support):**
- Macros: 70% fat, 25% protein, 5% carbs
- Best fats: Coconut oil, MCT oil, fish oil
- Proteins: Fatty meats, eggs, organ meats
- Minimal: Vegetables (low-carb only)
- Avoid: All grains, starchy vegetables, fruits

**RENAL/KIDNEY DIET:**
- Moderate protein (high quality)
- Low phosphorus
- Low sodium
- Include: Egg whites, omega-3s
- Avoid: Organ meats, dairy, bones
- Supplements: B vitamins, potassium

**CARDIAC/HEART DIET:**
- Moderate sodium restriction
- Adequate taurine and L-carnitine
- Omega-3 fatty acids
- Include: Fish, lean meats, vegetables
- Avoid: High-sodium foods, processed meats
- Supplements: Taurine, L-carnitine, CoQ10

**LIVER SUPPORT DIET:**
- High-quality, moderate protein
- Low copper
- Include: Eggs, fish, vegetables
- Avoid: Organ meats, shellfish
- Supplements: SAMe, milk thistle, vitamin E

**DIABETIC DIET:**
- Low glycemic index foods
- High fiber
- Consistent meal timing
- Include: Lean proteins, non-starchy vegetables
- Avoid: Simple carbs, sugary fruits
`;

// Functional Foods Knowledge
const FUNCTIONAL_FOODS = `
=== FUNCTIONAL FOODS & SUPERFOODS FOR DOGS ===

**JOINT & MOBILITY:**
- Bone broth (glucosamine, chondroitin naturally)
- Green-lipped mussel
- Turmeric + black pepper (absorption)
- Omega-3 fatty fish

**DIGESTIVE HEALTH:**
- Pumpkin (fiber, prebiotics)
- Bone broth (gut lining repair)
- Fermented vegetables (probiotics) - small amounts
- Slippery elm (soothing)

**IMMUNE SUPPORT:**
- Medicinal mushrooms (shiitake, reishi, maitake)
- Blueberries (antioxidants)
- Spirulina (immune modulation)
- Garlic - TOXIC, do not use

**SKIN & COAT:**
- Sardines/salmon (omega-3s)
- Coconut oil (MCTs)
- Eggs (biotin)
- Sweet potato (vitamin A)

**COGNITIVE/SENIOR SUPPORT:**
- MCT oil (brain fuel)
- Blueberries (antioxidants)
- Salmon (DHA)
- Eggs (choline)

**CANCER SUPPORT (complementary):**
- Cruciferous vegetables (broccoli, cauliflower)
- Medicinal mushrooms
- Omega-3 fatty acids
- Low-carb approach
`;

// Life Stage & Breed-Specific Knowledge
const LIFE_STAGE_BREED = `
=== LIFE STAGE NUTRITION ===

**PUPPY (Growth):**
- Higher protein (25-30%)
- Higher fat (10-15%)
- Calcium carefully controlled (1.2-1.5%)
- DHA for brain development
- Feed 3-4 times daily

**ADULT (Maintenance):**
- Moderate protein (18-25%)
- Moderate fat (5-8%)
- Feed 2 times daily

**SENIOR (7+ years):**
- High-quality protein (maintain muscle)
- Lower calories (prevent obesity)
- Joint support (glucosamine, omega-3s)
- Antioxidants for cognitive health
- Easily digestible foods

**PREGNANT/LACTATING:**
- Increase calories 25-50%
- Higher protein and fat
- Calcium supplementation careful (avoid excess early)
- DHA for puppy development

=== BREED-SPECIFIC CONSIDERATIONS ===

**LARGE/GIANT BREEDS:**
- Controlled calcium during growth (prevent bone issues)
- Glucosamine/chondroitin for joints
- Avoid rapid growth
- Prone to: Hip dysplasia, bloat

**SMALL/TOY BREEDS:**
- Higher metabolism, need calorie-dense food
- Small, frequent meals (prevent hypoglycemia)
- Dental health focus
- Prone to: Dental disease, patellar luxation

**BRACHYCEPHALIC (Flat-faced):**
- Easy-to-eat textures
- Avoid obesity (breathing issues)
- Cooling foods in summer
- Prone to: Overheating, respiratory issues

**DALMATIANS:**
- Low purine diet (prevent urate stones)
- Avoid: Organ meats, sardines, anchovies
- Prefer: Eggs, dairy, vegetables

**GOLDEN RETRIEVERS:**
- Cancer prevention focus
- Antioxidant-rich foods
- Omega-3s for skin (prone to allergies)
- Weight management

**GERMAN SHEPHERDS:**
- Digestive sensitivity common
- Easily digestible proteins
- Probiotics beneficial
- Joint support early
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

// Generate recipe based on dog profile with holistic nutrition methods
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

    // Build comprehensive system context based on dog's holistic preferences
    let systemContext = CANINE_NUTRITION_CONTEXT;
    
    // Add TCVM knowledge if constitution is specified
    if (dog.tcvmConstitution || dog.tcvmFoodEnergetics) {
      systemContext += "\n\n" + TCVM_KNOWLEDGE;
    }
    
    // Add Ayurvedic knowledge if dosha is specified
    if (dog.ayurvedicDosha) {
      systemContext += "\n\n" + AYURVEDIC_KNOWLEDGE;
    }
    
    // Add raw diet knowledge if preferred
    if (dog.preferRawFood) {
      systemContext += "\n\n" + RAW_DIET_KNOWLEDGE;
    }
    
    // Add condition-specific diet knowledge
    if (dog.conditionDiet || healthConditions.length > 0) {
      systemContext += "\n\n" + CONDITION_DIETS;
    }
    
    // Always include functional foods and life stage info
    systemContext += "\n\n" + FUNCTIONAL_FOODS;
    systemContext += "\n\n" + LIFE_STAGE_BREED;

    // Build the recipe prompt
    let prompt = `Create a homemade dog food recipe for:
- Name: ${dog.name}
- Breed: ${dog.breed || "Mixed breed"}
- Weight: ${dog.weightLbs} lbs
- Age: ${dog.ageYears} years${dog.ageMonths ? ` and ${dog.ageMonths} months` : ''}
- Life Stage: ${dog.lifeStage}
- Size Category: ${dog.sizeCategory}
- Activity Level: ${dog.activityLevel}
- Daily Calorie Needs: ${dog.dailyCalories || 'calculate based on weight'} calories

**CRITICAL PORTION REQUIREMENTS:**
This dog needs ${dailyVolume.cups} cups of food per day (${dailyVolume.ounces} oz).

The recipe MUST produce EXACTLY ${dailyVolume.cups} cups total when all ingredients are combined:
- Protein (meat/fish/eggs): ${breakdown.proteinCups} cups
- Vegetables: ${breakdown.vegetableCups} cups
- Carbohydrates: ${breakdown.carbCups} cups
- Healthy fats/oils: ${breakdown.fatCups} cups
`;

    // Add holistic nutrition preferences
    if (dog.nutritionPhilosophy && dog.nutritionPhilosophy !== 'balanced') {
      prompt += `\n**NUTRITION PHILOSOPHY:** ${dog.nutritionPhilosophy}`;
    }

    if (dog.tcvmConstitution) {
      prompt += `\n**TCVM CONSTITUTION:** ${dog.tcvmConstitution} - Select foods that support this Five Element constitution type.`;
    }

    if (dog.tcvmFoodEnergetics) {
      prompt += `\n**TCVM FOOD ENERGETICS:** Prefer ${dog.tcvmFoodEnergetics} thermal nature foods.`;
    }

    if (dog.ayurvedicDosha) {
      prompt += `\n**AYURVEDIC DOSHA:** ${dog.ayurvedicDosha} - Balance this dosha with appropriate food choices.`;
    }

    if (dog.preferRawFood) {
      prompt += `\n**RAW FOOD PREFERENCE:** Create a raw/BARF-style recipe following proper ratios (70% muscle meat, 10% bone, 10% organs, 10% vegetables). Include safety notes.`;
    }

    if (dog.conditionDiet) {
      prompt += `\n**THERAPEUTIC DIET:** Follow ${dog.conditionDiet} diet guidelines strictly.`;
    }
    
    if (allergies.length > 0) {
      prompt += `\n**ALLERGIES (MUST AVOID):** ${allergies.join(", ")}`;
    }
    if (restrictions.length > 0) {
      prompt += `\n**DIETARY RESTRICTIONS:** ${restrictions.join(", ")}`;
    }
    if (healthConditions.length > 0) {
      prompt += `\n**HEALTH CONDITIONS:** ${healthConditions.join(", ")} - Adjust recipe to support these conditions.`;
    }
    if (kibbleIngredients) {
      prompt += `\n**CURRENT KIBBLE INGREDIENTS TO MATCH:** ${kibbleIngredients}`;
    }
    
    prompt += `

Create a nutritionally balanced recipe that:
1. Meets AAFCO nutritional guidelines
2. Incorporates the specified holistic nutrition preferences (TCVM, Ayurvedic, etc.)
3. Avoids all allergens listed
4. Provides appropriate calories for this dog
5. Produces EXACTLY ${dailyVolume.cups} cups of food when combined
6. Includes required supplements with specific amounts
7. Includes functional foods appropriate for this dog's needs
8. Is practical to prepare at home

Include a "holisticNotes" section explaining how the recipe addresses the dog's specific constitution/dosha and any therapeutic considerations.`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: systemContext
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
                    category: { type: "string", enum: ["protein", "vegetable", "carb", "fat", "supplement", "functional", "other"] },
                    thermalNature: { type: "string", enum: ["hot", "warm", "neutral", "cool", "cold", "n/a"], description: "TCVM thermal nature" }
                  },
                  required: ["name", "amount", "unit", "volumeCups", "category", "thermalNature"],
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
                    reason: { type: "string" },
                    purchaseLink: { type: "string", description: "Suggested product or search term" }
                  },
                  required: ["name", "amount", "reason", "purchaseLink"],
                  additionalProperties: false
                }
              },
              functionalFoods: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    benefit: { type: "string" },
                    amount: { type: "string" }
                  },
                  required: ["name", "benefit", "amount"],
                  additionalProperties: false
                }
              },
              holisticNotes: {
                type: "object",
                properties: {
                  tcvmAnalysis: { type: "string", description: "How recipe supports TCVM constitution" },
                  ayurvedicAnalysis: { type: "string", description: "How recipe balances dosha" },
                  therapeuticNotes: { type: "string", description: "Notes on condition-specific adjustments" },
                  seasonalAdjustments: { type: "string", description: "Suggestions for seasonal modifications" }
                },
                required: ["tcvmAnalysis", "ayurvedicAnalysis", "therapeuticNotes", "seasonalAdjustments"],
                additionalProperties: false
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
              cookTimeMinutes: { type: "number" },
              storageInstructions: { type: "string" },
              transitionGuide: { type: "string", description: "How to transition dog to this food" }
            },
            required: ["name", "description", "totalVolumeCups", "ingredients", "instructions", "nutrition", "supplements", "functionalFoods", "holisticNotes", "servingInfo", "prepTimeMinutes", "cookTimeMinutes", "storageInstructions", "transitionGuide"],
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
