import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

// GET /api/meal-plans/[id] - Get a specific meal plan with all entries
export async function GET(
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

    const mealPlan = await prisma.mealPlan.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        dogProfile: {
          select: {
            id: true,
            name: true,
            breed: true,
            weight: true,
            age: true,
          },
        },
        entries: {
          include: {
            recipe: {
              select: {
                id: true,
                name: true,
                recipeImageUrl: true,
                nutritionSummary: true,
                ingredients: true,
              },
            },
          },
          orderBy: {
            date: 'asc',
          },
        },
      },
    });

    if (!mealPlan) {
      return NextResponse.json(
        { error: 'Meal plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ mealPlan });
  } catch (error: any) {
    console.error('Error fetching meal plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meal plan', details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/meal-plans/[id] - Update a meal plan
export async function PUT(
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
    const existingPlan = await prisma.mealPlan.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingPlan) {
      return NextResponse.json(
        { error: 'Meal plan not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, startDate, endDate } = body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) {
      updateData.endDate = endDate ? new Date(endDate) : null;
    }

    const mealPlan = await prisma.mealPlan.update({
      where: { id: params.id },
      data: updateData,
      include: {
        dogProfile: {
          select: {
            id: true,
            name: true,
            breed: true,
          },
        },
        entries: {
          include: {
            recipe: {
              select: {
                id: true,
                name: true,
                recipeImageUrl: true,
              },
            },
          },
          orderBy: {
            date: 'asc',
          },
        },
      },
    });

    return NextResponse.json({ mealPlan });
  } catch (error: any) {
    console.error('Error updating meal plan:', error);
    return NextResponse.json(
      { error: 'Failed to update meal plan', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/meal-plans/[id] - Delete a meal plan
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
    const existingPlan = await prisma.mealPlan.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingPlan) {
      return NextResponse.json(
        { error: 'Meal plan not found' },
        { status: 404 }
      );
    }

    // Delete meal plan (cascade will delete entries)
    await prisma.mealPlan.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Meal plan deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting meal plan:', error);
    return NextResponse.json(
      { error: 'Failed to delete meal plan', details: error.message },
      { status: 500 }
    );
  }
}
