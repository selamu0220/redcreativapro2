'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import BlogContentFormatter from './BlogContentFormatter'

interface BlogContentProps {
  content: string
  className?: string
}

export default function BlogContent({ content, className = '' }: BlogContentProps) {
  if (!content) return null

  // Check if content is HTML (starts with < or contains common HTML tags)
  const isHtml = content.trim().startsWith('<') ||
    /<(p|div|h[1-6]|ul|ol|table|blockquote)[^>]*>/i.test(content)

  return (
    <BlogContentFormatter className={className}>
      <div className="article-body">
        {isHtml ? (
          // Render HTML content directly
          <div dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          // Parse and render Markdown content
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Custom heading styles
              h1: ({ children }) => (
                <h1 className="text-3xl md:text-4xl font-black mb-6 mt-10">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-2xl md:text-3xl font-bold mb-5 mt-8 pb-3 border-b border-border/50">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xl md:text-2xl font-bold mb-4 mt-6">{children}</h3>
              ),
              h4: ({ children }) => (
                <h4 className="text-lg font-bold mb-3 mt-5">{children}</h4>
              ),
              // Paragraphs
              p: ({ children }) => (
                <p className="mb-5 leading-relaxed text-foreground/90">{children}</p>
              ),
              // Strong/bold text
              strong: ({ children }) => (
                <strong className="font-bold text-foreground">{children}</strong>
              ),
              // Emphasis/italic
              em: ({ children }) => (
                <em className="italic text-foreground/80">{children}</em>
              ),
              // Lists
              ul: ({ children }) => (
                <ul className="mb-6 space-y-2 pl-6">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="mb-6 space-y-2 pl-6 list-decimal">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="text-foreground/90 pl-2 relative before:content-['•'] before:text-primary before:font-bold before:absolute before:-left-4 before:top-0">{children}</li>
              ),
              // Tables (GFM)
              table: ({ children }) => (
                <div className="overflow-x-auto mb-8 rounded-xl border border-border shadow-sm">
                  <table className="w-full border-collapse min-w-[600px]">{children}</table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-muted/50">{children}</thead>
              ),
              tbody: ({ children }) => (
                <tbody>{children}</tbody>
              ),
              tr: ({ children }) => (
                <tr className="border-b border-border hover:bg-muted/30 transition-colors">{children}</tr>
              ),
              th: ({ children }) => (
                <th className="px-5 py-4 text-left font-bold text-sm uppercase tracking-wider text-muted-foreground">{children}</th>
              ),
              td: ({ children }) => (
                <td className="px-5 py-4 text-foreground">{children}</td>
              ),
              // Blockquotes
              blockquote: ({ children }) => (
                <blockquote className="relative my-8 py-6 px-8 pl-12 bg-gradient-to-r from-muted/50 to-transparent border-l-4 border-primary rounded-r-xl">
                  <span className="absolute left-4 top-4 text-4xl text-primary/30 font-serif">"</span>
                  <div className="italic text-lg">{children}</div>
                </blockquote>
              ),
              // Code blocks
              code: ({ className, children, ...props }) => {
                const isInline = !className
                if (isInline) {
                  return (
                    <code className="bg-muted px-2 py-1 rounded text-primary font-mono text-sm" {...props}>
                      {children}
                    </code>
                  )
                }
                return (
                  <code className={`block bg-[#1e1e1e] text-zinc-300 p-5 rounded-xl font-mono text-sm overflow-x-auto ${className}`} {...props}>
                    {children}
                  </code>
                )
              },
              pre: ({ children }) => (
                <pre className="mb-6 rounded-xl overflow-hidden">{children}</pre>
              ),
              // Links
              a: ({ href, children }) => (
                <a
                  href={href}
                  className="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary font-medium transition-colors"
                  target={href?.startsWith('http') ? '_blank' : undefined}
                  rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  {children}
                </a>
              ),
              // Horizontal rule
              hr: () => (
                <hr className="my-10 border-border/50" />
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        )}
      </div>
    </BlogContentFormatter>
  )
}
