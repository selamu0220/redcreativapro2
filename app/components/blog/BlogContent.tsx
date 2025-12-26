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
  | { type: 'image'; src: string; alt: string; caption?: string }
  | { type: 'hr' }

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

        // Images
        const imageMatch = line.match(/^!\[(.*?)\]\((.*?)\)$/)
        if (imageMatch) {
          if (currentBlock) blocks.push(currentBlock)
          blocks.push({ type: 'image', alt: imageMatch[1], src: imageMatch[2] })
          currentBlock = null
          continue
        }

        // Horizontal Rule
        if (line === '---' || line === '***' || line === '___') {
          if (currentBlock) blocks.push(currentBlock)
          blocks.push({ type: 'hr' })
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
      <div className="blog-article prose prose-lg dark:prose-invert max-w-none font-serif selection:bg-primary/10">
        {blocks.map((block, index) => {
          switch (block.type) {
              case 'h1':
                return <h1 key={index} id={block.text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')} className="text-4xl md:text-6xl font-black font-sans text-foreground mt-16 mb-8 scroll-mt-24 tracking-tighter leading-tight">{block.text}</h1>
              case 'h2':
                return <h2 key={index} id={block.text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')} className="text-3xl md:text-5xl font-black font-sans text-foreground mt-14 mb-6 pb-4 border-b-2 border-border/50 scroll-mt-24 tracking-tighter leading-tight">{block.text}</h2>
              case 'h3':
                return <h3 key={index} id={block.text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')} className="text-2xl md:text-3xl font-black font-sans text-foreground mt-10 mb-5 scroll-mt-24 tracking-tight">{block.text}</h3>
              case 'p':
                const isFirstParagraph = index === 0 || (blocks[index-1].type !== 'p' && !blocks.slice(0, index).some(b => b.type === 'p'))
                return (
                  <p 
                    key={index} 
                    className={`text-foreground/90 leading-[1.8] mb-8 text-xl md:text-2xl font-serif antialiased ${
                      isFirstParagraph ? 'first-letter:text-7xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:leading-[0.8] first-letter:text-primary first-letter:mt-1' : ''
                    }`}
                  >
                    {renderText(block.text)}
                  </p>
                )
              case 'ul':
                return (
                  <ul key={index} className="list-none space-y-4 my-10 ml-2">
                    {block.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-4 text-foreground/90 text-lg md:text-xl leading-relaxed">
                        <span className="mt-3 w-2 h-2 rounded-full bg-primary flex-shrink-0 shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                        <span>{renderText(item)}</span>
                      </li>
                    ))}
                  </ul>
                )
                case 'ol':
                  return (
                    <ol key={index} className="list-none space-y-6 my-10 ml-2">
                      {block.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-5 text-foreground/90 text-lg md:text-xl leading-relaxed group">
                          <span className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-900 text-white text-base font-black shadow-lg group-hover:bg-primary transition-colors duration-300">
                            {i + 1}
                          </span>
                          <span className="pt-1">{renderText(item)}</span>
                        </li>
                      ))}
                    </ol>
                  )
              case 'code':
                return (
                  <div key={index} className="my-12 rounded-2xl overflow-hidden border border-border shadow-2xl font-sans">
                    <div className="bg-muted px-6 py-3 flex justify-between items-center border-b border-border">
                      <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest font-bold">{block.language}</span>
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/30" />
                        <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/30" />
                        <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/30" />
                      </div>
                    </div>
                    <SyntaxHighlighter
                      language={block.language}
                      style={vscDarkPlus}
                      customStyle={{
                        margin: 0,
                        padding: '2rem',
                        background: 'hsl(var(--secondary))',
                        fontSize: '1rem',
                        lineHeight: '1.7',
                      }}
                    >
                      {block.code}
                    </SyntaxHighlighter>
                  </div>
                )
              case 'blockquote':
                return (
                  <blockquote key={index} className="relative border-l-8 border-primary pl-10 py-8 my-14 text-foreground bg-primary/5 rounded-r-[2.5rem] border-y border-r border-primary/10 overflow-hidden group">
                    <div className="absolute top-4 left-4 text-primary/10 text-8xl font-serif pointer-events-none group-hover:text-primary/20 transition-colors duration-500">“</div>
                    <p className="m-0 text-2xl md:text-4xl font-black font-sans leading-tight italic tracking-tight relative z-10 text-zinc-800 dark:text-zinc-100">
                      {block.text}
                    </p>
                    <div className="absolute bottom-4 right-10 w-20 h-1 bg-primary/20 rounded-full"></div>
                  </blockquote>
                )
              case 'table':
                return (
                  <div key={index} className="my-12 overflow-x-auto rounded-[2rem] border-2 border-border/50 shadow-xl font-sans">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-zinc-900 text-white">
                        <tr>
                          {block.headers.map((header, i) => (
                            <th key={i} className="px-8 py-5 text-sm font-black uppercase tracking-[0.2em]">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {block.rows.map((row, i) => (
                          <tr key={i} className="hover:bg-primary/5 transition-colors group">
                            {row.map((cell, j) => (
                              <td key={j} className="px-8 py-5 text-foreground/80 text-base md:text-lg font-medium group-hover:text-foreground">
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
                              info: <Info className="w-5 h-5 text-blue-600" />,
                              warning: <AlertTriangle className="w-5 h-5 text-amber-600" />,
                              tip: <Lightbulb className="w-5 h-5 text-purple-600" />,
                              success: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
                            }
  
                          return (
                            <div key={index} className="blog-callout-white blog-callout-pattern relative flex gap-6 p-8 my-10 rounded-3xl border shadow-sm group hover:shadow-xl hover:-translate-y-1 border-zinc-200">
                              <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-900 shadow-lg relative z-10 group-hover:scale-110 transition-transform">
                                {React.cloneElement(icons[block.iconType] as React.ReactElement, { className: 'w-7 h-7 text-white' })}
                              </div>
                              <div className="flex-1 relative z-10">
                                <div className="text-lg md:text-xl leading-relaxed font-bold tracking-tight text-black">
                                  {renderText(block.text)}
                                </div>
                              </div>
                            </div>
                          )

              case 'image':
                return (
                  <figure key={index} className="my-12 group">
                    <div className="relative aspect-video rounded-3xl overflow-hidden border border-border shadow-2xl group-hover:shadow-primary/5 transition-all duration-500">
                      <img
                        src={block.src}
                        alt={block.alt}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    {block.alt && (
                      <figcaption className="mt-4 text-center text-sm text-muted-foreground italic">
                        {block.alt}
                      </figcaption>
                    )}
                  </figure>
                )

              case 'hr':
                return (
                  <hr key={index} className="my-16 border-t-2 border-border border-dashed max-w-[100px] mx-auto opacity-50" />
                )



          default:
            return null
        }
      })}
    </div>
  )
}
