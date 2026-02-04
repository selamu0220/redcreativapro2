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

// Simular kv.get
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    
    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 })
    }

    await ensureDataDir()
    const filePath = path.join(DATA_DIR, `${key}.json`)
    
    try {
      const data = await fs.readFile(filePath, 'utf-8')
      return NextResponse.json({ result: JSON.parse(data) })
    } catch {
      return NextResponse.json({ result: null })
    }
  } catch (error) {
    console.error('KV Mock GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Simular kv.set
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { key, value } = body
    
    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 })
    }

    await ensureDataDir()
    const filePath = path.join(DATA_DIR, `${key}.json`)
    
    await fs.writeFile(filePath, JSON.stringify(value, null, 2))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('KV Mock POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
