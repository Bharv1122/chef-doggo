import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { calculateDailyCalories } from '@/lib/nutrition-utils';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// GET single dog
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any)?.id;
    const dogId = params.id;

    const dog = await prisma.dogProfile.findFirst({
      where: {
        id: dogId,
        userId,
      },
    });

    if (!dog) {
      return NextResponse.json({ error: 'Dog not found' }, { status: 404 });
    }

    return NextResponse.json({ dog });
  } catch (error) {
    console.error('Get dog error:', error);
    return NextResponse.json({ error: 'Failed to fetch dog' }, { status: 500 });
  }
}

// PUT update dog
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any)?.id;
    const dogId = params.id;
    const body = await req.json();

    // Verify ownership
    const existingDog = await prisma.dogProfile.findFirst({
      where: {
        id: dogId,
        userId,
      },
    });

    if (!existingDog) {
      return NextResponse.json({ error: 'Dog not found' }, { status: 404 });
    }

    const {
      name,
      breed,
      weight,
      age,
      size,
      lifeStage,
      activityLevel,
      allergies,
      healthConditions,
      dietaryRestrictions,
      medications,
      nutritionPhilosophy,
      tcvmConstitution,
      tcvmThermalNature,
      ayurvedicDosha,
      conditionDiet,
    } = body;

    // Recalculate daily calories if weight, age, or activity changed
    let dailyCalories = existingDog.dailyCalories;
    if (weight || age || activityLevel || lifeStage) {
      dailyCalories = calculateDailyCalories(
        parseFloat(weight ?? existingDog.weight),
        parseFloat(age ?? existingDog.age),
        activityLevel ?? existingDog.activityLevel,
        lifeStage ?? existingDog.lifeStage
      );
    }

    const dog = await prisma.dogProfile.update({
      where: { id: dogId },
      data: {
        name: name ?? existingDog.name,
        breed: breed ?? existingDog.breed,
        weight: weight ? parseFloat(weight) : existingDog.weight,
        age: age ? parseFloat(age) : existingDog.age,
        size: size ?? existingDog.size,
        lifeStage: lifeStage ?? existingDog.lifeStage,
        activityLevel: activityLevel ?? existingDog.activityLevel,
        allergies: allergies ?? existingDog.allergies,
        healthConditions: healthConditions ?? existingDog.healthConditions,
        dietaryRestrictions: dietaryRestrictions ?? existingDog.dietaryRestrictions,
        medications: medications ?? existingDog.medications,
        nutritionPhilosophy: nutritionPhilosophy !== undefined ? nutritionPhilosophy : existingDog.nutritionPhilosophy,
        tcvmConstitution: tcvmConstitution !== undefined ? tcvmConstitution : existingDog.tcvmConstitution,
        tcvmThermalNature: tcvmThermalNature !== undefined ? tcvmThermalNature : existingDog.tcvmThermalNature,
        ayurvedicDosha: ayurvedicDosha !== undefined ? ayurvedicDosha : existingDog.ayurvedicDosha,
        conditionDiet: conditionDiet !== undefined ? conditionDiet : existingDog.conditionDiet,
        dailyCalories,
      },
    });

    return NextResponse.json({ dog });
  } catch (error) {
    console.error('Update dog error:', error);
    return NextResponse.json({ error: 'Failed to update dog' }, { status: 500 });
  }
}

// DELETE dog
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any)?.id;
    const dogId = params.id;

    // Verify ownership
    const existingDog = await prisma.dogProfile.findFirst({
      where: {
        id: dogId,
        userId,
      },
    });

    if (!existingDog) {
      return NextResponse.json({ error: 'Dog not found' }, { status: 404 });
    }

    await prisma.dogProfile.delete({
      where: { id: dogId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete dog error:', error);
    return NextResponse.json({ error: 'Failed to delete dog' }, { status: 500 });
  }
}