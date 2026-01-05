'use client'

import { useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

interface MagicTransformationProps {
  tools: { icon: string; name: string }[]
  result: { icon: string; name: string; color: string }
  className?: string
}

export function MagicTransformation({ tools, result, className = '' }: MagicTransformationProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], [100, -100])
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0])

  return (
    <section ref={ref} className={`py-32 relative overflow-hidden ${className}`}>
      <div className="container mx-auto px-4">
        <motion.div style={{ y, opacity }} className="text-center mb-20">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Una herramienta.<br />
            <span className="text-blue-500">Cero fricción.</span>
          </h2>
        </motion.div>

        <div 
          ref={ref}
          className="relative max-w-4xl mx-auto cursor-pointer group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <motion.div
            className="absolute -inset-10 bg-blue-600/20 blur-[120px] rounded-full transition-opacity duration-500"
            style={{ opacity: isHovered ? 1 : 0 }}
          />
          
          <div className="relative glass rounded-[2rem] p-1 border-white/10 shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
            <div className="rounded-[1.9rem] bg-black p-12 overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
              <motion.div
                className="flex items-center gap-8 flex-wrap justify-center"
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              >
                {tools.map((tool, index) => (
                  <motion.div
                    key={tool.name}
                    className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10"
                    variants={{
                      initial: { opacity: 0, x: -20 },
                      animate: { 
                        opacity: 0.3, 
                        x: 0,
                        transition: { delay: index * 0.1 }
                      },
                    }}
                  >
                    <span className="text-4xl">{tool.icon}</span>
                    <span className="text-xs text-gray-400">{tool.name}</span>
                  </motion.div>
                ))}
                
                <motion.div
                  variants={{
                    initial: { opacity: 0 },
                    animate: { opacity: 1 },
                  }}
                >
                  <motion.div
                    className="text-4xl text-blue-500"
                    animate={{ 
                      x: [0, 10, 0],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    →
                  </motion.div>
                </motion.div>

                <motion.div
                  className={`flex flex-col items-center gap-3 p-6 rounded-3xl shadow-[0_0_50px_rgba(59,130,246,0.6)]`}
                  style={{ backgroundColor: `${result.color}20`, borderColor: `${result.color}40` }}
                  variants={{
                    initial: { opacity: 0, scale: 0.8 },
                    animate: { 
                      opacity: 1, 
                      scale: 1,
                      transition: { delay: tools.length * 0.1 + 0.2 }
                    },
                  }}
                >
                  <span className="text-5xl">{result.icon}</span>
                  <span className="text-lg font-bold">{result.name}</span>
                </motion.div>
              </motion.div>

              <motion.div
                className="mt-12 text-gray-500 font-mono text-sm tracking-widest"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                LIMPIANDO EL RUIDO
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

interface ParticleFieldProps {
  count?: number
  className?: string
}

export function ParticleField({ count = 50, className = '' }: ParticleFieldProps) {
  const ref = useRef<HTMLDivElement>(null)
  
  return (
    <div ref={ref} className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-blue-500/30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 0.5, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  )
}

interface AnimatedGradientTextProps {
  text: string
  className?: string
  colors?: string[]
}

export function AnimatedGradientText({ text, className = '', colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#3b82f6'] }: AnimatedGradientTextProps) {
  return (
    <span
      className={`${className} bg-gradient-to-r bg-clip-text text-transparent animate-gradient`}
      style={{
        backgroundSize: '300% 100%',
        backgroundImage: `linear-gradient(90deg, ${colors.join(', ')})`,
      }}
    >
      {text}
    </span>
  )
}

interface ShimmerButtonProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function ShimmerButton({ children, className = '', onClick }: ShimmerButtonProps) {
  return (
    <motion.button
      className={`relative overflow-hidden rounded-full ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          style={{ width: '200%', left: '-100%' }}
          animate={{
            left: ['-100%', '100%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>
      {children}
    </motion.button>
  )
}
