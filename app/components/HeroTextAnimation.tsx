'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Sparkles, MousePointer2 } from 'lucide-react'

const phrases = [
    "Escritor IA",
    "Redactor SEO",
    "Corrector Pro",
    "Estratega de Contenidos"
]

export default function HeroTextAnimation() {
    const [mounted, setMounted] = useState(false)
    const [step, setStep] = useState<'idle' | 'selecting' | 'improving' | 'typing'>('idle')
    const [textIndex, setTextIndex] = useState(0)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (!mounted) return

        let timeout: NodeJS.Timeout

        const sequence = async () => {
            // 0. Idle
            setStep('idle')
            await wait(2000)

            // 1. Selecting
            setStep('selecting')
            await wait(1000)

            // 2. Improving
            setStep('improving')
            await wait(800)

            // 3. Change Text & Typing
            setTextIndex((prev) => (prev + 1) % phrases.length)
            setStep('typing')

            await wait(100)
            setStep('idle')
        }

        const runLoop = async () => {
            while (true) {
                await sequence()
            }
        }

        // Using a simpler recursive timeout approach might be safer than async loop for cleanup
        // But for now, let's just trigger the sequence once per index change? 
        // No, better to have a self-driving loop controlled by a ref or just simple timeouts.

        // Let's use a chain of timeouts for simplicity and stability
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
                        // Loop continues as effect re-runs on textIndex change? 
                        // No, we want continuous loop. 
                    }, 800)
                }, 1000)
            }, 2000)
        }

        timeline()

        return () => clearTimeout(timeout)
    }, [mounted, textIndex])

    if (!mounted) {
        // Server-side / Initial render: just show the first phrase static
        return (
            <span className="gradient-text-animated italic font-serif">
                {phrases[0]}
            </span>
        )
    }

    const currentText = phrases[textIndex]

    return (
        <span className="relative inline-flex items-center whitespace-nowrap">
            {/* Background Selection Layer */}
            <span
                className={cn(
                    "absolute inset-0 bg-blue-500/20 rounded-md transition-opacity duration-300",
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
                        "relative z-10 px-1 gradient-text-animated italic font-serif",
                        textIndex === 0 ? "" : "text-green-600 dark:text-green-400"
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
                <MousePointer2 className="h-6 w-6 fill-black text-white stroke-[1.5px]" />

                {/* Improvement Tooltip */}
                <AnimatePresence>
                    {step === 'improving' && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="absolute top-6 left-4 bg-black text-white text-[10px] px-2 py-1 rounded-md flex items-center gap-1 shadow-xl whitespace-nowrap"
                        >
                            <Sparkles className="h-3 w-3 text-yellow-400" />
                            <span>Mejorando...</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </span>
    )
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
