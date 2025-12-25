'use client'

import React from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Info, AlertTriangle, Lightbulb, CheckCircle2 } from 'lucide-react'

interface BlogContentProps {
  content: string
}

type Block = 
  | { type: 'h1'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'code'; code: string; language: string }
  | { type: 'blockquote'; text: string }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'callout'; text: string; iconType: 'info' | 'warning' | 'tip' | 'success' }

export default function BlogContent({ content }: BlogContentProps) {
  if (!content) return <p className="text-zinc-400">Contenido no disponible.</p>

  // Robust parser that handles various Markdown elements
  const parseContent = (text: string): Block[] => {
    const blocks: Block[] = []
    const lines = text.split('\n')
    let currentBlock: any = null

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      if (line === '') {
        if (currentBlock) {
          blocks.push(currentBlock)
          currentBlock = null
        }
        continue
      }

      // Headers
      if (line.startsWith('# ')) {
        if (currentBlock) blocks.push(currentBlock)
        blocks.push({ type: 'h1', text: line.replace('# ', '') })
        currentBlock = null
        continue
      }
      if (line.startsWith('## ')) {
        if (currentBlock) blocks.push(currentBlock)
        blocks.push({ type: 'h2', text: line.replace('## ', '') })
        currentBlock = null
        continue
      }
      if (line.startsWith('### ')) {
        if (currentBlock) blocks.push(currentBlock)
        blocks.push({ type: 'h3', text: line.replace('### ', '') })
        currentBlock = null
        continue
      }

      // Blockquotes
      if (line.startsWith('> ')) {
        if (currentBlock && currentBlock.type !== 'blockquote') {
          blocks.push(currentBlock)
          currentBlock = { type: 'blockquote', text: line.replace('> ', '') }
        } else if (currentBlock) {
          currentBlock.text += '\n' + line.replace('> ', '')
        } else {
          currentBlock = { type: 'blockquote', text: line.replace('> ', '') }
        }
        continue
      }

      // Code blocks
      if (line.startsWith('```')) {
        if (currentBlock) blocks.push(currentBlock)
        const language = line.replace('```', '').trim() || 'javascript'
        let code = ''
        i++
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          code += lines[i] + '\n'
          i++
        }
        blocks.push({ type: 'code', code: code.trim(), language })
        currentBlock = null
        continue
      }

      // Lists
      if (line.startsWith('- ') || line.startsWith('* ')) {
        if (currentBlock && currentBlock.type !== 'ul') {
          blocks.push(currentBlock)
          currentBlock = { type: 'ul', items: [line.replace(/^[-*] /, '')] }
        } else if (currentBlock) {
          currentBlock.items.push(line.replace(/^[-*] /, ''))
        } else {
          currentBlock = { type: 'ul', items: [line.replace(/^[-*] /, '')] }
        }
        continue
      }
      if (/^\d+\. /.test(line)) {
        if (currentBlock && currentBlock.type !== 'ol') {
          blocks.push(currentBlock)
          currentBlock = { type: 'ol', items: [line.replace(/^\d+\. /, '')] }
        } else if (currentBlock) {
          currentBlock.items.push(line.replace(/^\d+\. /, ''))
        } else {
          currentBlock = { type: 'ol', items: [line.replace(/^\d+\. /, '')] }
        }
        continue
      }

      // Tables (Simplified)
      if (line.startsWith('|') && lines[i+1]?.trim().startsWith('|---')) {
        if (currentBlock) blocks.push(currentBlock)
        const headers = line.split('|').filter(Boolean).map(h => h.trim())
        const rows: string[][] = []
        i += 2 // skip header and separator
        while (i < lines.length && lines[i].trim().startsWith('|')) {
          rows.push(lines[i].split('|').filter(Boolean).map(c => c.trim()))
          i++
        }
        blocks.push({ type: 'table', headers, rows })
        currentBlock = null
        continue
      }

      // Callouts (Custom)
      if (line.startsWith('!!! ')) {
        if (currentBlock) blocks.push(currentBlock)
        const parts = line.split(' ')
        const iconType = (parts[1] as any) || 'info'
        const text = parts.slice(2).join(' ')
        blocks.push({ type: 'callout', text, iconType })
        currentBlock = null
        continue
      }

      // Paragraphs
      if (currentBlock && currentBlock.type === 'p') {
        currentBlock.text += ' ' + line
      } else {
        if (currentBlock) blocks.push(currentBlock)
        currentBlock = { type: 'p', text: line }
      }
    }

    if (currentBlock) blocks.push(currentBlock)
    return blocks
  }

  const renderText = (text: string) => {
    // Basic inline formatting: bold, italic, links
    return text
      .split(/(\*\*.*?\*\*|\*.*?\*|\[.*?\]\(.*?\))/g)
      .map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i} className="text-foreground font-black">{part.slice(2, -2)}</strong>
            }
          if (part.startsWith('*') && part.endsWith('*')) {
            return <em key={i} className="italic text-foreground/90">{part.slice(1, -1)}</em>
          }
        const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/)
        if (linkMatch) {
          return (
            <a 
              key={i} 
              href={linkMatch[2]} 
              className="text-primary hover:underline underline-offset-4 decoration-primary/50"
              target={linkMatch[2].startsWith('http') ? '_blank' : undefined}
              rel={linkMatch[2].startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              {linkMatch[1]}
            </a>
          )
        }
        return part
      })
  }

  const blocks = parseContent(content)

  return (
    <div className="blog-article prose prose-lg dark:prose-invert max-w-none">
      {blocks.map((block, index) => {
        switch (block.type) {
            case 'h1':
              return <h1 key={index} className="text-3xl md:text-5xl font-black text-foreground mt-12 mb-6 scroll-mt-24 tracking-tight">{block.text}</h1>
            case 'h2':
              return <h2 key={index} className="text-2xl md:text-4xl font-black text-foreground mt-10 mb-5 pb-2 border-b border-border scroll-mt-24 tracking-tight">{block.text}</h2>
            case 'h3':
              return <h3 key={index} className="text-xl md:text-2xl font-black text-foreground mt-8 mb-4 scroll-mt-24 tracking-tight">{block.text}</h3>
            case 'p':
              return <p key={index} className="text-foreground leading-relaxed mb-6 text-lg">{renderText(block.text)}</p>
            case 'ul':
              return (
                <ul key={index} className="list-none space-y-3 my-8 ml-2">
                  {block.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-foreground">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                      <span>{renderText(item)}</span>
                    </li>
                  ))}
                </ul>
              )
            case 'ol':
              return (
                <ol key={index} className="list-none space-y-3 my-8 ml-2 counter-reset-item">
                  {block.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-foreground">
                      <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-secondary text-foreground text-xs font-bold">
                        {i + 1}
                      </span>
                      <span>{renderText(item)}</span>
                    </li>
                  ))}
                </ol>
              )
            case 'code':
              return (
                <div key={index} className="my-8 rounded-xl overflow-hidden border border-border shadow-2xl">
                  <div className="bg-muted px-4 py-2 flex justify-between items-center border-b border-border">
                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">{block.language}</span>
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-border" />
                      <div className="w-2.5 h-2.5 rounded-full bg-border" />
                      <div className="w-2.5 h-2.5 rounded-full bg-border" />
                    </div>
                  </div>
                  <SyntaxHighlighter
                    language={block.language}
                    style={vscDarkPlus}
                    customStyle={{
                      margin: 0,
                      padding: '1.5rem',
                      background: 'hsl(var(--secondary))',
                      fontSize: '0.9rem',
                      lineHeight: '1.6',
                    }}
                  >
                    {block.code}
                  </SyntaxHighlighter>
                </div>
              )
            case 'blockquote':
              return (
                <blockquote key={index} className="border-l-4 border-primary/50 pl-6 py-4 italic my-10 text-foreground bg-muted/50 rounded-r-2xl border-y border-r border-border">
                  <p className="m-0 text-xl leading-relaxed">"{block.text}"</p>
                </blockquote>
              )
            case 'table':
              return (
                <div key={index} className="my-10 overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-muted">
                      <tr>
                        {block.headers.map((header, i) => (
                          <th key={i} className="px-6 py-4 text-sm font-semibold text-foreground border-b border-border uppercase tracking-wider">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {block.rows.map((row, i) => (
                        <tr key={i} className="hover:bg-muted/30 transition-colors">
                          {row.map((cell, j) => (
                            <td key={j} className="px-6 py-4 text-foreground text-sm leading-relaxed">
                              {renderText(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
                  case 'callout':
                      const icons = {
                        info: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
                        warning: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
                        tip: <Lightbulb className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
                        success: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
                      }
                      const colors = {
                        info: 'bg-blue-500/10 border-blue-500/20 text-blue-950 dark:text-blue-50',
                        warning: 'bg-amber-500/10 border-amber-500/20 text-amber-950 dark:text-amber-50',
                        tip: 'bg-purple-500/10 border-purple-500/20 text-purple-950 dark:text-purple-50',
                        success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-950 dark:text-emerald-50',
                      }

                  return (
                    <div key={index} className={`flex gap-4 p-6 my-8 rounded-2xl border backdrop-blur-sm ${colors[block.iconType]}`}>
                      <div className="flex-shrink-0 mt-1">{icons[block.iconType]}</div>
                      <div className="text-sm md:text-base leading-relaxed font-semibold">{renderText(block.text)}</div>
                    </div>
                  )
          default:
            return null
        }
      })}
    </div>
  )
}
