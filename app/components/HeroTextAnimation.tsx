'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Sparkles, MousePointer2 } from 'lucide-react'
import { useThemeStyle, ThemeStyle } from '@/app/contexts/ThemeStyleContext'

const phrases = [
    "Escritor IA",
    "Redactor SEO",
    "Corrector Pro",
    "Estratega de Contenidos"
]

// Theme-specific styling
const themeTextStyles: Record<ThemeStyle, string> = {
    'minimal': 'font-sans font-bold text-foreground',
    'notebook': 'font-serif italic text-foreground',
    'neo-brutalism': 'font-mono font-black uppercase text-primary',
    'claude': 'font-serif font-semibold text-primary',
}

const themeSelectionBg: Record<ThemeStyle, string> = {
    'minimal': 'bg-primary/10',
    'notebook': 'bg-yellow-300/30',
    'neo-brutalism': 'bg-yellow-400/50 border-2 border-black',
    'claude': 'bg-orange-200/40',
}

const themeTooltipStyles: Record<ThemeStyle, string> = {
    'minimal': 'bg-foreground text-background',
    'notebook': 'bg-amber-900 text-amber-50',
    'neo-brutalism': 'bg-black text-yellow-400 border-2 border-yellow-400 font-bold',
    'claude': 'bg-orange-700 text-white',
}

const themeImprovedText: Record<ThemeStyle, string> = {
    'minimal': 'text-primary',
    'notebook': 'text-amber-700 dark:text-amber-500',
    'neo-brutalism': 'text-yellow-500',
    'claude': 'text-orange-600 dark:text-orange-400',
}

export interface HeroTextAnimationProps {
    phrases?: string[]
    className?: string
    textClassName?: string
    startDelay?: number
    type?: 'badge' | 'heading'
}

export default function HeroTextAnimation({
    phrases = [
        "Escritor IA",
        "Redactor SEO",
        "Corrector Pro",
        "Estratega de Contenidos"
    ],
    className,
    textClassName,
    startDelay = 2000,
    type = 'heading'
}: HeroTextAnimationProps) {
    const [mounted, setMounted] = useState(false)
    const [step, setStep] = useState<'idle' | 'selecting' | 'improving' | 'typing'>('idle')
    const [textIndex, setTextIndex] = useState(0)
    const { themeStyle } = useThemeStyle()

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (!mounted) return

        let timeout: NodeJS.Timeout

        const timeline = async () => {
            // Idle
            setStep('idle')
            timeout = setTimeout(async () => {
                // Start selecting
                setStep('selecting')
                timeout = setTimeout(async () => {
                    // Start improving
                    setStep('improving')
                    timeout = setTimeout(() => {
                        // Change text
                        setTextIndex(prev => (prev + 1) % phrases.length)
                        setStep('typing')
                    }, 800)
                }, 1000)
            }, startDelay)
        }

        timeline()

        return () => clearTimeout(timeout)
    }, [mounted, textIndex, startDelay, phrases.length])

    const currentText = phrases[textIndex]

    // Always render the same outer structure for SSR/hydration consistency
    return (
        <span className={cn("relative inline-flex items-center whitespace-nowrap", className)} suppressHydrationWarning>
            {!mounted ? (
                // Server/initial render: static text only
                <span className={cn("relative z-10 px-2", type === 'badge' ? "py-0" : "py-1", textClassName)}>
                    {phrases[0]}
                </span>
            ) : (
                <>
                    {/* Background Selection Layer */}
                    <span
                        className={cn(
                            "absolute inset-0 rounded-md transition-all duration-300",
                            themeSelectionBg[themeStyle],
                            step === 'selecting' || step === 'improving' ? "opacity-100" : "opacity-0"
                        )}
                    />

                    {/* Text Layer */}
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={textIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className={cn(
                                "relative z-10 px-2",
                                type === 'badge' ? "py-0" : "py-1",
                                themeTextStyles[themeStyle],
                                textIndex !== 0 && themeImprovedText[themeStyle],
                                textClassName
                            )}
                        >
                            {currentText}
                        </motion.span>
                    </AnimatePresence>

                    {/* Simulated Cursor */}
                    <motion.div
                        className="absolute z-50 pointer-events-none drop-shadow-md"
                        initial={{ x: "120%", y: "150%", opacity: 0 }}
                        animate={
                            step === 'idle' ? { x: "120%", y: "150%", opacity: 0 } :
                                step === 'selecting' ? { x: ["100%", "0%"], y: "50%", opacity: 1 } :
                                    step === 'improving' ? { x: "50%", y: "60%", opacity: 1 } :
                                        { x: "120%", y: "150%", opacity: 0 }
                        }
                        transition={
                            step === 'selecting' ? { duration: 0.8, ease: "easeInOut" } :
                                { duration: 0.5 }
                        }
                    >
                        <MousePointer2 className={cn(
                            "stroke-[1.5px]",
                            type === 'badge' ? "h-4 w-4" : "h-6 w-6",
                            themeStyle === 'neo-brutalism'
                                ? "fill-yellow-400 text-black"
                                : "fill-black text-white"
                        )} />

                        {/* Improvement Tooltip */}
                        <AnimatePresence>
                            {step === 'improving' && (
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    className={cn(
                                        "absolute top-6 left-4 px-2 py-1 rounded-md flex items-center gap-1 shadow-xl whitespace-nowrap",
                                        type === 'badge' ? "text-[8px]" : "text-[10px]",
                                        themeTooltipStyles[themeStyle]
                                    )}
                                >
                                    <Sparkles className={cn(
                                        themeStyle === 'neo-brutalism' ? "text-yellow-400" : "text-yellow-400",
                                        type === 'badge' ? "h-2 w-2" : "h-3 w-3"
                                    )} />
                                    <span>Mejorando...</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </>
            )}
        </span>
    )
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
