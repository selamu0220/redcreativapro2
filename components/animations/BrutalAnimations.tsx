'use client';

import React, { ReactNode, useRef, useState } from 'react';
import { motion, useSpring, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';

// --- CONFIG ---
const SPRING_CONFIG = { type: "spring", stiffness: 400, damping: 25 };
const SLOW_SPRING = { type: "spring", stiffness: 200, damping: 20 };

// --- COMPONENTS ---

export const ExplodeIn = ({ children, delay = 0, duration = 0.5 }: { children: ReactNode, delay?: number, duration?: number }) => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0, filter: 'blur(10px)' }}
    animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
    exit={{ scale: 0.9, opacity: 0 }}
    transition={{
      delay,
      duration,
      type: "spring",
      stiffness: 260,
      damping: 20
    }}
  >
    {children}
  </motion.div>
);

export const BrutalSlide = ({
  children,
  direction = 'up',
  delay = 0,
  distance = 50,
  duration = 0.5
}: {
  children: ReactNode,
  direction?: 'up' | 'down' | 'left' | 'right',
  delay?: number,
  distance?: number,
  duration?: number
}) => {
  const initial = {
    opacity: 0,
    x: direction === 'left' ? distance : direction === 'right' ? -distance : 0,
    y: direction === 'up' ? distance : direction === 'down' ? -distance : 0,
  };

  return (
    <motion.div
      initial={initial}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{
        delay,
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
    >
      {children}
    </motion.div>
  );
};

export const GlitchText = ({ children, intensity = 0.5 }: { children: string, intensity?: number }) => {
  return (
    <motion.span
      className="relative inline-block overflow-hidden"
      whileHover={{
        textShadow: [
          "0px 0px 0px rgba(255,0,0,0)",
          "-2px 0px 0px rgba(255,0,0,0.5)",
          "2px 0px 0px rgba(0,0,255,0.5)",
          "0px 0px 0px rgba(255,0,0,0)"
        ]
      }}
    >
      {children}
    </motion.span>
  );
};

export const MagneticHover = ({ children, strength = 0.5 }: { children: ReactNode, strength?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, SPRING_CONFIG);
  const springY = useSpring(y, SPRING_CONFIG);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current!.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    // Calculate distance from center
    const dx = (clientX - centerX) * strength;
    const dy = (clientY - centerY) * strength;

    x.set(dx);
    y.set(dy);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className="inline-block"
    >
      {children}
    </motion.div>
  );
};

export const ScrollReveal = ({ children, direction = 'up', delay = 0 }: { children: ReactNode, direction?: string, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.6, ease: "easeOut", delay }}
  >
    {children}
  </motion.div>
);

export const BrutalParallax = ({ children, speed = 0.5 }: { children: ReactNode, speed?: number }) => {
  // Simplified parallax for now as it usually requires scroll context
  return (
    <motion.div whileHover={{ y: -5 }}>
      {children}
    </motion.div>
  )
}

export const BrutalTypewriter = ({ text, speed = 0.05 }: { text: string, speed?: number }) => {
  // Simple word-by-word reveal
  const words = text.split(" ");

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: speed, delayChildren: 0.04 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", damping: 12, stiffness: 100 },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: { type: "spring", damping: 12, stiffness: 100 },
    },
  };

  return (
    <motion.div
      style={{ overflow: "hidden", display: "flex", flexWrap: "wrap" }}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, index) => (
        <motion.span variants={child} style={{ marginRight: "5px" }} key={index}>
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};

export const PowerGlow = ({ children, color = 'blue', active = true }: { children: ReactNode, color?: 'blue' | 'green' | 'red' | 'purple', active?: boolean }) => {
  const colors = {
    blue: 'shadow-[0_0_20px_rgba(59,130,246,0.3)] border-blue-500/50',
    green: 'shadow-[0_0_20px_rgba(34,197,94,0.3)] border-green-500/50',
    red: 'shadow-[0_0_20px_rgba(239,68,68,0.3)] border-red-500/50',
    purple: 'shadow-[0_0_20px_rgba(168,85,247,0.3)] border-purple-500/50',
  };

  return (
    <motion.div
      className={`relative rounded-xl border transition-all duration-500 ${active ? colors[color] : 'border-transparent shadow-none'}`}
      initial={false}
      animate={active ? {
        scale: 1,
        opacity: 1
      } : {
        scale: 0.98,
        opacity: 0.8
      }}
    >
      <div className={`absolute inset-0 rounded-xl bg-${color}-500/5 blur-xl -z-10 transition-opacity duration-500 ${active ? 'opacity-100' : 'opacity-0'}`} />
      {children}
    </motion.div>
  );
};
