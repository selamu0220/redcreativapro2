import { NextRequest, NextResponse } from 'next/server'

interface Blog404Log {
  url: string
  timestamp: string
  userAgent: string
  referrer: string
  ip: string
}

// In-memory storage for 404 logs (in production, use a database)
let blog404Logs: Blog404Log[] = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, referrer } = body

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    const log: Blog404Log = {
      url,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || 'Unknown',
      referrer: referrer || request.headers.get('referer') || 'Direct',
      ip: request.headers.get('x-forwarded-for') || 
          request.headers.get('x-real-ip') || 
          'Unknown'
    }

    // Add to logs (keep only last 1000 entries)
    blog404Logs.push(log)
    if (blog404Logs.length > 1000) {
      blog404Logs = blog404Logs.slice(-1000)
    }

    console.log('Blog 404 detected:', log)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error logging blog 404:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    const paginatedLogs = blog404Logs
      .slice()
      .reverse() // Most recent first
      .slice(offset, offset + limit)

    return NextResponse.json({
      logs: paginatedLogs,
      total: blog404Logs.length,
      limit,
      offset
    })
  } catch (error) {
    console.error('Error retrieving blog 404 logs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}