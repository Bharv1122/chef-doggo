import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, dogProfiles, savedRecipes, InsertDogProfile, InsertSavedRecipe } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ Dog Profile Functions ============

export async function createDogProfile(data: Omit<InsertDogProfile, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(dogProfiles).values(data);
  const insertId = result[0].insertId;
  return getDogProfileById(insertId);
}

export async function getDogProfiles(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(dogProfiles).where(eq(dogProfiles.userId, userId));
}

export async function getDogProfileById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(dogProfiles).where(eq(dogProfiles.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateDogProfile(id: number, data: Partial<Omit<InsertDogProfile, "id" | "userId" | "createdAt">>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(dogProfiles).set(data).where(eq(dogProfiles.id, id));
  return getDogProfileById(id);
}

export async function deleteDogProfile(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(dogProfiles).where(eq(dogProfiles.id, id));
  return { success: true };
}

// ============ Recipe Functions ============

export async function createRecipe(data: Omit<InsertSavedRecipe, "id" | "createdAt" | "isFavorite" | "rating" | "notes">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(savedRecipes).values(data);
  const insertId = result[0].insertId;
  return getRecipeById(insertId);
}

export async function getRecipes(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(savedRecipes).where(eq(savedRecipes.userId, userId));
}

export async function getRecipeById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(savedRecipes).where(eq(savedRecipes.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateRecipe(id: number, data: Partial<Omit<InsertSavedRecipe, "id" | "userId" | "dogProfileId" | "createdAt">>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(savedRecipes).set(data).where(eq(savedRecipes.id, id));
  return getRecipeById(id);
}

export async function deleteRecipe(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(savedRecipes).where(eq(savedRecipes.id, id));
  return { success: true };
}
