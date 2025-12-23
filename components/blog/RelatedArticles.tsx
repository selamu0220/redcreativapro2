'use client'

import Link from 'next/link'
import { Clock, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { getRelatedPosts, categories } from '@/lib/blog-data'
import {
  ExplodeIn,
  BrutalSlide,
  GlitchText,
  MagneticHover,
  ScrollReveal,
  ParticleExplosion
} from '@/components/animations/BrutalAnimations'
import { usePerformanceOptimization, getOptimizedParticleCount } from '@/hooks/usePerformanceOptimization'
import { useState, useEffect } from 'react'

interface RelatedArticlesProps {
  currentPostId: string
  category: string
  tags?: string[]
  limit?: number
}

export default function RelatedArticles({
  currentPostId,
  category,
  tags,
  limit = 3
}: RelatedArticlesProps) {
  const relatedPosts = getRelatedPosts(currentPostId, limit)
  const settings = usePerformanceOptimization()
  const [hoveredPost, setHoveredPost] = useState<string | null>(null)
  const [clickedPost, setClickedPost] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (relatedPosts.length === 0) {
    return null
  }

  return (
    <ScrollReveal direction="up" delay={0.2}>
      <motion.div
        className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 relative overflow-hidden"
        whileHover={{
          borderColor: "hsl(var(--primary))",
          boxShadow: "0 0 30px hsl(var(--primary) / 0.1)"
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Efecto de brillo de fondo */}
        <motion.div
          className="absolute -inset-2 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-xl blur-xl"
          animate={{
            opacity: [0.1, 0.3, 0.1],
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Partículas flotantes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {mounted && [...Array(getOptimizedParticleCount(settings, 8))].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-gradient-to-r from-primary/40 to-secondary/40 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                x: [0, Math.random() * 10 - 5, 0],
                opacity: [0, 0.6, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: (4 + Math.random() * 2) * settings.animationDuration,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          <ExplodeIn delay={0.1}>
            <motion.h3
              className="text-xl font-bold text-white mb-6 flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <ArrowRight className="w-5 h-5 text-primary" />
              </motion.div>
              <GlitchText intensity={1}>
                Artículos Relacionados
              </GlitchText>
            </motion.h3>
          </ExplodeIn>

          <div className="space-y-4">
            {relatedPosts.map((post, index) => (
              <BrutalSlide
                key={post.id}
                direction="right"
                delay={0.2 + index * 0.1}
                distance={30}
              >
                <MagneticHover strength={0.1}>
                  <motion.div
                    className="relative"
                    onHoverStart={() => setHoveredPost(post.id)}
                    onHoverEnd={() => setHoveredPost(null)}
                    onClick={() => {
                      setClickedPost(post.id)
                      setTimeout(() => setClickedPost(null), 500)
                    }}
                  >
                    <Link
                      href={`/blog/${post.id}`}
                      className="group flex gap-4 p-4 bg-zinc-800 border border-zinc-700 rounded-lg hover:border-zinc-600 transition-all duration-300 hover:bg-zinc-750 relative overflow-hidden"
                    >
                      {/* Efecto de hover con gradiente */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 opacity-0 group-hover:opacity-100"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "100%" }}
                        transition={{ duration: 0.6 }}
                      />

                      <ExplodeIn delay={0.3 + index * 0.05}>
                        <motion.div
                          className="w-16 h-16 bg-gradient-to-br from-zinc-700 to-zinc-900 rounded-lg flex items-center justify-center flex-shrink-0 relative"
                          whileHover={{
                            scale: 1.1,
                            rotate: 10,
                            boxShadow: "0 0 20px hsl(var(--primary) / 0.3)"
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          {/* Brillo rotativo en el icono */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg"
                            animate={hoveredPost === post.id ? {
                              rotate: [0, 360],
                              scale: [1, 1.1, 1]
                            } : {}}
                            transition={{ duration: 1, ease: "linear" }}
                          />
                          <motion.span
                            className="text-2xl relative z-10"
                            animate={hoveredPost === post.id ? {
                              scale: [1, 1.2, 1],
                              rotate: [0, -10, 10, 0]
                            } : {}}
                            transition={{ duration: 0.5 }}
                          >
                            {categories.find(cat => cat.id === post.category)?.icon || '📝'}
                          </motion.span>
                        </motion.div>
                      </ExplodeIn>

                      <div className="flex-1 min-w-0 relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                          <motion.span
                            className="text-xs font-medium text-white bg-zinc-700 px-2 py-1 rounded"
                            whileHover={{
                              backgroundColor: "hsl(var(--primary))",
                              scale: 1.05
                            }}
                          >
                            {categories.find(cat => cat.id === post.category)?.name}
                          </motion.span>
                          <motion.span
                            className="text-xs text-zinc-500 flex items-center gap-1"
                            whileHover={{ color: "#e4e4e7" }}
                          >
                            <Clock className="w-3 h-3" />
                            {post.readTime}
                          </motion.span>
                        </div>

                        <GlitchText intensity={1}>
                          <motion.h4
                            className="font-semibold text-white text-sm mb-2 line-clamp-2 group-hover:text-zinc-300 transition-colors"
                            whileHover={{
                              textShadow: "0 0 10px hsl(var(--primary) / 0.5)"
                            }}
                          >
                            {post.title}
                          </motion.h4>
                        </GlitchText>

                        <motion.div
                          className="flex items-center gap-4 text-xs text-zinc-500"
                          whileHover={{ color: "#a1a1aa" }}
                        >
                          <span>{post.publishedAt}</span>
                        </motion.div>
                      </div>

                      <motion.div
                        className="flex items-center text-zinc-500 group-hover:text-white transition-colors"
                        whileHover={{
                          scale: 1.2,
                          color: "hsl(var(--primary))"
                        }}
                        animate={hoveredPost === post.id ? {
                          x: [0, 5, 0],
                          rotate: [0, 15, 0]
                        } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </motion.div>
                    </Link>

                    {/* Explosión de partículas al hacer clic */}
                    <ParticleExplosion
                      trigger={clickedPost === post.id}
                      particleCount={8}
                    />
                  </motion.div>
                </MagneticHover>
              </BrutalSlide>
            ))}
          </div>
        </div>
      </motion.div>
    </ScrollReveal>
  )
}