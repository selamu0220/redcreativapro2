import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

// KV helper functions
async function kvGet(key: string) {
  try {
    return await kv.get(key);
  } catch (error) {
    console.error('KV get error:', error);
    return null;
  }
}

async function kvSet(key: string, value: any) {
  try {
    await kv.set(key, value);
  } catch (error) {
    console.error('KV set error:', error);
    throw error;
  }
}


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

async function readPromptsData(): Promise<Prompt[]> {
  try {
    const data = await kvGet('prompts');
    return data ? (Array.isArray(data) ? data : []) : [];
  } catch (error) {
    console.error('Error reading prompts data:', error);
    return [];
  }
}

async function readPromptChainsData(): Promise<PromptChain[]> {
  try {
    const data = await kvGet('prompt-chains');
    return data ? (Array.isArray(data) ? data : []) : [];
  } catch (error) {
    console.error('Error reading prompt chains data:', error);
    return [];
  }
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
      model = 'gemini-2.0-flash-lite', 
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
    const chains = await readPromptChainsData()
    const chain = chains.find(c => c.id === chainId && c.userId === userId)
    
    if (!chain) {
      return NextResponse.json({ 
        error: 'Chain not found' 
      }, { status: 404 })
    }

    // Obtener todos los prompts
    const prompts = await readPromptsData()
    
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
    const chains = await readPromptChainsData()
    const chain = chains.find(c => c.id === chainId && c.userId === userId)
    
    if (!chain) {
      return NextResponse.json({ 
        error: 'Chain not found' 
      }, { status: 404 })
    }

    // Obtener los prompts asociados
    const prompts = await readPromptsData()
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