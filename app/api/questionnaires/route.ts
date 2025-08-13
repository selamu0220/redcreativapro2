import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
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

const QUESTIONNAIRES_FILE = join(process.cwd(), 'data', 'questionnaires.json');

function ensureDataDirectory() {
  const dataDir = join(process.cwd(), 'data');
  if (!existsSync(dataDir)) {
    require('fs').mkdirSync(dataDir, { recursive: true });
  }
}

function readQuestionnaires(): Questionnaire[] {
  ensureDataDirectory();
  if (!existsSync(QUESTIONNAIRES_FILE)) {
    return [];
  }
  try {
    const data = readFileSync(QUESTIONNAIRES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading questionnaires:', error);
    return [];
  }
}

function writeQuestionnaires(questionnaires: Questionnaire[]) {
  ensureDataDirectory();
  try {
    writeFileSync(QUESTIONNAIRES_FILE, JSON.stringify(questionnaires, null, 2));
  } catch (error) {
    console.error('Error writing questionnaires:', error);
    throw new Error('Failed to save questionnaires');
  }
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

    const questionnaires = readQuestionnaires();
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

    const questionnaires = readQuestionnaires();
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
    writeQuestionnaires(questionnaires);

    return NextResponse.json({ questionnaire: newQuestionnaire }, { status: 201 });
  } catch (error) {
    console.error('Error creating questionnaire:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}