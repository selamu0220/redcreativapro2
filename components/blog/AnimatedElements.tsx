'use client'
import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Sparkles, Zap, Star, ArrowRight, CheckCircle, AlertCircle, Info, Lightbulb } from 'lucide-react'
// Botón animado optimizado para rendimiento
export function AnimatedButton({ 
  children, 
  onClick, 
  className = '',
  variant = 'primary' 
}: {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  variant?: 'primary' | 'secondary' | 'success' | 'warning'
}) {
  const variants = {
    primary: 'from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700',
    secondary: 'from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800',
    success: 'from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
    warning: 'from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700'
  }
  return (
    <motion.button
      onClick={onClick}
      className={`relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${variants[variant]} text-white font-semibold rounded-xl overflow-hidden group ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      style={{ willChange: 'transform' }}
    >
      <span className="relative z-10">{children}</span>
      <ArrowRight className="w-4 h-4 relative z-10" />
    </motion.button>
  )
}
// Card animada optimizada
export function AnimatedCard({ 
  children, 
  className = '',
  delay = 0,
  hover = true 
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  hover?: boolean
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  return (
    <motion.div
      ref={ref}
      className={`relative p-6 bg-gradient-to-br from-zinc-900/50 to-zinc-800/30 backdrop-blur-sm rounded-2xl border border-zinc-700/50 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.3, delay }}
      whileHover={hover ? { 
        y: -2,
        transition: { duration: 0.15 }
      } : {}}
      style={{ willChange: 'transform' }}
    >
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}
// Icono animado optimizado
export function AnimatedIcon({ 
  icon: Icon, 
  className = '',
  animation = 'bounce',
  color = 'blue'
}: {
  icon: any
  className?: string
  animation?: 'bounce' | 'rotate' | 'pulse' | 'shake'
  color?: 'blue' | 'purple' | 'green' | 'yellow' | 'red'
}) {
  const colors = {
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    green: 'text-green-400',
    yellow: 'text-yellow-400',
    red: 'text-red-400'
  }
  const animations = {
    bounce: {
      y: [0, -5, 0],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" as const, repeatDelay: 2 }
    },
    rotate: {
      rotate: 360,
      transition: { duration: 4, repeat: Infinity, ease: "linear" as const }
    },
    pulse: {
      scale: [1, 1.1, 1],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" as const, repeatDelay: 1 }
    },
    shake: {
      x: [0, -1, 1, 0],
      transition: { duration: 0.3, repeat: Infinity, repeatDelay: 4 }
    }
  }
  return (
    <motion.div
      className={`inline-flex items-center justify-center ${colors[color]} ${className}`}
      animate={animations[animation]}
      style={{ willChange: 'transform' }}
    >
      <Icon className="w-6 h-6" />
    </motion.div>
  )
}
// Callout animado optimizado
export function AnimatedCallout({ 
  type = 'info',
  title,
  children,
  className = ''
}: {
  type?: 'info' | 'warning' | 'success' | 'error'
  title?: string
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-30px" })
  const types = {
    info: {
      icon: Info,
      colors: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
      iconColor: 'text-blue-400'
    },
    warning: {
      icon: AlertCircle,
      colors: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30',
      iconColor: 'text-yellow-400'
    },
    success: {
      icon: CheckCircle,
      colors: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
      iconColor: 'text-green-400'
    },
    error: {
      icon: AlertCircle,
      colors: 'from-red-500/20 to-pink-500/20 border-red-500/30',
      iconColor: 'text-red-400'
    }
  }
  const config = types[type]
  const Icon = config.icon
  return (
    <motion.div
      ref={ref}
      className={`relative p-6 bg-gradient-to-br ${config.colors} backdrop-blur-sm rounded-2xl border ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      style={{ willChange: 'transform' }}
    >
      <div className="flex items-start gap-4 relative z-10">
        <Icon className={`w-6 h-6 ${config.iconColor} flex-shrink-0`} />
        
        <div className="flex-1">
          {title && (
            <motion.h4 
              className="font-semibold mb-2 text-white"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              {title}
            </motion.h4>
          )}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.2, delay: 0.15 }}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
// Lista animada optimizada
export function AnimatedList({ 
  items,
  className = ''
}: {
  items: string[]
  className?: string
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  return (
    <motion.ul
      ref={ref}
      className={`space-y-3 ${className}`}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.05
          }
        }
      }}
    >
      {items.map((item, index) => (
        <motion.li
          key={index}
          className="flex items-start gap-3 group"
          variants={{
            hidden: { opacity: 0, x: -10 },
            visible: { opacity: 1, x: 0 }
          }}
          style={{ willChange: 'transform' }}
        >
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
          <span className="text-zinc-300 group-hover:text-white transition-colors">
            {item}
          </span>
        </motion.li>
      ))}
    </motion.ul>
  )
}