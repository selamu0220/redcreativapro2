'use client'

import React, { ReactNode } from 'react'
import { CheckCircle, Lightbulb, AlertTriangle, Info, Star } from 'lucide-react'

interface BlogContentFormatterProps {
  children: ReactNode
  className?: string
}

// Componente para cajas de información mejoradas
export const InfoBox = ({
  type = 'info',
  title,
  children,
  className = ''
}: {
  type?: 'info' | 'tip' | 'warning' | 'success' | 'highlight'
  title?: string
  children: ReactNode
  className?: string
}) => {
  const getBoxClasses = () => {
    switch (type) {
      case 'tip':
        return 'blog-info-box tip'
      case 'warning':
        return 'blog-info-box warning'
      case 'success':
        return 'blog-info-box success'
      case 'highlight':
        return 'blog-info-box highlight'
      default:
        return 'blog-info-box'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'tip':
        return <Lightbulb className="w-6 h-6 text-blue-500" />
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case 'highlight':
        return <Star className="w-6 h-6 text-purple-500" />
      default:
        return <Info className="w-6 h-6 text-gray-500" />
    }
  }

  return (
    <div className={`${getBoxClasses()} ${className}`}>
      <div className="absolute left-5 top-6">
        {getIcon()}
      </div>
      <div>
        {title && (
          <h4 className="font-bold text-lg mb-2 text-inherit tracking-tight">
            {title}
          </h4>
        )}
        <div className="text-inherit leading-relaxed opacity-90">
          {children}
        </div>
      </div>
    </div>
  )
}

// Componente para secciones numeradas
export const NumberedSection = ({
  number,
  title,
  children,
  className = ''
}: {
  number: number
  title: string
  children: ReactNode
  className?: string
}) => (
  <section className={`mb-16 ${className}`}>
    <div className="bg-card border border-border/50 rounded-[2rem] p-10 shadow-lg mobile-spacing relative overflow-hidden group hover:border-primary/50 transition-colors duration-500">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors"></div>

      <h2 className="text-3xl md:text-4xl font-black text-foreground mb-8 flex items-center gap-6">
        <span className="bg-primary text-primary-foreground w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg shadow-primary/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
          {number}
        </span>
        <span className="tracking-tight">{title}</span>
      </h2>
      <div className="space-y-6 text-lg leading-relaxed pl-4 md:pl-24">
        {children}
      </div>
    </div>
  </section>
)

// Componente para listas de ventajas/desventajas
export const ProConList = ({
  pros = [],
  cons = [],
  className = ''
}: {
  pros?: string[]
  cons?: string[]
  className?: string
}) => (
  <div className={`grid md:grid-cols-2 gap-8 my-12 ${className}`}>
    {pros.length > 0 && (
      <div className="bg-green-50/50 dark:bg-green-950/20 p-8 rounded-3xl border border-green-200 dark:border-green-800/50 transition-transform hover:-translate-y-1 duration-300">
        <h4 className="font-black text-xl text-green-900 dark:text-green-100 mb-6 flex items-center gap-3 uppercase tracking-wider">
          <div className="w-10 h-10 rounded-full bg-green-200 dark:bg-green-900 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          Ventajas
        </h4>
        <ul className="space-y-4 text-green-800 dark:text-green-200">
          {pros.map((pro, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="text-green-500 font-bold text-xl leading-none mt-0.5">+</span>
              <span className="font-medium text-lg content-center">{pro}</span>
            </li>
          ))}
        </ul>
      </div>
    )}

    {cons.length > 0 && (
      <div className="bg-yellow-50/50 dark:bg-yellow-950/20 p-8 rounded-3xl border border-yellow-200 dark:border-yellow-800/50 transition-transform hover:-translate-y-1 duration-300">
        <h4 className="font-black text-xl text-yellow-900 dark:text-yellow-100 mb-6 flex items-center gap-3 uppercase tracking-wider">
          <div className="w-10 h-10 rounded-full bg-yellow-200 dark:bg-yellow-900 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          Consideraciones
        </h4>
        <ul className="space-y-4 text-yellow-800 dark:text-yellow-200">
          {cons.map((con, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="text-yellow-500 font-bold text-xl leading-none mt-0.5">•</span>
              <span className="font-medium text-lg content-center">{con}</span>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
)

// Componente para estadísticas
export const StatsGrid = ({
  stats,
  className = ''
}: {
  stats: Array<{ value: string; label: string; color?: string }>
  className?: string
}) => (
  <div className={`bg-muted/50 rounded-3xl p-8 mb-10 border border-border shadow-sm ${className}`}>
    <h3 className="text-xl font-bold text-foreground mb-6 uppercase tracking-wider opacity-70">
      Estadísticas Destacadas
    </h3>
    <div className="grid md:grid-cols-3 gap-8">
      {stats.map((stat, index) => (
        <div key={index} className="text-center p-4 rounded-2xl bg-background border border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <div className={`text-4xl font-black mb-3 ${stat.color || 'text-primary'}`}>
            {stat.value}
          </div>
          <div className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  </div>
)

// Componente para código con syntax highlighting
export const CodeBlock = ({
  code,
  language = 'javascript',
  title,
  className = ''
}: {
  code: string
  language?: string
  title?: string
  className?: string
}) => (
  <div className={`bg-[#1e1e1e] rounded-xl overflow-hidden mb-8 shadow-2xl border border-white/10 ${className}`}>
    {title && (
      <div className="bg-white/5 px-6 py-3 text-sm font-mono text-zinc-400 border-b border-white/5 flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-red-500/50"></span>
        <span className="w-3 h-3 rounded-full bg-yellow-500/50"></span>
        <span className="w-3 h-3 rounded-full bg-green-500/50"></span>
        <span className="ml-4">{title}</span>
      </div>
    )}
    <pre className="p-6 overflow-x-auto">
      <code className={`language-${language} text-sm text-zinc-300 font-mono`}>
        {code}
      </code>
    </pre>
  </div>
)

// Componente para tablas responsivas
export const ResponsiveTable = ({
  headers,
  rows,
  className = ''
}: {
  headers: string[]
  rows: string[][]
  className?: string
}) => (
  <div className={`overflow-x-auto mb-8 rounded-xl border border-border shadow-sm ${className}`}>
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-muted/50">
          {headers.map((header, index) => (
            <th key={index} className="border-b border-border px-6 py-4 text-left font-bold text-sm uppercase tracking-wider text-muted-foreground">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex} className="hover:bg-muted/30 transition-colors odd:bg-background even:bg-muted/10">
            {row.map((cell, cellIndex) => (
              <td key={cellIndex} className="border-b border-border px-6 py-4 text-foreground font-medium">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

// Componente principal del formateador
export default function BlogContentFormatter({ children, className = '' }: BlogContentFormatterProps) {
  return (
    <div className={`blog-article prose prose-lg md:prose-xl dark:prose-invert max-w-none ${className}`}>
      <div className="space-y-8">
        {children}
      </div>
    </div>
  )
}
