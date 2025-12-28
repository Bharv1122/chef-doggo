import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

// GET /api/progress-photos - Get progress photos with optional filters
export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const dogProfileId = searchParams.get('dogProfileId');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');

    const whereClause: any = { userId: user.id };

    if (dogProfileId) {
      whereClause.dogProfileId = dogProfileId;
    }

    if (category) {
      whereClause.category = category;
    }

    const photos = await prisma.progressPhoto.findMany({
      where: whereClause,
      include: {
        dogProfile: {
          select: {
            id: true,
            name: true,
            breed: true,
          },
        },
      },
      orderBy: {
        takenAt: 'desc',
      },
      take: limit,
    });

    return NextResponse.json({ photos });
  } catch (error: any) {
    console.error('Error fetching progress photos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress photos', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/progress-photos - Upload a new progress photo
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { dogProfileId, photoUrl, category, notes, takenAt } = body;

    // Validate required fields
    if (!dogProfileId || !photoUrl || !category || !takenAt) {
      return NextResponse.json(
        { error: 'Missing required fields: dogProfileId, photoUrl, category, takenAt' },
        { status: 400 }
      );
    }

    // Verify dog profile belongs to user
    const dogProfile = await prisma.dogProfile.findFirst({
      where: {
        id: dogProfileId,
        userId: user.id,
      },
    });

    if (!dogProfile) {
      return NextResponse.json(
        { error: 'Dog profile not found' },
        { status: 404 }
      );
    }

    const validCategories = ['full-body', 'coat-closeup', 'face'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: `Category must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      );
    }

    const photo = await prisma.progressPhoto.create({
      data: {
        userId: user.id,
        dogProfileId,
        photoUrl,
        category,
        notes: notes || null,
        takenAt: new Date(takenAt),
      },
      include: {
        dogProfile: {
          select: {
            id: true,
            name: true,
            breed: true,
          },
        },
      },
    });

    return NextResponse.json({ photo }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating progress photo:', error);
    return NextResponse.json(
      { error: 'Failed to create progress photo', details: error.message },
      { status: 500 }
    );
  }
}
