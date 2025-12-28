import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

// POST /api/meal-plans/[id]/entries - Add or update meal plan entries
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify meal plan belongs to user
    const mealPlan = await prisma.mealPlan.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!mealPlan) {
      return NextResponse.json(
        { error: 'Meal plan not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { entries } = body; // Array of entries: [{ date, mealType, recipeId?, notes? }]

    if (!Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json(
        { error: 'Entries must be a non-empty array' },
        { status: 400 }
      );
    }

    // Validate and process entries
    const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    const createdEntries = [];

    for (const entry of entries) {
      const { date, mealType, recipeId, notes } = entry;

      if (!date || !mealType) {
        return NextResponse.json(
          { error: 'Each entry must have date and mealType' },
          { status: 400 }
        );
      }

      if (!validMealTypes.includes(mealType)) {
        return NextResponse.json(
          { error: `Invalid mealType: ${mealType}. Must be one of: ${validMealTypes.join(', ')}` },
          { status: 400 }
        );
      }

      // If recipeId provided, verify it exists and belongs to user
      if (recipeId) {
        const recipe = await prisma.recipe.findFirst({
          where: {
            id: recipeId,
            userId: user.id,
          },
        });

        if (!recipe) {
          return NextResponse.json(
            { error: `Recipe ${recipeId} not found or does not belong to user` },
            { status: 404 }
          );
        }
      }

      // Check if entry already exists for this date/mealType
      const existingEntry = await prisma.mealPlanEntry.findFirst({
        where: {
          mealPlanId: params.id,
          date: new Date(date),
          mealType,
        },
      });

      if (existingEntry) {
        // Update existing entry
        const updated = await prisma.mealPlanEntry.update({
          where: { id: existingEntry.id },
          data: {
            recipeId: recipeId || null,
            notes: notes || null,
          },
          include: {
            recipe: {
              select: {
                id: true,
                name: true,
                recipeImageUrl: true,
              },
            },
          },
        });
        createdEntries.push(updated);
      } else {
        // Create new entry
        const created = await prisma.mealPlanEntry.create({
          data: {
            mealPlanId: params.id,
            date: new Date(date),
            mealType,
            recipeId: recipeId || null,
            notes: notes || null,
          },
          include: {
            recipe: {
              select: {
                id: true,
                name: true,
                recipeImageUrl: true,
              },
            },
          },
        });
        createdEntries.push(created);
      }
    }

    return NextResponse.json({ entries: createdEntries }, { status: 201 });
  } catch (error: any) {
    console.error('Error adding meal plan entries:', error);
    return NextResponse.json(
      { error: 'Failed to add meal plan entries', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/meal-plans/[id]/entries - Delete specific entries
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify meal plan belongs to user
    const mealPlan = await prisma.mealPlan.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!mealPlan) {
      return NextResponse.json(
        { error: 'Meal plan not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { entryIds } = body; // Array of entry IDs to delete

    if (!Array.isArray(entryIds) || entryIds.length === 0) {
      return NextResponse.json(
        { error: 'entryIds must be a non-empty array' },
        { status: 400 }
      );
    }

    // Delete entries
    await prisma.mealPlanEntry.deleteMany({
      where: {
        id: { in: entryIds },
        mealPlanId: params.id,
      },
    });

    return NextResponse.json({ message: 'Entries deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting meal plan entries:', error);
    return NextResponse.json(
      { error: 'Failed to delete meal plan entries', details: error.message },
      { status: 500 }
    );
  }
}
