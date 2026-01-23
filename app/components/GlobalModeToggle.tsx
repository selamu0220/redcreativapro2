'use client'

import React, { useState, useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { enableThemeTransition } from '@/lib/utils'
import { usePathname } from 'next/navigation'

export function GlobalModeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const pathname = usePathname()

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <button
            onClick={() => {
                enableThemeTransition()
                setTheme(resolvedTheme === 'light' ? 'dark' : 'light')
            }}
            className="fixed bottom-4 right-4 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-background/80 backdrop-blur-md border border-border shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 group"
            aria-label={resolvedTheme === 'light' ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
            title={resolvedTheme === 'light' ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
        >
            {resolvedTheme === 'light' ? (
                <Moon className="w-5 h-5 text-foreground group-hover:text-blue-600 transition-colors" />
            ) : (
                <Sun className="w-5 h-5 text-foreground group-hover:text-amber-500 transition-colors" />
            )}
        </button>
    )
}

export default GlobalModeToggle
