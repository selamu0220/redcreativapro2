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

// Simular Redis pipeline - maneja múltiples comandos en batch
export async function POST(request: NextRequest) {
  try {
    const commands = await request.json()
    
    if (!Array.isArray(commands)) {
      return NextResponse.json({ error: 'Commands must be an array' }, { status: 400 })
    }

    await ensureDataDir()
    const results = []

    // Procesar cada comando en el pipeline
    for (const command of commands) {
      try {
        const { command: cmd, args } = command
        
        switch (cmd?.toLowerCase()) {
          case 'get': {
            const key = args?.[0]
            if (!key) {
              results.push({ error: 'GET requires a key' })
              continue
            }
            
            const filePath = path.join(DATA_DIR, `${key}.json`)
            try {
              const data = await fs.readFile(filePath, 'utf-8')
              results.push({ result: JSON.parse(data) })
            } catch {
              results.push({ result: null })
            }
            break
          }
          
          case 'set': {
            const [key, value] = args || []
            if (!key) {
              results.push({ error: 'SET requires a key' })
              continue
            }
            
            const filePath = path.join(DATA_DIR, `${key}.json`)
            await fs.writeFile(filePath, JSON.stringify(value, null, 2))
            results.push({ result: 'OK' })
            break
          }
          
          case 'del': {
            const key = args?.[0]
            if (!key) {
              results.push({ error: 'DEL requires a key' })
              continue
            }
            
            const filePath = path.join(DATA_DIR, `${key}.json`)
            try {
              await fs.unlink(filePath)
              results.push({ result: 1 })
            } catch {
              results.push({ result: 0 })
            }
            break
          }
          
          case 'exists': {
            const key = args?.[0]
            if (!key) {
              results.push({ error: 'EXISTS requires a key' })
              continue
            }
            
            const filePath = path.join(DATA_DIR, `${key}.json`)
            try {
              await fs.access(filePath)
              results.push({ result: 1 })
            } catch {
              results.push({ result: 0 })
            }
            break
          }
          
          default:
            results.push({ error: `Unknown command: ${cmd}` })
        }
      } catch (error) {
        console.error('Pipeline command error:', error)
        results.push({ error: 'Command execution failed' })
      }
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('KV Mock Pipeline error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// También manejar GET para compatibilidad
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Pipeline endpoint - use POST with commands array',
    example: [
      { command: 'get', args: ['key1'] },
      { command: 'set', args: ['key2', 'value2'] }
    ]
  })
}
