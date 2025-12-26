import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { 
  createDogProfile, 
  getDogProfiles, 
  getDogProfileById,
  updateDogProfile, 
  deleteDogProfile,
  createRecipe,
  getRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe
} from "./db";

// Shared schema for dog profile fields
const dogProfileFields = {
  name: z.string().min(1).max(100),
  breed: z.string().max(100).nullable().optional(),
  weightLbs: z.number().min(1).max(300),
  ageYears: z.number().min(0).max(25),
  ageMonths: z.number().min(0).max(11).optional(),
  sizeCategory: z.enum(["toy", "small", "medium", "large", "giant"]),
  lifeStage: z.enum(["puppy", "adult", "senior"]),
  activityLevel: z.enum(["sedentary", "moderate", "active", "very_active"]),
  allergies: z.array(z.string()).optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
  healthConditions: z.array(z.string()).optional(),
  dailyCalories: z.number().optional(),
  // Holistic nutrition fields
  tcvmConstitution: z.string().max(50).nullable().optional(),
  tcvmFoodEnergetics: z.string().max(50).nullable().optional(),
  ayurvedicDosha: z.string().max(50).nullable().optional(),
  nutritionPhilosophy: z.string().max(100).optional(),
  preferRawFood: z.boolean().optional(),
  conditionDiet: z.string().max(100).nullable().optional(),
};

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  dogs: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getDogProfiles(ctx.user.id);
    }),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const dog = await getDogProfileById(input.id);
        if (!dog || dog.userId !== ctx.user.id) {
          throw new Error("Dog not found");
        }
        return dog;
      }),
    
    create: protectedProcedure
      .input(z.object(dogProfileFields))
      .mutation(async ({ ctx, input }) => {
        return createDogProfile({
          userId: ctx.user.id,
          name: input.name,
          breed: input.breed || null,
          weightLbs: input.weightLbs,
          ageYears: input.ageYears,
          ageMonths: input.ageMonths || 0,
          sizeCategory: input.sizeCategory,
          lifeStage: input.lifeStage,
          activityLevel: input.activityLevel,
          allergies: input.allergies ? JSON.stringify(input.allergies) : null,
          dietaryRestrictions: input.dietaryRestrictions ? JSON.stringify(input.dietaryRestrictions) : null,
          healthConditions: input.healthConditions ? JSON.stringify(input.healthConditions) : null,
          dailyCalories: input.dailyCalories || null,
          // Holistic nutrition fields
          tcvmConstitution: input.tcvmConstitution || null,
          tcvmFoodEnergetics: input.tcvmFoodEnergetics || null,
          ayurvedicDosha: input.ayurvedicDosha || null,
          nutritionPhilosophy: input.nutritionPhilosophy || "balanced",
          preferRawFood: input.preferRawFood || false,
          conditionDiet: input.conditionDiet || null,
        });
      }),
    
    update: protectedProcedure
      .input(z.object({ id: z.number(), ...dogProfileFields }))
      .mutation(async ({ ctx, input }) => {
        const existing = await getDogProfileById(input.id);
        if (!existing || existing.userId !== ctx.user.id) {
          throw new Error("Dog not found");
        }
        return updateDogProfile(input.id, {
          name: input.name,
          breed: input.breed || null,
          weightLbs: input.weightLbs,
          ageYears: input.ageYears,
          ageMonths: input.ageMonths || 0,
          sizeCategory: input.sizeCategory,
          lifeStage: input.lifeStage,
          activityLevel: input.activityLevel,
          allergies: input.allergies ? JSON.stringify(input.allergies) : null,
          dietaryRestrictions: input.dietaryRestrictions ? JSON.stringify(input.dietaryRestrictions) : null,
          healthConditions: input.healthConditions ? JSON.stringify(input.healthConditions) : null,
          dailyCalories: input.dailyCalories || null,
          // Holistic nutrition fields
          tcvmConstitution: input.tcvmConstitution || null,
          tcvmFoodEnergetics: input.tcvmFoodEnergetics || null,
          ayurvedicDosha: input.ayurvedicDosha || null,
          nutritionPhilosophy: input.nutritionPhilosophy || "balanced",
          preferRawFood: input.preferRawFood || false,
          conditionDiet: input.conditionDiet || null,
        });
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const existing = await getDogProfileById(input.id);
        if (!existing || existing.userId !== ctx.user.id) {
          throw new Error("Dog not found");
        }
        return deleteDogProfile(input.id);
      }),
  }),

  recipes: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getRecipes(ctx.user.id);
    }),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const recipe = await getRecipeById(input.id);
        if (!recipe || recipe.userId !== ctx.user.id) {
          throw new Error("Recipe not found");
        }
        return recipe;
      }),
    
    create: protectedProcedure
      .input(z.object({
        dogProfileId: z.number(),
        name: z.string().min(1).max(200),
        description: z.string().optional(),
        ingredients: z.string(),
        instructions: z.string(),
        nutrition: z.string().optional(),
        supplements: z.string().optional(),
        servingSize: z.string().optional(),
        servingsPerDay: z.number().optional(),
        prepTimeMinutes: z.number().optional(),
        cookTimeMinutes: z.number().optional(),
        kibbleIngredients: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const dog = await getDogProfileById(input.dogProfileId);
        if (!dog || dog.userId !== ctx.user.id) {
          throw new Error("Dog not found");
        }
        return createRecipe({
          userId: ctx.user.id,
          dogProfileId: input.dogProfileId,
          name: input.name,
          description: input.description || null,
          ingredients: input.ingredients,
          instructions: input.instructions,
          nutrition: input.nutrition || null,
          supplements: input.supplements || null,
          servingSize: input.servingSize || null,
          servingsPerDay: input.servingsPerDay || null,
          prepTimeMinutes: input.prepTimeMinutes || null,
          cookTimeMinutes: input.cookTimeMinutes || null,
          kibbleIngredients: input.kibbleIngredients || null,
        });
      }),
    
    toggleFavorite: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const recipe = await getRecipeById(input.id);
        if (!recipe || recipe.userId !== ctx.user.id) {
          throw new Error("Recipe not found");
        }
        return updateRecipe(input.id, { isFavorite: !recipe.isFavorite });
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const recipe = await getRecipeById(input.id);
        if (!recipe || recipe.userId !== ctx.user.id) {
          throw new Error("Recipe not found");
        }
        return deleteRecipe(input.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
