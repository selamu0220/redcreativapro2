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
    <div className="bg-muted/30 border border-border/50 rounded-3xl p-8 my-12 backdrop-blur-md relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors duration-500"></div>
      <div className="flex items-center gap-3 mb-6 text-foreground relative z-10">
        <div className="p-2 bg-primary/10 rounded-xl">
          <List className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-xl font-black m-0 border-none! tracking-tight">Índice de contenido</h2>
      </div>
      <nav className="relative z-10">
        <ul className="space-y-1">
          {items.map((item, index) => (
            <li 
              key={index} 
              style={{ paddingLeft: `${(item.level - 2) * 1.5}rem` }}
              className="group/item"
            >
              <a 
                href={`#${item.id}`}
                className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-all duration-300 text-base py-2 relative"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-border group-hover/item:bg-primary group-hover/item:scale-125 transition-all"></span>
                <span className="font-medium tracking-tight">{item.text}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
