import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { v4 as uuidv4 } from 'uuid';

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

// GET /api/questionnaires - Get user's questionnaires
export async function GET(request: NextRequest) {
  try {
    const userEmail = getUserFromRequest(request);
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const questionnaires = await readQuestionnaires();
    const userQuestionnaires = questionnaires.filter(q => q.userEmail === userEmail);

    return NextResponse.json({ questionnaires: userQuestionnaires });
  } catch (error) {
    console.error('Error getting questionnaires:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/questionnaires - Create new questionnaire
export async function POST(request: NextRequest) {
  try {
    const userEmail = getUserFromRequest(request);
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, questions, isActive = true } = body;

    if (!name || !questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const questionnaires = await readQuestionnaires();
    const newQuestionnaire: Questionnaire = {
      id: uuidv4(),
      userEmail,
      name,
      description: description || '',
      questions: questions.map(q => ({
        ...q,
        id: q.id || uuidv4()
      })),
      isActive,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    questionnaires.push(newQuestionnaire);
    await writeQuestionnaires(questionnaires);

    return NextResponse.json({ questionnaire: newQuestionnaire }, { status: 201 });
  } catch (error) {
    console.error('Error creating questionnaire:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}