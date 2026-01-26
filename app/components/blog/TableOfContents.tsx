'use client'

import React, { useEffect, useState } from 'react'
import { List, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

interface TOCItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  content: string
  variant?: 'default' | 'sidebar'
}

export default function TableOfContents({ content, variant = 'default' }: TableOfContentsProps) {
  const [items, setItems] = useState<TOCItem[]>([])
  const [activeId, setActiveId] = useState<string>('')

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

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-100px 0% -80% 0%' }
    )

    tocItems.forEach((item) => {
      const element = document.getElementById(item.id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [content])

  if (items.length === 0) return null

  if (variant === 'sidebar') {
    return (
      <nav className="space-y-1">
        {items.map((item, index) => (
          <motion.a
            key={index}
            href={`#${item.id}`}
            initial={false}
            animate={{
              paddingLeft: activeId === item.id ? '1rem' : '0.5rem',
              color: activeId === item.id ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
              fontWeight: activeId === item.id ? 900 : 500
            }}
            className={`flex items-center gap-3 py-2 text-sm transition-all border-l-2 ${
              activeId === item.id ? 'border-primary' : 'border-transparent'
            }`}
          >
            <span className={`transition-transform duration-300 ${activeId === item.id ? 'rotate-90 text-primary' : 'text-zinc-400'}`}>
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
            <span className="line-clamp-1">{item.text}</span>
          </motion.a>
        ))}
      </nav>
    )
  }

  return (
    <div className="bg-muted/30 border-2 border-border/50 rounded-[2.5rem] p-8 md:p-12 my-16 backdrop-blur-md relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-[100px] group-hover:bg-primary/10 transition-colors duration-700"></div>
      <div className="flex items-center gap-4 mb-8 text-foreground relative z-10">
        <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center rotate-3 group-hover:rotate-6 transition-transform shadow-lg">
          <List className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl md:text-3xl font-black m-0 border-none tracking-tighter uppercase italic">Índice de contenido</h2>
      </div>
      <nav className="relative z-10">
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-2">
          {items.map((item, index) => (
            <div 
              key={index} 
              style={{ paddingLeft: `${(item.level - 2) * 1.5}rem` }}
              className="group/item"
            >
              <a 
                href={`#${item.id}`}
                className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-all duration-300 text-lg py-2.5 relative font-bold tracking-tight"
              >
                <span className="w-2 h-2 rounded-full bg-border group-hover/item:bg-primary group-hover/item:scale-150 transition-all shadow-sm"></span>
                <span>{item.text}</span>
              </a>
            </div>
          ))}
        </div>
      </nav>
    </div>
  )
}
