import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'


interface Prompt {
  id: string
  name: string
  content: string
  category: string
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

const DATA_DIR = path.join(process.cwd(), 'data')
const PROMPTS_FILE = path.join(DATA_DIR, 'prompts.json')
const PROMPT_GROUPS_FILE = path.join(DATA_DIR, 'prompt-groups.json')
const PROMPT_CHAINS_FILE = path.join(DATA_DIR, 'prompt-chains.json')

// Asegurar que el directorio de datos existe
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// Funciones auxiliares para leer/escribir datos
function readPromptsData(): Prompt[] {
  try {
    if (fs.existsSync(PROMPTS_FILE)) {
      const data = fs.readFileSync(PROMPTS_FILE, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading prompts data:', error)
  }
  return []
}

function writePromptsData(prompts: Prompt[]): void {
  try {
    fs.writeFileSync(PROMPTS_FILE, JSON.stringify(prompts, null, 2))
  } catch (error) {
    console.error('Error writing prompts data:', error)
  }
}

function readPromptGroupsData(): PromptGroup[] {
  try {
    if (fs.existsSync(PROMPT_GROUPS_FILE)) {
      const data = fs.readFileSync(PROMPT_GROUPS_FILE, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading prompt groups data:', error)
  }
  return []
}

function writePromptGroupsData(groups: PromptGroup[]): void {
  try {
    fs.writeFileSync(PROMPT_GROUPS_FILE, JSON.stringify(groups, null, 2))
  } catch (error) {
    console.error('Error writing prompt groups data:', error)
  }
}

function readPromptChainsData(): PromptChain[] {
  try {
    if (fs.existsSync(PROMPT_CHAINS_FILE)) {
      const data = fs.readFileSync(PROMPT_CHAINS_FILE, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading prompt chains data:', error)
  }
  return []
}

function writePromptChainsData(chains: PromptChain[]): void {
  try {
    fs.writeFileSync(PROMPT_CHAINS_FILE, JSON.stringify(chains, null, 2))
  } catch (error) {
    console.error('Error writing prompt chains data:', error)
  }
}

// GET - Obtener prompts, grupos o cadenas del usuario
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type') || 'prompts' // prompts, groups, chains

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    switch (type) {
      case 'prompts':
        const prompts = readPromptsData().filter(prompt => prompt.userId === userId)
        return NextResponse.json({ prompts })
      
      case 'groups':
        const groups = readPromptGroupsData().filter(group => group.userId === userId)
        return NextResponse.json({ groups })
      
      case 'chains':
        const chains = readPromptChainsData().filter(chain => chain.userId === userId)
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

    if (!type || !data) {
      return NextResponse.json({ error: 'Type and data are required' }, { status: 400 })
    }

    const now = new Date().toISOString()

    switch (type) {
      case 'prompt':
        const prompts = readPromptsData()
        const newPrompt: Prompt = {
          id: `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: data.name,
          content: data.content,
          category: data.category || 'Personal',
          userId: data.userId,
          createdAt: now,
          updatedAt: now
        }
        prompts.push(newPrompt)
        writePromptsData(prompts)
        return NextResponse.json({ prompt: newPrompt })
      
      case 'group':
        const groups = readPromptGroupsData()
        const newGroup: PromptGroup = {
          id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: data.name,
          description: data.description || '',
          prompts: data.prompts || [],
          userId: data.userId,
          createdAt: now,
          updatedAt: now
        }
        groups.push(newGroup)
        writePromptGroupsData(groups)
        return NextResponse.json({ group: newGroup })
      
      case 'chain':
        const chains = readPromptChainsData()
        const newChain: PromptChain = {
          id: `chain_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: data.name,
          description: data.description || '',
          steps: data.steps || [],
          userId: data.userId,
          createdAt: now,
          updatedAt: now
        }
        chains.push(newChain)
        writePromptChainsData(chains)
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

    if (!type || !id || !data) {
      return NextResponse.json({ error: 'Type, ID and data are required' }, { status: 400 })
    }

    const now = new Date().toISOString()

    switch (type) {
      case 'prompt':
        const prompts = readPromptsData()
        const promptIndex = prompts.findIndex(p => p.id === id && p.userId === data.userId)
        if (promptIndex === -1) {
          return NextResponse.json({ error: 'Prompt not found' }, { status: 404 })
        }
        prompts[promptIndex] = { ...prompts[promptIndex], ...data, updatedAt: now }
        writePromptsData(prompts)
        return NextResponse.json({ prompt: prompts[promptIndex] })
      
      case 'group':
        const groups = readPromptGroupsData()
        const groupIndex = groups.findIndex(g => g.id === id && g.userId === data.userId)
        if (groupIndex === -1) {
          return NextResponse.json({ error: 'Group not found' }, { status: 404 })
        }
        groups[groupIndex] = { ...groups[groupIndex], ...data, updatedAt: now }
        writePromptGroupsData(groups)
        return NextResponse.json({ group: groups[groupIndex] })
      
      case 'chain':
        const chains = readPromptChainsData()
        const chainIndex = chains.findIndex(c => c.id === id && c.userId === data.userId)
        if (chainIndex === -1) {
          return NextResponse.json({ error: 'Chain not found' }, { status: 404 })
        }
        chains[chainIndex] = { ...chains[chainIndex], ...data, updatedAt: now }
        writePromptChainsData(chains)
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
    const userId = searchParams.get('userId')

    if (!type || !id || !userId) {
      return NextResponse.json({ error: 'Type, ID and userId are required' }, { status: 400 })
    }

    switch (type) {
      case 'prompt':
        const prompts = readPromptsData()
        const filteredPrompts = prompts.filter(p => !(p.id === id && p.userId === userId))
        writePromptsData(filteredPrompts)
        return NextResponse.json({ success: true })
      
      case 'group':
        const groups = readPromptGroupsData()
        const filteredGroups = groups.filter(g => !(g.id === id && g.userId === userId))
        writePromptGroupsData(filteredGroups)
        return NextResponse.json({ success: true })
      
      case 'chain':
        const chains = readPromptChainsData()
        const filteredChains = chains.filter(c => !(c.id === id && c.userId === userId))
        writePromptChainsData(filteredChains)
        return NextResponse.json({ success: true })
      
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in DELETE /api/prompts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}