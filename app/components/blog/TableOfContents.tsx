'use client'

import React, { useEffect, useState } from 'react'
import { List } from 'lucide-react'

interface TOCItem {
  id: string
  text: string
  level: number
}

export default function TableOfContents({ content }: { content: string }) {
  const [items, setItems] = useState<TOCItem[]>([])

  useEffect(() => {
    const lines = content.split('\n')
    const tocItems: TOCItem[] = []
    
    lines.forEach((line) => {
      const match = line.match(/^(#{2,3})\s+(.*)$/)
      if (match) {
        const level = match[1].length
        const text = match[2].trim()
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
        
        tocItems.push({ id, text, level })
      }
    })
    
    setItems(tocItems)
  }, [content])

  if (items.length === 0) return null

  return (
    <div className="bg-muted/30 border border-border rounded-2xl p-6 my-8 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4 text-foreground font-bold">
        <List className="w-5 h-5" />
        <h2 className="text-xl m-0 border-none!">Tabla de Contenidos</h2>
      </div>
      <nav>
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li 
              key={index} 
              style={{ paddingLeft: `${(item.level - 2) * 1.5}rem` }}
              className="transition-all duration-200"
            >
              <a 
                href={`#${item.id}`}
                className="text-muted-foreground hover:text-primary transition-colors text-sm md:text-base inline-block py-1"
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
