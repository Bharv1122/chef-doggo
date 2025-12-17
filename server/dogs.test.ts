import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database functions
vi.mock("./db", () => ({
  createDogProfile: vi.fn(),
  getDogProfiles: vi.fn(),
  getDogProfileById: vi.fn(),
  updateDogProfile: vi.fn(),
  deleteDogProfile: vi.fn(),
  createRecipe: vi.fn(),
  getRecipes: vi.fn(),
  getRecipeById: vi.fn(),
  updateRecipe: vi.fn(),
  deleteRecipe: vi.fn(),
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
  getDb: vi.fn(),
}));

import * as db from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createUnauthContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("dogs router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("dogs.list", () => {
    it("returns list of dogs for authenticated user", async () => {
      const mockDogs = [
        { id: 1, userId: 1, name: "Buddy", breed: "Labrador", weightLbs: 65 },
        { id: 2, userId: 1, name: "Max", breed: "Beagle", weightLbs: 25 },
      ];
      
      vi.mocked(db.getDogProfiles).mockResolvedValue(mockDogs as any);
      
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.dogs.list();
      
      expect(result).toEqual(mockDogs);
      expect(db.getDogProfiles).toHaveBeenCalledWith(1);
    });

    it("throws error for unauthenticated user", async () => {
      const ctx = createUnauthContext();
      const caller = appRouter.createCaller(ctx);
      
      await expect(caller.dogs.list()).rejects.toThrow();
    });
  });

  describe("dogs.create", () => {
    it("creates a new dog profile", async () => {
      const newDog = {
        name: "Buddy",
        breed: "Labrador",
        weightLbs: 65,
        ageYears: 3,
        ageMonths: 6,
        sizeCategory: "large" as const,
        lifeStage: "adult" as const,
        activityLevel: "active" as const,
        allergies: ["chicken"],
        dietaryRestrictions: [],
        healthConditions: [],
      };
      
      const createdDog = {
        id: 1,
        userId: 1,
        ...newDog,
        allergies: JSON.stringify(newDog.allergies),
        dietaryRestrictions: null,
        healthConditions: null,
        dailyCalories: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      vi.mocked(db.createDogProfile).mockResolvedValue(createdDog as any);
      
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.dogs.create(newDog);
      
      expect(result).toEqual(createdDog);
      expect(db.createDogProfile).toHaveBeenCalledWith(expect.objectContaining({
        userId: 1,
        name: "Buddy",
        breed: "Labrador",
      }));
    });
  });

  describe("dogs.get", () => {
    it("returns dog profile for owner", async () => {
      const mockDog = {
        id: 1,
        userId: 1,
        name: "Buddy",
        breed: "Labrador",
        weightLbs: 65,
      };
      
      vi.mocked(db.getDogProfileById).mockResolvedValue(mockDog as any);
      
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.dogs.get({ id: 1 });
      
      expect(result).toEqual(mockDog);
    });

    it("throws error when dog belongs to different user", async () => {
      const mockDog = {
        id: 1,
        userId: 2, // Different user
        name: "Buddy",
      };
      
      vi.mocked(db.getDogProfileById).mockResolvedValue(mockDog as any);
      
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);
      
      await expect(caller.dogs.get({ id: 1 })).rejects.toThrow("Dog not found");
    });

    it("throws error when dog does not exist", async () => {
      vi.mocked(db.getDogProfileById).mockResolvedValue(null);
      
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      
      await expect(caller.dogs.get({ id: 999 })).rejects.toThrow("Dog not found");
    });
  });

  describe("dogs.delete", () => {
    it("deletes dog profile for owner", async () => {
      const mockDog = { id: 1, userId: 1, name: "Buddy" };
      
      vi.mocked(db.getDogProfileById).mockResolvedValue(mockDog as any);
      vi.mocked(db.deleteDogProfile).mockResolvedValue({ success: true });
      
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.dogs.delete({ id: 1 });
      
      expect(result).toEqual({ success: true });
      expect(db.deleteDogProfile).toHaveBeenCalledWith(1);
    });

    it("throws error when deleting another user's dog", async () => {
      const mockDog = { id: 1, userId: 2, name: "Buddy" };
      
      vi.mocked(db.getDogProfileById).mockResolvedValue(mockDog as any);
      
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);
      
      await expect(caller.dogs.delete({ id: 1 })).rejects.toThrow("Dog not found");
    });
  });
});

describe("recipes router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("recipes.list", () => {
    it("returns list of recipes for authenticated user", async () => {
      const mockRecipes = [
        { id: 1, userId: 1, name: "Chicken Delight", dogProfileId: 1 },
        { id: 2, userId: 1, name: "Beef Bowl", dogProfileId: 1 },
      ];
      
      vi.mocked(db.getRecipes).mockResolvedValue(mockRecipes as any);
      
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.recipes.list();
      
      expect(result).toEqual(mockRecipes);
      expect(db.getRecipes).toHaveBeenCalledWith(1);
    });
  });

  describe("recipes.create", () => {
    it("creates a new recipe for user's dog", async () => {
      const mockDog = { id: 1, userId: 1, name: "Buddy" };
      const newRecipe = {
        dogProfileId: 1,
        name: "Chicken Delight",
        description: "A healthy chicken recipe",
        ingredients: JSON.stringify([{ name: "chicken", amount: "1", unit: "lb", category: "protein" }]),
        instructions: JSON.stringify([{ step: 1, instruction: "Cook chicken" }]),
      };
      
      const createdRecipe = {
        id: 1,
        userId: 1,
        ...newRecipe,
        isFavorite: false,
        createdAt: new Date(),
      };
      
      vi.mocked(db.getDogProfileById).mockResolvedValue(mockDog as any);
      vi.mocked(db.createRecipe).mockResolvedValue(createdRecipe as any);
      
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.recipes.create(newRecipe);
      
      expect(result).toEqual(createdRecipe);
    });

    it("throws error when creating recipe for another user's dog", async () => {
      const mockDog = { id: 1, userId: 2, name: "Buddy" }; // Different user
      
      vi.mocked(db.getDogProfileById).mockResolvedValue(mockDog as any);
      
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);
      
      await expect(caller.recipes.create({
        dogProfileId: 1,
        name: "Test Recipe",
        ingredients: "[]",
        instructions: "[]",
      })).rejects.toThrow("Dog not found");
    });
  });

  describe("recipes.toggleFavorite", () => {
    it("toggles favorite status", async () => {
      const mockRecipe = { id: 1, userId: 1, name: "Chicken", isFavorite: false };
      const updatedRecipe = { ...mockRecipe, isFavorite: true };
      
      vi.mocked(db.getRecipeById).mockResolvedValue(mockRecipe as any);
      vi.mocked(db.updateRecipe).mockResolvedValue(updatedRecipe as any);
      
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.recipes.toggleFavorite({ id: 1 });
      
      expect(result).toEqual(updatedRecipe);
      expect(db.updateRecipe).toHaveBeenCalledWith(1, { isFavorite: true });
    });
  });
});
