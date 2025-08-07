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

interface ChainExecutionResult {
  stepId: string
  promptId: string
  promptContent: string
  response: string
  order: number
  timestamp: string
}

const DATA_DIR = path.join(process.cwd(), 'data')
const PROMPTS_FILE = path.join(DATA_DIR, 'prompts.json')
const PROMPT_CHAINS_FILE = path.join(DATA_DIR, 'prompt-chains.json')

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

// Función para ejecutar un prompt individual usando la API de chat
async function executePrompt(
  promptContent: string, 
  context: string, 
  apiKey: string, 
  model: string, 
  temperature: string, 
  maxTokens: string
): Promise<string> {
  try {
    const fullPrompt = context ? `${context}\n\n${promptContent}` : promptContent
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'x-model': model,
        'x-temperature': temperature,
        'x-max-tokens': maxTokens,
      },
      body: JSON.stringify({
        message: fullPrompt,
        history: []
      }),
    })

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`)
    }

    const data = await response.json()
    return data.response || 'No response received'
  } catch (error) {
    console.error('Error executing prompt:', error)
    throw error
  }
}

// POST - Ejecutar una cadena de prompts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      chainId, 
      userId, 
      apiKey, 
      model = 'gemini-1.5-flash', 
      temperature = '0.7', 
      maxTokens = '2000',
      initialContext = ''
    } = body

    if (!chainId || !userId || !apiKey) {
      return NextResponse.json({ 
        error: 'Chain ID, User ID and API key are required' 
      }, { status: 400 })
    }

    // Obtener la cadena de prompts
    const chains = readPromptChainsData()
    const chain = chains.find(c => c.id === chainId && c.userId === userId)
    
    if (!chain) {
      return NextResponse.json({ 
        error: 'Chain not found' 
      }, { status: 404 })
    }

    // Obtener todos los prompts
    const prompts = readPromptsData()
    
    // Ordenar los pasos por orden
    const sortedSteps = chain.steps.sort((a, b) => a.order - b.order)
    
    const results: ChainExecutionResult[] = []
    let accumulatedContext = initialContext

    // Ejecutar cada paso de la cadena
    for (const step of sortedSteps) {
      try {
        // Encontrar el prompt correspondiente
        const prompt = prompts.find(p => p.id === step.promptId && p.userId === userId)
        
        if (!prompt) {
          throw new Error(`Prompt with ID ${step.promptId} not found`)
        }

        // Ejecutar el prompt
        const response = await executePrompt(
          prompt.content,
          accumulatedContext,
          apiKey,
          model,
          temperature,
          maxTokens
        )

        const result: ChainExecutionResult = {
          stepId: step.id,
          promptId: step.promptId,
          promptContent: prompt.content,
          response: response,
          order: step.order,
          timestamp: new Date().toISOString()
        }

        results.push(result)

        // Si el paso requiere esperar la respuesta, agregar al contexto
        if (step.waitForResponse) {
          accumulatedContext += `\n\nPrevious step result: ${response}`
        }

        // Verificar condiciones si existen
        if (step.condition) {
          // Aquí se podría implementar lógica de condiciones más compleja
          // Por ahora, continuamos con todos los pasos
        }

      } catch (error) {
        console.error(`Error executing step ${step.id}:`, error)
        
        // Agregar resultado de error
        const errorResult: ChainExecutionResult = {
          stepId: step.id,
          promptId: step.promptId,
          promptContent: prompts.find(p => p.id === step.promptId)?.content || 'Unknown prompt',
          response: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          order: step.order,
          timestamp: new Date().toISOString()
        }
        
        results.push(errorResult)
        
        // Decidir si continuar o detener la ejecución
        // Por ahora, continuamos con los siguientes pasos
      }
    }

    return NextResponse.json({
      success: true,
      chainId: chainId,
      chainName: chain.name,
      executionResults: results,
      totalSteps: sortedSteps.length,
      completedSteps: results.length,
      finalContext: accumulatedContext
    })

  } catch (error) {
    console.error('Error in POST /api/execute-chain:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET - Obtener el estado de ejecución de una cadena (para futuras implementaciones)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const chainId = searchParams.get('chainId')
    const userId = searchParams.get('userId')

    if (!chainId || !userId) {
      return NextResponse.json({ 
        error: 'Chain ID and User ID are required' 
      }, { status: 400 })
    }

    // Obtener información de la cadena
    const chains = readPromptChainsData()
    const chain = chains.find(c => c.id === chainId && c.userId === userId)
    
    if (!chain) {
      return NextResponse.json({ 
        error: 'Chain not found' 
      }, { status: 404 })
    }

    // Obtener los prompts asociados
    const prompts = readPromptsData()
    const chainPrompts = chain.steps.map(step => {
      const prompt = prompts.find(p => p.id === step.promptId && p.userId === userId)
      return {
        step: step,
        prompt: prompt
      }
    }).sort((a, b) => a.step.order - b.step.order)

    return NextResponse.json({
      chain: chain,
      steps: chainPrompts,
      totalSteps: chain.steps.length
    })

  } catch (error) {
    console.error('Error in GET /api/execute-chain:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}