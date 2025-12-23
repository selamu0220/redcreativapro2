'use client'

import Link from 'next/link'
import { Clock, Calendar, Tag, Sparkles } from 'lucide-react'
import { BlogPost, authors } from '@/lib/blog-data'
import Breadcrumbs from '@/components/blog/Breadcrumbs'
import RelatedArticles from '@/components/blog/RelatedArticles'
import SocialShare from '@/components/blog/SocialShare'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'
import { 
  ExplodeIn, 
  BrutalSlide, 
  GlitchText, 
  BrutalParallax, 
  MagneticHover, 
  ScrollReveal,
  ParticleExplosion,
  BrutalTypewriter
} from '@/components/animations/BrutalAnimations'
import { usePerformanceOptimization, getOptimizedParticleCount } from '@/hooks/usePerformanceOptimization'

interface BlogPostLayoutProps {
  post: BlogPost
  children: React.ReactNode
}





export default function BlogPostLayout({ post, children }: BlogPostLayoutProps) {
  // Obtener información del autor
  const author = authors.find(a => a.id === post.author) || authors[0];
  const { scrollYProgress } = useScroll()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isScrolled, setIsScrolled] = useState(false)
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null)
  const [showExplosion, setShowExplosion] = useState(false)
  const settings = usePerformanceOptimization()

  // Componente FloatingParticles optimizado
  const FloatingParticles = () => {
    const particleCount = getOptimizedParticleCount(settings, 12)
    
    if (particleCount === 0) return null

    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(particleCount)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-zinc-600/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 10 - 5, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: (3 + Math.random() * 2) * settings.animationDuration,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    )
  }

  // Componente AnimatedBackground optimizado
  const AnimatedBackground = () => {
    if (settings.reduceMotion || settings.isLowEndDevice) {
      return <div className="fixed inset-0 bg-background -z-10" />
    }

    return (
      <motion.div 
        className="fixed inset-0 -z-10"
        animate={{
          background: [
            "radial-gradient(circle at 20% 50%, rgba(161, 161, 170, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(113, 113, 122, 0.1) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(82, 82, 91, 0.1) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 50%, rgba(161, 161, 170, 0.1) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(113, 113, 122, 0.1) 0%, transparent 50%), radial-gradient(circle at 60% 20%, rgba(82, 82, 91, 0.1) 0%, transparent 50%)",
            "radial-gradient(circle at 40% 20%, rgba(161, 161, 170, 0.1) 0%, transparent 50%), radial-gradient(circle at 60% 80%, rgba(113, 113, 122, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(82, 82, 91, 0.1) 0%, transparent 50%)"
          ]
        }}
        transition={{
          duration: settings.enableComplexAnimations ? 20 : 10,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          backgroundColor: "#000000"
        }}
      />
    )
  }
  
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Componente FloatingParticles optimizado
  const FloatingParticles = () => {
    const particleCount = getOptimizedParticleCount(settings, 12)
    
    if (particleCount === 0 || !mounted) return null

    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(particleCount)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-zinc-600/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 10 - 5, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: (3 + Math.random() * 2) * settings.animationDuration,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    )
  }

  // Componente AnimatedBackground optimizado
  const AnimatedBackground = () => {
    if (settings.reduceMotion || settings.isLowEndDevice || !mounted) {
      return <div className="fixed inset-0 bg-background -z-10" />
    }

    return (
      <motion.div 
        className="fixed inset-0 -z-10"
        animate={{
          background: [
            "radial-gradient(circle at 20% 50%, rgba(161, 161, 170, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(113, 113, 122, 0.1) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(82, 82, 91, 0.1) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 50%, rgba(161, 161, 170, 0.1) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(113, 113, 122, 0.1) 0%, transparent 50%), radial-gradient(circle at 60% 20%, rgba(82, 82, 91, 0.1) 0%, transparent 50%)",
            "radial-gradient(circle at 40% 20%, rgba(161, 161, 170, 0.1) 0%, transparent 50%), radial-gradient(circle at 60% 80%, rgba(113, 113, 122, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(82, 82, 91, 0.1) 0%, transparent 50%)"
          ]
        }}
        transition={{
          duration: settings.enableComplexAnimations ? 20 : 10,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          backgroundColor: "#000000"
        }}
      />
    )
  }
  
  // Transformaciones basadas en scroll MEJORADAS
  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.9])
  const titleScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.98])
  const titleY = useTransform(scrollYProgress, [0, 0.3], [0, -10])
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -200])
  
  // Seguimiento del mouse para efectos MEJORADO
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    
    const handleClick = () => {
      setShowExplosion(true)
      setTimeout(() => setShowExplosion(false), 1000)
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('click', handleClick)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('click', handleClick)
    }
  }, [])
  
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <motion.div style={{ y: backgroundY }}>
        <AnimatedBackground />
      </motion.div>
      <FloatingParticles />
      <ParticleExplosion trigger={showExplosion} />
      
      {/* Cursor personalizado MEJORADO con trail */}
      {mounted && (
        <>
          <motion.div
            className="fixed w-8 h-8 bg-zinc-800/60 rounded-full pointer-events-none z-50"
            animate={{
              x: mousePosition.x - 16,
              y: mousePosition.y - 16,
            }}
            transition={{
              type: "spring",
              stiffness: 800,
              damping: 35
            }}
          />

          {/* Trail del cursor */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="fixed w-4 h-4 bg-zinc-700/30 rounded-full pointer-events-none z-40"
              animate={{
                x: mousePosition.x - 8,
                y: mousePosition.y - 8,
              }}
              transition={{
                type: "spring",
                stiffness: 200 - i * 30,
                damping: 20 + i * 5,
                delay: i * 0.02
              }}
            />
          ))}
        </>
      )}
      <motion.header
        className="border-b border-zinc-800/50 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40"
        style={{ opacity: headerOpacity }}
      >
        <div className="container mx-auto px-4 py-4 responsive-container">
          <div className="flex justify-between items-center">
            <ExplodeIn delay={0.2}>
              <MagneticHover strength={0.2}>
                <Link href="/" className="flex items-center space-x-2 group">
                  <motion.div 
                    className="w-8 h-8 bg-gradient-to-br from-zinc-800 to-zinc-700 rounded-lg flex items-center justify-center relative overflow-hidden"
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                    <span className="text-white font-bold text-sm relative z-10">RC</span>
                  </motion.div>
                  <GlitchText intensity={2}>
                    <span className="text-lg font-semibold text-white group-hover:text-zinc-300 transition-all duration-300">
                      Red Creativa Pro
                    </span>
                  </GlitchText>
                </Link>
              </MagneticHover>
            </ExplodeIn>
            
            <BrutalSlide direction="right" delay={0.4}>
              <MagneticHover>
                <Link 
                  href="/blog" 
                  className="text-sm text-zinc-400 hover:text-white transition-all duration-300 relative group"
                >
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-zinc-800/20 to-zinc-700/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"
                    style={{ padding: '8px 16px', margin: '-8px -16px' }}
                  />
                  <span className="relative">← Volver al blog</span>
                </Link>
              </MagneticHover>
            </BrutalSlide>
          </div>
        </div>
      </motion.header>

      <main className="container mx-auto px-4 py-8 relative z-10 responsive-container">
        {/* Breadcrumbs con animación MEJORADA */}
        <ScrollReveal direction="up" delay={0.1}>
          <Breadcrumbs 
            category={post.category}
            subcategory={post.subcategory}
            postTitle={post.title}
          />
        </ScrollReveal>

        {/* Article Header con efectos BRUTALES */}
        <article className="max-w-4xl mx-auto">
          <motion.header 
            className="mb-8 relative"
            style={{ scale: titleScale, y: titleY }}
          >
            {/* Efecto de brillo MEJORADO detrás del título */}
            <motion.div
              className="absolute -inset-8 bg-gradient-to-r from-transparent via-zinc-700/20 to-transparent rounded-3xl blur-2xl"
              animate={{
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.1, 1],
                rotate: [0, 2, -2, 0]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            <ExplodeIn delay={0.6}>
              <GlitchText intensity={3}>
                      <motion.h1 
                  className="text-4xl md:text-6xl font-bold mb-4 leading-tight relative z-10 text-white text-2xl md:text-4xl"
                  whileHover={{ 
                    scale: 1.05,
                    textShadow: "0 0 20px rgba(161, 161, 170, 0.5)",
                    transition: { duration: 0.3 }
                  }}
                >
                  <BrutalTypewriter text={post.title} speed={30} />
                </motion.h1>
              </GlitchText>
            </ExplodeIn>
            
            <BrutalSlide direction="up" delay={1.2} distance={50}>
              <motion.p 
                className="text-xl text-zinc-400 mb-6 leading-relaxed relative z-10"
                whileHover={{ color: "#e4e4e7" }}
              >
                {post.excerpt}
              </motion.p>
            </BrutalSlide>

            {/* Meta Information con animaciones BRUTALES */}
            <motion.div 
              className="flex flex-wrap items-center gap-6 text-sm text-zinc-400 mb-6 relative z-10"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.2,
                    delayChildren: 1.4
                  }
                }
              }}
            >
              <ExplodeIn delay={1.6}>
                <MagneticHover strength={0.1}>
                  <motion.div 
                    className="flex items-center gap-2 group cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                  >
                    <motion.div
                      animate={{ 
                        rotate: 360,
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ 
                        rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                        scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                      }}
                    >
                      <Calendar className="w-4 h-4 text-zinc-400" />
                    </motion.div>
                    <time dateTime={post.publishedAt} className="group-hover:text-zinc-300 transition-colors">
                      {new Date(post.publishedAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </time>
                  </motion.div>
                </MagneticHover>
              </ExplodeIn>
              
              <ExplodeIn delay={1.8}>
                <MagneticHover strength={0.1}>
                  <motion.div 
                    className="flex items-center gap-2 group cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                  >
                    <motion.div
                      animate={{ 
                        rotate: [0, 15, -15, 0],
                        scale: [1, 1.3, 1],
                        y: [0, -3, 0]
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Clock className="w-4 h-4 text-zinc-400" />
                    </motion.div>
                    <span className="group-hover:text-purple-400 transition-colors">{post.readTime}</span>
                  </motion.div>
                </MagneticHover>
              </ExplodeIn>

              <ExplodeIn delay={2.0}>
                <MagneticHover strength={0.1}>
                  <motion.div 
                    className="flex items-center gap-2 group cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                  >
                    <motion.div
                      animate={{ 
                        y: [0, -4, 0],
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ 
                        duration: 4, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Sparkles className="w-4 h-4 text-yellow-400" />
                    </motion.div>
                    <span className="text-zinc-500">Por</span>
                    <GlitchText>
                      <span className="text-white group-hover:text-yellow-400 transition-colors font-medium">
                        {author?.name || 'Autor'}
                      </span>
                    </GlitchText>
                  </motion.div>
                </MagneticHover>
              </ExplodeIn>
            </motion.div>

            {/* Tags con animaciones BRUTALES */}
            <motion.div 
              className="flex flex-wrap gap-2 mb-8 relative z-10"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 2.2
                  }
                }
              }}
            >
              {post.tags.map((tag, index) => (
                <ExplodeIn key={tag} delay={2.2 + index * 0.1}>
                  <MagneticHover strength={0.3}>
                    <motion.span
                      className="inline-flex items-center gap-1 px-3 py-1 bg-zinc-800/50 backdrop-blur-sm text-zinc-300 text-sm rounded-full border border-zinc-700/50 hover:border-zinc-500/50 transition-all duration-300 cursor-pointer group"
                      whileHover={{ 
                        scale: 1.1,
                        backgroundColor: "rgba(161, 161, 170, 0.2)",
                        borderColor: "rgba(161, 161, 170, 0.8)",
                        boxShadow: "0 0 20px rgba(161, 161, 170, 0.3)"
                      }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <motion.div
                        animate={{ 
                          rotate: 360,
                          scale: [1, 1.2, 1]
                        }}
                        transition={{ 
                          rotate: { duration: 6 + index, repeat: Infinity, ease: "linear" },
                          scale: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }
                        }}
                      >
                        <Tag className="w-3 h-3 group-hover:text-zinc-300 transition-colors" />
                      </motion.div>
                      <span className="group-hover:text-zinc-300 transition-colors">{tag}</span>
                    </motion.span>
                  </MagneticHover>
                </ExplodeIn>
              ))}
            </motion.div>
            {/* Social Share con efectos BRUTALES */}
            <ScrollReveal direction="up" delay={2.8}>
              <MagneticHover>
                <SocialShare 
                  url={`https://redcreativa.pro/blog/${post.id}`}
                  title={post.title}
                />
              </MagneticHover>
            </ScrollReveal>
          </motion.header>

          {/* Article Content con reveal animation MEJORADO */}
          <ScrollReveal direction="up" delay={0.2}>
            <motion.div 
              className="prose prose-invert prose-lg max-w-none relative z-10"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="absolute -inset-8 bg-gradient-to-r from-transparent via-zinc-500/10 to-transparent rounded-3xl"
                animate={{
                  opacity: [0, 0.8, 0],
                  scale: [0.98, 1.02, 0.98],
                  rotate: [0, 1, -1, 0]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <div className="relative z-10">
                {children}
              </div>
            </motion.div>
          </ScrollReveal>

          {/* Author Bio con efectos BRUTALES */}
          {author && (
            <ScrollReveal direction="up" delay={0.3}>
              <motion.section 
                className="mt-12 p-8 bg-gradient-to-br from-zinc-900/50 via-zinc-800/30 to-zinc-900/50 backdrop-blur-sm rounded-3xl border border-zinc-700/50 relative overflow-hidden mobile-spacing"
                whileHover={{ 
                  scale: 1.03,
                  boxShadow: "0 0 40px rgba(161, 161, 170, 0.2)",
                  transition: { duration: 0.3 }
                }}
              >
                {/* Efecto de brillo animado MEJORADO en el fondo */}
                <motion.div
                  className="absolute -inset-2 bg-gradient-to-r from-zinc-600/30 via-zinc-500/30 to-zinc-400/30 rounded-3xl blur-2xl"
                  animate={{
                    opacity: [0.1, 0.6, 0.1],
                    scale: [1, 1.1, 1],
                    rotate: [0, 3, -3, 0]
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                {/* Partículas flotantes MEJORADAS en el autor */}
                <div className="absolute inset-0 overflow-hidden">
                  {[...Array(15)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-zinc-700/40 rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                      animate={{
                        y: [0, -30, 0],
                        x: [0, Math.random() * 20 - 10, 0],
                        opacity: [0, 1, 0],
                        scale: [0, 1.5, 0],
                        rotate: [0, 360]
                      }}
                      transition={{
                        duration: 4 + Math.random() * 3,
                        repeat: Infinity,
                        delay: Math.random() * 3,
                        ease: "easeInOut"
                      }}
                    />
                  ))}
                </div>

                <div className="flex items-start gap-6 relative z-10">
                  <ExplodeIn delay={0.5}>
                    <MagneticHover strength={0.2}>
                      <motion.div 
                        className="relative"
                        whileHover={{ scale: 1.15, rotate: 10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <motion.div
                          className="absolute -inset-2 bg-gradient-to-r from-zinc-800/30 to-zinc-700/30 rounded-full blur-lg"
                          animate={{
                            opacity: [0.3, 0.7, 0.3],
                            scale: [1, 1.2, 1],
                            rotate: [0, 180, 360]
                          }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                        />
                        <motion.img
                          src={author.avatar}
                          alt={author.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-zinc-600 relative z-10"
                          whileHover={{ 
                            borderColor: "#9ca3af",
                            boxShadow: "0 0 10px rgba(156,163,175,0.15)"
                          }}
                        />
                      </motion.div>
                    </MagneticHover>
                  </ExplodeIn>
                  
                  <div className="flex-1">
                    <BrutalSlide direction="right" delay={0.7} distance={30}>
                      <GlitchText intensity={2}>
                        <motion.h3 
                            className="text-xl font-semibold text-white mb-2"
                            whileHover={{ 
                              color: "#e4e4e7"
                            }}
                        >
                          {author.name}
                        </motion.h3>
                      </GlitchText>
                    </BrutalSlide>
                    
                    <BrutalSlide direction="right" delay={0.9} distance={40}>
                      <motion.p 
                        className="text-zinc-400 text-sm mb-3 font-medium"
                        whileHover={{ scale: 1.05 }}
                      >
                        Especialista en IA y Marketing Digital
                      </motion.p>
                    </BrutalSlide>
                    
                    <BrutalSlide direction="right" delay={1.1} distance={50}>
                      <motion.p 
                        className="text-zinc-400 text-sm leading-relaxed"
                        whileHover={{ color: "#e4e4e7" }}
                      >
                        {author.bio}
                      </motion.p>
                    </BrutalSlide>
                  </div>
                </div>
              </motion.section>
            </ScrollReveal>
          )}

          {/* Related Articles con animaciones BRUTALES */}
          <ScrollReveal direction="up" delay={0.4}>
            <motion.div 
              className="mt-16"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="absolute -inset-4 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent rounded-2xl"
                animate={{
                  opacity: [0, 0.5, 0],
                  scale: [0.99, 1.01, 0.99]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <div className="relative z-10">
                <RelatedArticles currentPostId={post.id} category={post.category} />
              </div>
            </motion.div>
          </ScrollReveal>
        </article>
      </main>

      {/* Footer con efectos BRUTALES */}
      <ScrollReveal direction="up" delay={0.5}>
        <motion.footer 
          className="border-t border-zinc-800/50 bg-black/95 backdrop-blur-xl mt-20 relative overflow-hidden"
          whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.98)" }}
        >
          {/* Ondas de energía en el footer */}
                <div className="absolute inset-0 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-full h-1 bg-gradient-to-r from-transparent via-zinc-700/20 to-transparent"
                style={{ top: `${i * 25}%` }}
                animate={{
                  x: ["-100%", "100%"],
                  opacity: [0, 0.5, 0]
                }}
                transition={{
                  duration: 3 + i,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "linear"
                }}
              />
            ))}
          </div>
          
          <div className="container mx-auto px-4 py-8 relative z-10 responsive-container">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <ExplodeIn delay={0.2}>
                <MagneticHover>
                  <motion.div 
                    className="flex items-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    <motion.div 
                      className="w-6 h-6 bg-gradient-to-br from-zinc-800 to-zinc-700 rounded-md flex items-center justify-center"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    >
                      <span className="text-white font-bold text-xs">RC</span>
                    </motion.div>
                    <GlitchText>
                      <span className="text-zinc-400 text-sm">© 2024 Red Creativa Pro</span>
                    </GlitchText>
                  </motion.div>
                </MagneticHover>
              </ExplodeIn>
              
              <BrutalSlide direction="right" delay={0.4}>
                <motion.div 
                  className="flex items-center gap-4 text-sm text-zinc-500"
                  whileHover={{ color: "#e4e4e7" }}
                >
                  <MagneticHover strength={0.1}>
                      <motion.span 
                      className="hover:text-zinc-300 transition-colors cursor-pointer"
                      whileHover={{ scale: 1.1 }}
                    >
                      Política de Privacidad
                    </motion.span>
                  </MagneticHover>
                  <span>•</span>
                  <MagneticHover strength={0.1}>
                      <motion.span 
                      className="hover:text-zinc-300 transition-colors cursor-pointer"
                      whileHover={{ scale: 1.1 }}
                    >
                      Términos de Uso
                    </motion.span>
                  </MagneticHover>
                  <span>•</span>
                  <MagneticHover strength={0.1}>
                      <motion.span 
                      className="hover:text-zinc-300 transition-colors cursor-pointer"
                      whileHover={{ scale: 1.1 }}
                    >
                      Contacto
                    </motion.span>
                  </MagneticHover>
                </motion.div>
              </BrutalSlide>
            </div>
          </div>
        </motion.footer>
      </ScrollReveal>

      {/* Efecto de scroll progress */}
                    <motion.div 
                      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-zinc-700 to-zinc-600 transform-origin-left z-50"
        style={{ scaleX: scrollYProgress }}
      />
    </div>
  )
}