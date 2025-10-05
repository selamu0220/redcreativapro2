import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

interface Conversation {
  id: string
  title: string
  userId: string
  aiAssistantType: string
  createdAt: string
  updatedAt: string
}

interface ConversationMessage {
  id: string
  sessionId: string
  content: string
  senderType: 'user' | 'assistant'
  sentAt: string
}

const DATA_DIR = join(process.cwd(), 'data')
const CONVERSATIONS_FILE = join(DATA_DIR, 'conversations.json')
const MESSAGES_FILE = join(DATA_DIR, 'messages.json')

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  const fs = await import('fs');
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readConversationsData(): Conversation[] {
  try {
    if (!existsSync(CONVERSATIONS_FILE)) {
      return []
    }
    const data = readFileSync(CONVERSATIONS_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading conversations data:', error)
    return []
  }
}

function writeConversationsData(conversations: Conversation[]): void {
  try {
    writeFileSync(CONVERSATIONS_FILE, JSON.stringify(conversations, null, 2))
  } catch (error) {
    console.error('Error writing conversations data:', error)
  }
}

function readMessagesData(): ConversationMessage[] {
  try {
    if (!existsSync(MESSAGES_FILE)) {
      return []
    }
    const data = readFileSync(MESSAGES_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading messages data:', error)
    return []
  }
}

function writeMessagesData(messages: ConversationMessage[]): void {
  try {
    writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2))
  } catch (error) {
    console.error('Error writing messages data:', error)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const sessionId = searchParams.get('sessionId')
    const userId = searchParams.get('userId')

    if (type === 'messages' && sessionId) {
      const messages = readMessagesData()
      const sessionMessages = messages.filter(msg => msg.sessionId === sessionId)
      return NextResponse.json(sessionMessages)
    }

    if (type === 'conversations' && userId) {
      const conversations = readConversationsData()
      const userConversations = conversations.filter(conv => conv.userId === userId)
      return NextResponse.json(userConversations)
    }

    return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 })
  } catch (error) {
    console.error('Error in GET /api/conversations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body

    if (type === 'conversation') {
      const conversations = readConversationsData()
      const newConversation: Conversation = {
        id: uuidv4(),
        title: data.title,
        userId: data.userId,
        aiAssistantType: data.aiAssistantType || 'chatgpt',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      conversations.push(newConversation)
      writeConversationsData(conversations)
      return NextResponse.json(newConversation)
    }

    if (type === 'message') {
      const messages = readMessagesData()
      const newMessage: ConversationMessage = {
        id: uuidv4(),
        sessionId: data.sessionId,
        content: data.content,
        senderType: data.senderType,
        sentAt: new Date().toISOString()
      }
      messages.push(newMessage)
      writeMessagesData(messages)
      
      // Update conversation timestamp
      const conversations = readConversationsData()
      const updatedConversations = conversations.map(conv => 
        conv.id === data.sessionId 
          ? { ...conv, updatedAt: new Date().toISOString() }
          : conv
      )
      writeConversationsData(updatedConversations)
      
      return NextResponse.json(newMessage)
    }

    return NextResponse.json({ error: 'Invalid request type' }, { status: 400 })
  } catch (error) {
    console.error('Error in POST /api/conversations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, title } = body

    const conversations = readConversationsData()
    const updatedConversations = conversations.map(conv => 
      conv.id === sessionId 
        ? { ...conv, title, updatedAt: new Date().toISOString() }
        : conv
    )
    writeConversationsData(updatedConversations)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in PUT /api/conversations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    // Delete conversation
    const conversations = readConversationsData()
    const filteredConversations = conversations.filter(conv => conv.id !== sessionId)
    writeConversationsData(filteredConversations)

    // Delete associated messages
    const messages = readMessagesData()
    const filteredMessages = messages.filter(msg => msg.sessionId !== sessionId)
    writeMessagesData(filteredMessages)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/conversations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}