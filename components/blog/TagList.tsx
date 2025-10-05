'use client'

import React from 'react'
import { Tag } from 'lucide-react'

interface TagListProps {
  tags: string[]
  onTagClick?: (tag: string) => void
  className?: string
}

export default function TagList({ tags, onTagClick, className = '' }: TagListProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => onTagClick?.(tag)}
          className="flex items-center gap-1 text-xs bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-full hover:bg-zinc-700 transition-colors cursor-pointer border border-zinc-700 hover:border-zinc-600"
        >
          <Tag size={12} />
          {tag}
        </button>
      ))}
    </div>
  )
}