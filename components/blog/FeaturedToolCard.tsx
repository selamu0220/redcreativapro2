'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Star, ArrowRight } from 'lucide-react'
import { Button } from '@/app/components/ui/button'

interface FeaturedToolCardProps {
  title: string
  description: string
  image: string
  rating?: number
  price?: string
  link: string
  tag?: string
}

export default function FeaturedToolCard({
  title,
  description,
  image,
  rating = 4.9,
  price = "Gratis",
  link,
  tag = "Destacado"
}: FeaturedToolCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 group"
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
            {tag}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="text-xl font-black tracking-tight mb-1 group-hover:text-primary transition-colors">
              {title}
            </h4>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-3.5 h-3.5 ${i < Math.floor(rating) ? 'text-amber-500 fill-amber-500' : 'text-muted'}`} 
                />
              ))}
              <span className="text-xs font-bold text-muted-foreground ml-2">{rating}</span>
            </div>
          </div>
          <span className="text-sm font-black text-primary">{price}</span>
        </div>
        
        <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-2 font-medium">
          {description}
        </p>
        
        <Button 
          asChild 
          className="w-full rounded-2xl h-12 font-black tracking-tight gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95"
        >
          <a href={link} target="_blank" rel="noopener noreferrer">
            Probar herramienta
            <ExternalLink className="w-4 h-4" />
          </a>
        </Button>
      </div>
    </motion.div>
  )
}
