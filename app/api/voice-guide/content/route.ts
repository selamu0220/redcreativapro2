import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// Mock data to replace Supabase tables
const MOCK_TUTORIALS: Record<string, any> = {
  'welcome': {
    id: 'welcome',
    title: 'Bienvenido a Red Creativa',
    language: 'es',
    hotspots: [
      { id: 'h1', title: 'Escritor IA', description: 'Aquí puedes generar artículos.' },
      { id: 'h2', title: 'Correos IA', description: 'Genera correos persuasivos.' }
    ],
    voice_scripts: [
      { id: 'v1', text: 'Bienvenido al panel principal.' }
    ]
  }
};

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tutorialId = searchParams.get('tutorial_id');
    const language = searchParams.get('language') || 'es';

    if (!tutorialId) {
      return NextResponse.json({ error: 'Tutorial ID is required' }, { status: 400 });
    }

    // Get mock tutorial
    const tutorial = MOCK_TUTORIALS[tutorialId];

    if (!tutorial) {
      return NextResponse.json({ error: 'Tutorial not found' }, { status: 404 });
    }

    return NextResponse.json({ tutorial });
  } catch (error) {
    console.error('Error in voice-guide content API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId: authUserId } = getAuth(request);
    if (!authUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tutorial_id, hotspot_id } = body;

    if (!tutorial_id) {
      return NextResponse.json({ error: 'Tutorial ID is required' }, { status: 400 });
    }

    // Mock progress update (in a real app, use Vercel KV)
    console.log(`[VOICE-GUIDE] Progress updated for user ${authUserId}: Tutorial ${tutorial_id}, Hotspot ${hotspot_id}`);

    return NextResponse.json({ 
      progress: { 
        user_id: authUserId, 
        tutorial_id, 
        current_hotspot_id: hotspot_id, 
        completed: false 
      } 
    });
  } catch (error) {
    console.error('Error in voice-guide content POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
