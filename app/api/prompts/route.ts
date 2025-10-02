import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

// Directorio para almacenar datos locales
const DATA_DIR = path.join(process.cwd(), 'data')

// Asegurar que el directorio existe
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }
}

// Local storage helper functions
async function kvGet(key: string) {
  try {
    await ensureDataDir()
    const filePath = path.join(DATA_DIR, `${key}.json`)
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error(`Error getting key ${key}:`, error)
    return null
  }
}

async function kvSet(key: string, value: any) {
  try {
    await ensureDataDir()
    const filePath = path.join(DATA_DIR, `${key}.json`)
    await fs.writeFile(filePath, JSON.stringify(value, null, 2))
    return true
  } catch (error) {
    console.error(`Error setting key ${key}:`, error)
    throw error
  }
}


interface Prompt {
  id: string
  name: string
  content: string
  category: string
  tags: string[]
  isFavorite: boolean
  userId: string
  createdAt: string
  updatedAt: string
}

interface PromptGroup {
  id: string
  name: string
  description: string
  prompts: string[] // Array de IDs de prompts
  userId: string
  createdAt: string
  updatedAt: string
}

interface PromptChain {
  id: string
  name: string
  description: string
  steps: {
    id: string
    promptId: string
    order: number
    waitForResponse: boolean
    condition?: string
  }[]
  userId: string
  createdAt: string
  updatedAt: string
}

// KV keys for different data types
const PROMPTS_KEY = 'prompts';
const PROMPT_GROUPS_KEY = 'prompt-groups';
const PROMPT_CHAINS_KEY = 'prompt-chains';

// Funciones auxiliares para leer/escribir datos
async function readPromptsData(): Promise<Prompt[]> {
  try {
    const data = await kvGet(PROMPTS_KEY);
    return data ? (Array.isArray(data) ? data : []) : [];
  } catch (error) {
    console.error('Error reading prompts data:', error);
    return [];
  }
}

async function writePromptsData(prompts: Prompt[]): Promise<void> {
  try {
    await kvSet(PROMPTS_KEY, prompts);
  } catch (error) {
    console.error('Error writing prompts data:', error);
    throw error;
  }
}

async function readPromptGroupsData(): Promise<PromptGroup[]> {
  try {
    const data = await kvGet(PROMPT_GROUPS_KEY);
    return data ? (Array.isArray(data) ? data : []) : [];
  } catch (error) {
    console.error('Error reading prompt groups data:', error);
    return [];
  }
}

async function writePromptGroupsData(groups: PromptGroup[]): Promise<void> {
  try {
    await kvSet(PROMPT_GROUPS_KEY, groups);
  } catch (error) {
    console.error('Error writing prompt groups data:', error);
    throw error;
  }
}

async function readPromptChainsData(): Promise<PromptChain[]> {
  try {
    const data = await kvGet(PROMPT_CHAINS_KEY);
    return data ? (Array.isArray(data) ? data : []) : [];
  } catch (error) {
    console.error('Error reading prompt chains data:', error);
    return [];
  }
}

async function writePromptChainsData(chains: PromptChain[]): Promise<void> {
  try {
    await kvSet(PROMPT_CHAINS_KEY, chains);
  } catch (error) {
    console.error('Error writing prompt chains data:', error);
    throw error;
  }
}

// GET - Obtener prompts, grupos o cadenas del usuario
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = request.headers.get('x-user-uid')
    const type = searchParams.get('type') || 'prompts' // prompts, groups, chains

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    switch (type) {
      case 'prompts':
        const prompts = (await readPromptsData()).filter(prompt => prompt.userId === userId)
        return NextResponse.json({ prompts })
      
      case 'groups':
        const groups = (await readPromptGroupsData()).filter(group => group.userId === userId)
        return NextResponse.json({ groups })
      
      case 'chains':
        const chains = (await readPromptChainsData()).filter(chain => chain.userId === userId)
        return NextResponse.json({ chains })
      
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in GET /api/prompts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Crear nuevo prompt, grupo o cadena
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body
    const userId = request.headers.get('x-user-uid')

    if (!type || !data || !userId) {
      return NextResponse.json({ error: 'Type, data and user authentication are required' }, { status: 400 })
    }

    const now = new Date().toISOString()

    switch (type) {
      case 'prompt':
        const prompts = await readPromptsData()
        const newPrompt: Prompt = {
          id: `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: data.name,
          content: data.content,
          category: data.category || 'Personal',
          tags: data.tags || [],
          isFavorite: data.isFavorite || false,
          userId: userId,
          createdAt: now,
          updatedAt: now
        }
        prompts.push(newPrompt)
        await writePromptsData(prompts)
        return NextResponse.json({ prompt: newPrompt })
      
      case 'group':
        const groups = await readPromptGroupsData()
        const newGroup: PromptGroup = {
          id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: data.name,
          description: data.description || '',
          prompts: data.prompts || [],
          userId: userId,
          createdAt: now,
          updatedAt: now
        }
        groups.push(newGroup)
        await writePromptGroupsData(groups)
        return NextResponse.json({ group: newGroup })
      
      case 'chain':
        const chains = await readPromptChainsData()
        const newChain: PromptChain = {
          id: `chain_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: data.name,
          description: data.description || '',
          steps: data.steps || [],
          userId: userId,
          createdAt: now,
          updatedAt: now
        }
        chains.push(newChain)
        await writePromptChainsData(chains)
        return NextResponse.json({ chain: newChain })
      
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in POST /api/prompts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Actualizar prompt, grupo o cadena existente
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, id, data } = body
    const userId = request.headers.get('x-user-uid')

    if (!type || !id || !data || !userId) {
      return NextResponse.json({ error: 'Type, ID, data and user authentication are required' }, { status: 400 })
    }

    const now = new Date().toISOString()

    switch (type) {
      case 'prompt':
        const prompts = await readPromptsData()
        const promptIndex = prompts.findIndex(p => p.id === id && p.userId === userId)
        if (promptIndex === -1) {
          return NextResponse.json({ error: 'Prompt not found' }, { status: 404 })
        }
        prompts[promptIndex] = { ...prompts[promptIndex], ...data, updatedAt: now }
        await writePromptsData(prompts)
        return NextResponse.json({ prompt: prompts[promptIndex] })
      
      case 'group':
        const groups = await readPromptGroupsData()
        const groupIndex = groups.findIndex(g => g.id === id && g.userId === userId)
        if (groupIndex === -1) {
          return NextResponse.json({ error: 'Group not found' }, { status: 404 })
        }
        groups[groupIndex] = { ...groups[groupIndex], ...data, updatedAt: now }
        await writePromptGroupsData(groups)
        return NextResponse.json({ group: groups[groupIndex] })
      
      case 'chain':
        const chains = await readPromptChainsData()
        const chainIndex = chains.findIndex(c => c.id === id && c.userId === userId)
        if (chainIndex === -1) {
          return NextResponse.json({ error: 'Chain not found' }, { status: 404 })
        }
        chains[chainIndex] = { ...chains[chainIndex], ...data, updatedAt: now }
        await writePromptChainsData(chains)
        return NextResponse.json({ chain: chains[chainIndex] })
      
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in PUT /api/prompts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Eliminar prompt, grupo o cadena
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const id = searchParams.get('id')
    const userId = request.headers.get('x-user-uid')

    if (!type || !id || !userId) {
      return NextResponse.json({ error: 'Type, ID and userId are required' }, { status: 400 })
    }

    switch (type) {
      case 'prompt':
        const prompts = await readPromptsData()
        const filteredPrompts = prompts.filter(p => !(p.id === id && p.userId === userId))
        await writePromptsData(filteredPrompts)
        return NextResponse.json({ success: true })
      
      case 'group':
        const groups = await readPromptGroupsData()
        const filteredGroups = groups.filter(g => !(g.id === id && g.userId === userId))
        await writePromptGroupsData(filteredGroups)
        return NextResponse.json({ success: true })
      
      case 'chain':
        const chains = await readPromptChainsData()
        const filteredChains = chains.filter(c => !(c.id === id && c.userId === userId))
        await writePromptChainsData(filteredChains)
        return NextResponse.json({ success: true })
      
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in DELETE /api/prompts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}