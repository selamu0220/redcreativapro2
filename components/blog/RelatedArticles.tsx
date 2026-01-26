'use client'

import Link from 'next/link'
import Image from 'next/image'
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
  sidebar?: boolean
}

export default function RelatedArticles({
  currentPostId,
  category,
  tags,
  limit = 3,
  sidebar = false
}: RelatedArticlesProps) {
  const relatedPosts = getRelatedPosts(currentPostId, limit)
  const settings = usePerformanceOptimization()
  const [hoveredPost, setHoveredPost] = useState<string | null>(null)
  const [clickedPost, setClickedPost] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [particlePositions, setParticlePositions] = useState<{ left: string, top: string, x: number, delay: number, duration: number }[]>([])

  useEffect(() => {
    setMounted(true)
    const count = getOptimizedParticleCount(settings, 8)
    const positions = [...Array(count)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      x: Math.random() * 10 - 5,
      delay: Math.random() * 3,
      duration: 4 + Math.random() * 2
    }))
    setParticlePositions(positions)
  }, [settings])

  if (relatedPosts.length === 0) {
    return null
  }

  if (sidebar) {
    return (
      <div className="space-y-6">
        {relatedPosts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.id}`}
            className="group block"
          >
            <div className="flex gap-4 items-start">
              <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border border-border group-hover:border-primary transition-colors relative">
                <Image
                  src={post.image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=200'}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="80px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-black leading-tight group-hover:text-primary transition-colors line-clamp-2 mb-2">
                  {post.title}
                </h4>
                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  <Clock className="w-3 h-3" />
                  {post.readTime}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    )
  }

  return (
    <ScrollReveal direction="up" delay={0.2}>
      <motion.div
        className="bg-card border border-border rounded-xl p-6 relative overflow-hidden"
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
          {mounted && particlePositions.map((pos, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-gradient-to-r from-primary/40 to-secondary/40 rounded-full"
              style={{
                left: pos.left,
                top: pos.top,
              }}
              animate={{
                y: [0, -20, 0],
                x: [0, pos.x, 0],
                opacity: [0, 0.6, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: pos.duration * settings.animationDuration,
                repeat: Infinity,
                delay: pos.delay,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          <ExplodeIn delay={0.1}>
            <motion.h3
              className="text-xl font-bold text-foreground mb-6 flex items-center gap-2"
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
                      className="group flex gap-4 p-4 bg-muted/50 border border-border rounded-lg hover:border-primary/50 transition-all duration-300 hover:bg-muted relative overflow-hidden"
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
                          className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 relative"
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
                            className="text-xs font-medium text-foreground bg-secondary px-2 py-1 rounded"
                            whileHover={{
                              backgroundColor: "hsl(var(--primary))",
                              color: "hsl(var(--primary-foreground))",
                              scale: 1.05
                            }}
                          >
                            {categories.find(cat => cat.id === post.category)?.name}
                          </motion.span>
                          <motion.span
                            className="text-xs text-muted-foreground flex items-center gap-1"
                            whileHover={{ color: "hsl(var(--foreground))" }}
                          >
                            <Clock className="w-3 h-3" />
                            {post.readTime}
                          </motion.span>
                        </div>

                        <GlitchText intensity={1}>
                          <motion.h4
                            className="font-semibold text-foreground text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors"
                            whileHover={{
                              textShadow: "0 0 10px hsl(var(--primary) / 0.5)"
                            }}
                          >
                            {post.title}
                          </motion.h4>
                        </GlitchText>

                        <motion.div
                          className="flex items-center gap-4 text-xs text-muted-foreground"
                          whileHover={{ color: "hsl(var(--foreground))" }}
                        >
                          <span>{post.publishedAt}</span>
                        </motion.div>
                      </div>

                      <motion.div
                        className="flex items-center text-muted-foreground group-hover:text-primary transition-colors"
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
