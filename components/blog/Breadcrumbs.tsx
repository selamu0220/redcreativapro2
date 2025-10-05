'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-zinc-400 mb-6">
      <Link 
        href="/" 
        className="flex items-center hover:text-white transition-colors"
        aria-label="Inicio"
      >
        <Home size={16} />
      </Link>
      
      <ChevronRight size={16} />
      
      <Link 
        href="/blog" 
        className="hover:text-white transition-colors"
      >
        Blog
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight size={16} />
          {item.href ? (
            <Link 
              href={item.href} 
              className="hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-white font-medium">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}