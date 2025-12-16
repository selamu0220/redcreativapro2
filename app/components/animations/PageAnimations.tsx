'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

export const AnimatedPageWrapper = ({ children }: { children: ReactNode }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    {children}
  </motion.div>
)

export const AnimatedHeroSection = ({ children }: { children: ReactNode }) => (
  <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
    {children}
  </motion.div>
)

export const AnimatedTitle = ({ children }: { children: ReactNode }) => (
  <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
    {children}
  </motion.h1>
)

export const AnimatedSubtitle = ({ children }: { children: ReactNode }) => (
  <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
    {children}
  </motion.div>
)

export const AnimatedFormSection = ({ children }: { children: ReactNode }) => (
  <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
    {children}
  </motion.div>
)

export const AnimatedTextArea = ({ children }: { children: ReactNode }) => (
  <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3 }}>
    {children}
  </motion.div>
)

export const AnimatedGenerateButton = ({ children }: { children: ReactNode }) => (
  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
    {children}
  </motion.div>
)

export const AnimatedResult = ({ children }: { children: ReactNode }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
    {children}
  </motion.div>
)

export const AnimatedList = ({ children }: { children: ReactNode }) => (
  <motion.div initial="hidden" animate="visible" variants={{
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }}>
    {children}
  </motion.div>
)

export const AnimatedListItem = ({ children }: { children: ReactNode }) => (
  <motion.div variants={{
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  }}>
    {children}
  </motion.div>
)

export const AnimatedDashboardCard = ({ children }: { children: ReactNode }) => (
  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }}>
    {children}
  </motion.div>
)

export const AnimatedGreeting = ({ children }: { children: ReactNode }) => (
  <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
    {children}
  </motion.div>
)

export const AnimatedBadge = ({ children }: { children: ReactNode }) => (
  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
    {children}
  </motion.div>
)
