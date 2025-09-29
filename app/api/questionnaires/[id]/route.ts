import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

interface QuestionField {
  id: string;
  type: 'text' | 'email' | 'select' | 'textarea' | 'number' | 'date';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

interface Questionnaire {
  id: string;
  userEmail: string;
  name: string;
  description: string;
  questions: QuestionField[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const QUESTIONNAIRES_KEY = 'questionnaires';

// KV helper functions
const hasKV = !!process.env.KV_URL || !!process.env.KV_REST_API_URL;

async function kvGet<T>(key: string, fallback: () => T): Promise<T> {
  try {
    if (!hasKV) return fallback();
    const value = await kv.get<T>(key);
    return (value as T) ?? fallback();
  } catch {
    return fallback();
  }
}

async function kvSet<T>(key: string, value: T): Promise<void> {
  try {
    if (!hasKV) return;
    await kv.set(key, value);
  } catch {
    // ignore
  }
}

async function readQuestionnaires(): Promise<Questionnaire[]> {
  return kvGet<Questionnaire[]>(QUESTIONNAIRES_KEY, () => []);
}

async function writeQuestionnaires(questionnaires: Questionnaire[]): Promise<void> {
  await kvSet(QUESTIONNAIRES_KEY, questionnaires);
}

function getUserFromRequest(request: NextRequest): string | null {
  // In a real app, you'd extract this from JWT token or session
  // For now, we'll use a simple header-based approach
  const userEmail = request.headers.get('x-user-email');
  return userEmail;
}

// PUT /api/questionnaires/[id] - Update questionnaire
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userEmail = getUserFromRequest(request);
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    
    const questionnaires = await readQuestionnaires();
    const questionnaireIndex = questionnaires.findIndex(q => q.id === id && q.userEmail === userEmail);
    
    if (questionnaireIndex === -1) {
      return NextResponse.json({ error: 'Questionnaire not found' }, { status: 404 });
    }

    // Update questionnaire
    const updatedQuestionnaire = {
      ...questionnaires[questionnaireIndex],
      ...body,
      id, // Ensure ID doesn't change
      userEmail, // Ensure userEmail doesn't change
      updatedAt: new Date().toISOString()
    };

    questionnaires[questionnaireIndex] = updatedQuestionnaire;
    await writeQuestionnaires(questionnaires);

    return NextResponse.json({ questionnaire: updatedQuestionnaire });
  } catch (error) {
    console.error('Error updating questionnaire:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/questionnaires/[id] - Delete questionnaire
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userEmail = getUserFromRequest(request);
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    const questionnaires = await readQuestionnaires();
    const questionnaireIndex = questionnaires.findIndex(q => q.id === id && q.userEmail === userEmail);
    
    if (questionnaireIndex === -1) {
      return NextResponse.json({ error: 'Questionnaire not found' }, { status: 404 });
    }

    // Remove questionnaire
    questionnaires.splice(questionnaireIndex, 1);
    await writeQuestionnaires(questionnaires);

    return NextResponse.json({ message: 'Questionnaire deleted successfully' });
  } catch (error) {
    console.error('Error deleting questionnaire:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/questionnaires/[id] - Get specific questionnaire
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userEmail = getUserFromRequest(request);
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    const questionnaires = await readQuestionnaires();
    const questionnaire = questionnaires.find(q => q.id === id && q.userEmail === userEmail);
    
    if (!questionnaire) {
      return NextResponse.json({ error: 'Questionnaire not found' }, { status: 404 });
    }

    return NextResponse.json({ questionnaire });
  } catch (error) {
    console.error('Error getting questionnaire:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}