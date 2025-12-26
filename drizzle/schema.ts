import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  hasAcceptedDisclaimer: boolean("hasAcceptedDisclaimer").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Dog profiles - stores information about user's dogs
 * JSON fields stored as TEXT to avoid TiDB compatibility issues
 */
export const dogProfiles = mysqlTable("dog_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  breed: varchar("breed", { length: 100 }),
  weightLbs: int("weightLbs").notNull(),
  ageYears: int("ageYears").notNull(),
  ageMonths: int("ageMonths").default(0),
  sizeCategory: mysqlEnum("sizeCategory", ["toy", "small", "medium", "large", "giant"]).notNull(),
  lifeStage: mysqlEnum("lifeStage", ["puppy", "adult", "senior"]).notNull(),
  activityLevel: mysqlEnum("activityLevel", ["sedentary", "moderate", "active", "very_active"]).default("moderate").notNull(),
  allergies: text("allergies"), // JSON string array
  dietaryRestrictions: text("dietaryRestrictions"), // JSON string array
  healthConditions: text("healthConditions"), // JSON string array
  dailyCalories: int("dailyCalories"),
  photoUrl: text("photoUrl"),
  
  // Holistic Nutrition Philosophy Fields
  tcvmConstitution: varchar("tcvmConstitution", { length: 50 }), // fire, earth, metal, water, wood
  tcvmFoodEnergetics: varchar("tcvmFoodEnergetics", { length: 50 }), // warming, cooling, neutral
  ayurvedicDosha: varchar("ayurvedicDosha", { length: 50 }), // vata, pitta, kapha, vata-pitta, pitta-kapha, vata-kapha
  nutritionPhilosophy: varchar("nutritionPhilosophy", { length: 100 }).default("balanced"), // balanced, barf, prey-model, rotational, functional
  preferRawFood: boolean("preferRawFood").default(false),
  conditionDiet: varchar("conditionDiet", { length: 100 }), // anti-inflammatory, ketogenic, renal, cardiac, diabetic
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DogProfile = typeof dogProfiles.$inferSelect;
export type InsertDogProfile = typeof dogProfiles.$inferInsert;

/**
 * Saved recipes - stores generated recipes for users
 * JSON fields stored as TEXT to avoid TiDB compatibility issues
 */
export const savedRecipes = mysqlTable("saved_recipes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  dogProfileId: int("dogProfileId").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  ingredients: text("ingredients").notNull(), // JSON array
  instructions: text("instructions").notNull(), // JSON array
  nutrition: text("nutrition"), // JSON object
  supplements: text("supplements"), // JSON array
  servingSize: varchar("servingSize", { length: 100 }),
  servingsPerDay: int("servingsPerDay"),
  prepTimeMinutes: int("prepTimeMinutes"),
  cookTimeMinutes: int("cookTimeMinutes"),
  kibbleIngredients: text("kibbleIngredients"),
  isFavorite: boolean("isFavorite").default(false),
  rating: int("rating"),
  notes: text("notes"),
  
  // Nutrition method used for this recipe
  nutritionMethods: text("nutritionMethods"), // JSON array of methods used
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SavedRecipe = typeof savedRecipes.$inferSelect;
export type InsertSavedRecipe = typeof savedRecipes.$inferInsert;

// Type helpers for JSON fields
export interface RecipeIngredient {
  name: string;
  amount: string;
  unit: string;
  category: "protein" | "vegetable" | "carb" | "supplement" | "other";
  volume?: string; // Volume contribution in cups
  tcvmEnergy?: "warming" | "cooling" | "neutral";
  ayurvedicEffect?: string;
}

export interface RecipeInstruction {
  step: number;
  instruction: string;
}

export interface RecipeNutrition {
  caloriesPerServing: number;
  protein: number;
  fat: number;
  carbohydrates: number;
  fiber?: number;
  calcium?: number;
  phosphorus?: number;
}

export interface RecipeSupplement {
  name: string;
  amount: string;
  reason: string;
  purchaseLink?: string;
}

// TCVM Constitution Types
export type TCVMConstitution = "fire" | "earth" | "metal" | "water" | "wood";

// Ayurvedic Dosha Types
export type AyurvedicDosha = "vata" | "pitta" | "kapha" | "vata-pitta" | "pitta-kapha" | "vata-kapha";

// Food Energetics
export type FoodEnergetics = "warming" | "cooling" | "neutral";

// Nutrition Philosophy
export type NutritionPhilosophy = "balanced" | "barf" | "prey-model" | "rotational" | "functional";

// Condition-Specific Diets
export type ConditionDiet = "anti-inflammatory" | "ketogenic" | "renal" | "cardiac" | "diabetic" | "elimination";
