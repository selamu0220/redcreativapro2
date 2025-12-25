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

  const [mounted, setMounted] = useState(false)
  const [particlePositions, setParticlePositions] = useState<{left: string, top: string, x: number, delay: number, duration: number}[]>([])

  useEffect(() => {
    setMounted(true)
    const count = getOptimizedParticleCount(settings, 12)
    const positions = [...Array(count)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      x: Math.random() * 10 - 5,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 2
    }))
    setParticlePositions(positions)
  }, [settings])

  // Componente FloatingParticles optimizado
  const FloatingParticles = () => {
    if (particlePositions.length === 0 || !mounted) return null

    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particlePositions.map((pos, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-zinc-600/30 rounded-full"
            style={{
              left: pos.left,
              top: pos.top,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, pos.x, 0],
              opacity: [0, 1, 0],
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
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <motion.div style={{ y: backgroundY }}>
      </motion.div>
      <FloatingParticles />
      <ParticleExplosion trigger={showExplosion} />
      
      {/* Cursor personalizado MEJORADO con trail */}
      {mounted && (
        <>
          <motion.div
            className="fixed w-8 h-8 bg-white/20 rounded-full pointer-events-none z-50"
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
        </>
      )}
      <motion.header
        className="border-b border-zinc-900 bg-black/95 backdrop-blur-xl sticky top-0 z-40"
        style={{ opacity: headerOpacity }}
      >
        <div className="container mx-auto px-4 py-4 responsive-container">
          <div className="flex justify-between items-center">
            <ExplodeIn delay={0.2}>
              <MagneticHover strength={0.2}>
                <Link href="/" className="flex items-center space-x-2 group">
                  <motion.div 
                    className="w-8 h-8 bg-white rounded-lg flex items-center justify-center relative overflow-hidden"
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <span className="text-black font-black text-sm relative z-10">RC</span>
                  </motion.div>
                  <GlitchText intensity={2}>
                    <span className="text-lg font-black text-white group-hover:text-zinc-300 transition-all duration-300">
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
                  <span className="relative font-bold">← Volver al blog</span>
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
            <ExplodeIn delay={0.6}>
              <GlitchText intensity={3}>
                <motion.h1 
                  className="text-4xl md:text-6xl font-black mb-4 leading-tight relative z-10 text-white"
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.3 }
                  }}
                >
                  <BrutalTypewriter text={post.title} speed={30} />
                </motion.h1>
              </GlitchText>
            </ExplodeIn>
            
            <BrutalSlide direction="up" delay={1.2} distance={50}>
              <motion.p 
                className="text-xl text-zinc-400 mb-6 leading-relaxed relative z-10 font-medium"
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
                    <Calendar className="w-4 h-4 text-zinc-500" />
                    <time dateTime={post.publishedAt} className="group-hover:text-white transition-colors font-bold">
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
                    <Clock className="w-4 h-4 text-zinc-500" />
                    <span className="group-hover:text-white transition-colors font-bold">{post.readTime}</span>
                  </motion.div>
                </MagneticHover>
              </ExplodeIn>

              <ExplodeIn delay={2.0}>
                <MagneticHover strength={0.1}>
                  <motion.div 
                    className="flex items-center gap-2 group cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                  >
                    <Sparkles className="w-4 h-4 text-zinc-500" />
                    <span className="text-zinc-500 font-bold">Por</span>
                    <span className="text-white group-hover:text-zinc-300 transition-colors font-black">
                      {author?.name || 'Autor'}
                    </span>
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
                      className="inline-flex items-center gap-1 px-3 py-1 bg-zinc-900 text-zinc-300 text-sm rounded-full border border-zinc-800 hover:border-zinc-500 transition-all duration-300 cursor-pointer group font-bold"
                      whileHover={{ 
                        scale: 1.1,
                        backgroundColor: "#18181b",
                        borderColor: "#52525b",
                      }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Tag className="w-3 h-3 group-hover:text-white transition-colors" />
                      <span className="group-hover:text-white transition-colors">{tag}</span>
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
            <div className="relative z-10">
              {children}
            </div>
          </ScrollReveal>

          {/* Author Bio con efectos BRUTALES */}
          {author && (
            <ScrollReveal direction="up" delay={0.3}>
              <motion.section 
                className="mt-12 p-8 bg-zinc-900 rounded-3xl border border-zinc-800 relative overflow-hidden mobile-spacing"
                whileHover={{ 
                  scale: 1.01,
                  transition: { duration: 0.3 }
                }}
              >
                <div className="flex items-start gap-6 relative z-10">
                  <ExplodeIn delay={0.5}>
                    <MagneticHover strength={0.2}>
                      <motion.div 
                        className="relative"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.3 }}
                      >
                        <img
                          src={author.avatar}
                          alt={author.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-zinc-700 relative z-10"
                        />
                      </motion.div>
                    </MagneticHover>
                  </ExplodeIn>
                  
                  <div className="flex-1">
                    <BrutalSlide direction="right" delay={0.7} distance={30}>
                      <h3 className="text-xl font-black text-white mb-2">
                        {author.name}
                      </h3>
                    </BrutalSlide>
                    
                    <BrutalSlide direction="right" delay={0.9} distance={40}>
                      <p className="text-zinc-400 text-sm mb-3 font-bold">
                        Especialista en IA y Marketing Digital
                      </p>
                    </BrutalSlide>
                    
                    <BrutalSlide direction="right" delay={1.1} distance={50}>
                      <p className="text-zinc-300 text-sm leading-relaxed font-medium">
                        {author.bio}
                      </p>
                    </BrutalSlide>
                  </div>
                </div>
              </motion.section>
            </ScrollReveal>
          )}

          {/* Related Articles con animaciones BRUTALES */}
          <ScrollReveal direction="up" delay={0.4}>
            <div className="mt-16 relative z-10">
              <RelatedArticles currentPostId={post.id} category={post.category} />
            </div>
          </ScrollReveal>
        </article>
      </main>

      {/* Footer con efectos BRUTALES */}
      <ScrollReveal direction="up" delay={0.5}>
        <footer 
          className="border-t border-zinc-900 bg-black mt-20 relative overflow-hidden"
        >
          <div className="container mx-auto px-4 py-8 relative z-10 responsive-container">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <ExplodeIn delay={0.2}>
                <MagneticHover>
                  <motion.div 
                    className="flex items-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
                      <span className="text-black font-black text-xs">RC</span>
                    </div>
                    <span className="text-zinc-500 text-sm font-bold">© 2024 Red Creativa Pro</span>
                  </motion.div>
                </MagneticHover>
              </ExplodeIn>
              
              <BrutalSlide direction="right" delay={0.4}>
                <div className="flex items-center gap-4 text-sm text-zinc-500 font-bold">
                  <MagneticHover strength={0.1}>
                    <span className="hover:text-white transition-colors cursor-pointer">
                      Política de Privacidad
                    </span>
                  </MagneticHover>
                  <span>•</span>
                  <MagneticHover strength={0.1}>
                    <span className="hover:text-white transition-colors cursor-pointer">
                      Términos de Uso
                    </span>
                  </MagneticHover>
                  <span>•</span>
                  <MagneticHover strength={0.1}>
                    <span className="hover:text-white transition-colors cursor-pointer">
                      Contacto
                    </span>
                  </MagneticHover>
                </div>
              </BrutalSlide>
            </div>
          </div>
        </footer>
      </ScrollReveal>

      {/* Efecto de scroll progress */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-white transform-origin-left z-50"
        style={{ scaleX: scrollYProgress }}
      />
    </div>
  )
}