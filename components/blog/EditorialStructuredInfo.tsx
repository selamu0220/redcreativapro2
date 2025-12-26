'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  ClipboardList, 
  Terminal, 
  Library, 
  ChevronRight, 
  Zap,
  CheckCircle2,
  ExternalLink,
  ArrowRight
} from 'lucide-react'
import { Badge } from '@/app/components/ui/badge'

interface EditorialStructuredInfoProps {
  proceso?: string[]
  prompts?: string[]
  recursos?: { name: string, href: string }[]
}

export default function EditorialStructuredInfo({
  proceso = [
    "Búsqueda y selección de fuentes relevantes",
    "Agrupación temática y cronológica de hallazgos",
    "Identificación de vacíos de investigación con IA"
  ],
  prompts = [
    "Organiza esta bibliografía por temas y años con síntesis por bloque.",
    "Resume hallazgos clave y señaliza vacíos de investigación por tema.",
    "Propón líneas futuras de investigación basadas en vacíos detectados."
  ],
  recursos = [
    { name: "Escritor IA", href: "/escritor-ia" },
    { name: "Corrector de textos IA", href: "/corrector-textos-ia" }
  ]
}: EditorialStructuredInfoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-16">
      {/* Proceso */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all group"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
            <ClipboardList className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-black uppercase tracking-tighter italic">Proceso</h3>
        </div>
        <div className="space-y-5">
          {proceso.map((item, i) => (
            <div key={i} className="flex gap-4 items-center p-3 rounded-2xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                {i + 1}
              </div>
              <p className="text-sm font-bold text-foreground/80 leading-tight">{item}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Prompts */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="bg-zinc-900 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
              <Terminal className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tighter italic">Prompts</h3>
          </div>
            <div className="space-y-4">
              {prompts.map((prompt, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/10 transition-colors group/prompt relative">
                  <p className="text-[13px] font-mono leading-relaxed text-slate-50 opacity-90 line-clamp-2 italic pr-8 group-hover:opacity-100 transition-opacity">"{prompt}"</p>
                  <button 
                    onClick={() => navigator.clipboard.writeText(prompt)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover/prompt:opacity-100 transition-opacity p-1.5 hover:bg-primary rounded-md"
                  >
                    <Zap className="w-3 h-3 text-white fill-current" />
                  </button>
                </div>
              ))}
            </div>
          <button className="mt-6 w-full py-3 bg-white text-black rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all">
            Copiar todo <Zap className="w-3 h-3 fill-current" />
          </button>
        </div>
      </motion.div>

      {/* Recursos */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 group hover:bg-primary/10 transition-all"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
            <Library className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-black uppercase tracking-tighter italic">Recursos</h3>
        </div>
          <div className="space-y-4">
            {recursos.map((recurso, i) => (
              <a 
                key={i} 
                href={recurso.href}
                className="flex items-center justify-between p-4 bg-white dark:bg-zinc-950 border border-border rounded-2xl hover:border-primary hover:shadow-lg transition-all group/item hover:-translate-x-1"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center group-hover/item:bg-primary/10 transition-colors">
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover/item:text-primary" />
                  </div>
                  <span className="font-bold text-sm">{recurso.name}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-primary group-hover/item:translate-x-1 transition-transform" />
              </a>
            ))}
          </div>
        <div className="mt-8 p-4 bg-primary rounded-2xl text-white text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-80">Únete ahora</p>
          <p className="font-black text-lg italic tracking-tighter">Empezar ahora</p>
        </div>
      </motion.div>
    </div>
  )
}
