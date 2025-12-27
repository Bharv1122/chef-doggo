import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { scanKibbleLabel } from '@/lib/ai-vision';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Convert image to base64
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    // Scan label with AI vision
    const nutrition = await scanKibbleLabel(base64);

    return NextResponse.json(nutrition);
  } catch (error: any) {
    console.error('Label scanning error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to scan label' },
      { status: 500 }
    );
  }
}
