'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Zap, Target, BookOpen } from 'lucide-react'

interface SummaryBoxProps {
  highlights: string[]
  title?: string
}

export default function SummaryBox({ 
  highlights, 
  title = "En este artículo aprenderás:" 
}: SummaryBoxProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-muted/30 border-2 border-primary/20 rounded-[2.5rem] p-8 md:p-10 my-12 relative overflow-hidden group"
    >
      {/* Decorative Elements */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-700" />
      <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-secondary/5 rounded-full blur-3xl group-hover:bg-secondary/10 transition-colors duration-700" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 rotate-3 group-hover:rotate-6 transition-transform">
            <BookOpen className="w-6 h-6 text-primary-foreground" />
          </div>
          <h3 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic">
            {title}
          </h3>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {highlights.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="flex items-start gap-4 p-4 rounded-2xl bg-background/50 border border-border/50 hover:border-primary/30 hover:bg-background transition-all"
            >
              <div className="mt-1">
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
                <p className="text-foreground font-black text-sm md:text-base leading-snug">
                  {item}
                </p>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Floating Badge */}
      <div className="absolute top-6 right-8 hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
        <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
        Lectura rápida
      </div>
    </motion.div>
  )
}
