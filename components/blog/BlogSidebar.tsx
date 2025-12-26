'use client'

import React from 'react'
import { motion } from 'framer-motion'
import TableOfContents from './TableOfContents'
import RelatedArticles from './RelatedArticles'
import FeaturedToolCard from './FeaturedToolCard'
import { TrendingUp, Award, Zap } from 'lucide-react'

interface BlogSidebarProps {
  content: string
  currentPostId: string
  category: string
  tags?: string[]
}

export default function BlogSidebar({
  content,
  currentPostId,
  category,
  tags
}: BlogSidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col gap-12 sticky top-24 h-fit pb-12">
      {/* 1. Sticky Table of Contents */}
      <div className="bg-card/50 backdrop-blur-md border border-border rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-black uppercase tracking-widest italic">Contenido</h3>
        </div>
        <TableOfContents content={content} />
      </div>

      {/* 2. Featured Tool / Offer */}
      <FeaturedToolCard 
        title="Red Creativa Pro IA"
        description="La herramienta definitiva para creadores de contenido. Genera artículos, correos y más en segundos."
        image="https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800"
        price="Prueba gratis"
        link="/dashboard"
        tag="Recomendado"
      />

      {/* 4. Related Posts in Sidebar */}
      <div className="bg-card/50 backdrop-blur-md border border-border rounded-[2rem] p-8">
        <div className="flex items-center gap-3 mb-6">
          <Zap className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-black uppercase tracking-widest italic">Relacionados</h3>
        </div>
        <RelatedArticles 
          currentPostId={currentPostId} 
          category={category} 
          tags={tags}
          limit={3}
          sidebar
        />
      </div>
    </aside>
  )
}
