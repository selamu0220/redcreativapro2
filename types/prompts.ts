export interface Prompt {
  id: string
  name: string
  content: string
  category: string
  tags: string[]
  isFavorite: boolean
  createdAt: string
  updatedAt: string
  title?: string
  description?: string
  variables?: Record<string, any>
  isPublic?: boolean
  userId?: string
  usageCount?: number
}

export interface PromptGroup {
  id: string
  name: string
  description: string
  promptIds: string[]
  createdAt: string
  updatedAt?: string
}

export interface PromptChain {
  id: string
  name: string
  description: string
  promptIds: string[]
  createdAt: string
  updatedAt?: string
}

export interface HistoryItem {
  id: string
  type: 'prompt' | 'group' | 'chain'
  title: string
  content?: string
  category?: string
  tags?: string[]
  lastUsed: Date
  usageCount: number
  isFavorite: boolean
  addedToFavoritesAt?: Date
}

export interface FavoriteItem {
  id: string
  type: 'prompt' | 'group' | 'chain'
  title: string
  content?: string
  category?: string
  tags?: string[]
  addedToFavoritesAt: Date
  usageCount: number
}