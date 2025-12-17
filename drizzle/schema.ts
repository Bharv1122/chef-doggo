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
}

export interface RecipeSupplement {
  name: string;
  amount: string;
  reason: string;
}
