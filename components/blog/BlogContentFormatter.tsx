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
  const getBoxStyles = () => {
    switch (type) {
      case 'tip':
        return 'bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500 text-blue-900 dark:text-blue-100'
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-950/20 border-l-4 border-yellow-500 text-yellow-900 dark:text-yellow-100'
      case 'success':
        return 'bg-green-50 dark:bg-green-950/20 border-l-4 border-green-500 text-green-900 dark:text-green-100'
      case 'highlight':
        return 'bg-purple-50 dark:bg-purple-950/20 border-l-4 border-purple-500 text-purple-900 dark:text-purple-100'
      default:
        return 'bg-muted dark:bg-gray-950/20 border-l-4 border-gray-500 text-foreground dark:text-gray-100'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'tip':
        return <Lightbulb className="w-5 h-5 text-blue-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'highlight':
        return <Star className="w-5 h-5 text-purple-500" />
      default:
        return <Info className="w-5 h-5 text-gray-500" />
    }
  }

  return (
    <div className={`rounded-lg p-6 mb-6 ${getBoxStyles()} ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1">
          {title && (
            <h4 className="font-semibold mb-2 text-inherit">
              {title}
            </h4>
          )}
          <div className="text-inherit">
            {children}
          </div>
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
  <section className={`mb-12 ${className}`}>
    <div className="bg-card border border-border rounded-xl p-8 shadow-sm mobile-spacing">
      <h2 className="text-3xl font-bold text-foreground mb-6 flex items-center">
        <span className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mr-4">
          {number}
        </span>
        {title}
      </h2>
      <div className="space-y-6">
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
  <div className={`grid md:grid-cols-2 gap-6 ${className}`}>
    {pros.length > 0 && (
      <div className="bg-green-50 dark:bg-green-950/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
        <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          Ventajas
        </h4>
        <ul className="space-y-2 text-green-800 dark:text-green-200">
          {pros.map((pro, index) => (
            <li key={index} className="flex items-start">
              <span className="text-green-500 mr-2 mt-1">•</span>
              {pro}
            </li>
          ))}
        </ul>
      </div>
    )}
    
    {cons.length > 0 && (
      <div className="bg-yellow-50 dark:bg-yellow-950/20 p-6 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-3 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          Consideraciones
        </h4>
        <ul className="space-y-2 text-yellow-800 dark:text-yellow-200">
          {cons.map((con, index) => (
            <li key={index} className="flex items-start">
              <span className="text-yellow-500 mr-2 mt-1">•</span>
              {con}
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
  <div className={`bg-muted rounded-lg p-6 mb-8 border-l-4 border-primary ${className}`}>
    <h3 className="text-xl font-semibold text-foreground mb-4">
      Estadísticas Destacadas
    </h3>
    <div className="grid md:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          <div className={`text-3xl font-bold mb-2 ${stat.color || 'text-primary'}`}>
            {stat.value}
          </div>
          <div className="text-sm text-muted-foreground">
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
  <div className={`bg-muted rounded-lg overflow-hidden mb-6 ${className}`}>
    {title && (
      <div className="bg-muted-foreground/10 px-4 py-2 text-sm font-medium text-muted-foreground border-b border-border">
        {title}
      </div>
    )}
    <pre className="p-4 overflow-x-auto">
      <code className={`language-${language} text-sm`}>
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
  <div className={`overflow-x-auto mb-6 ${className}`}>
    <table className="w-full border-collapse border border-border rounded-lg">
      <thead>
        <tr className="bg-muted">
          {headers.map((header, index) => (
            <th key={index} className="border border-border px-4 py-3 text-left font-semibold text-foreground">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex} className="hover:bg-muted/50">
            {row.map((cell, cellIndex) => (
              <td key={cellIndex} className="border border-border px-4 py-3 text-foreground">
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
    <div className={`blog-article prose prose-lg max-w-none ${className}`}>
      <div className="space-y-8">
        {children}
      </div>
    </div>
  )
}

// Exportar todos los componentes
