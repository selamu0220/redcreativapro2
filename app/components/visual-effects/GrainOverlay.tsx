'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'

// Check if mobile device
function isMobileDevice() {
    if (typeof window === 'undefined') return false
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.innerWidth < 768
}

export default function GrainOverlay() {
    const { theme, systemTheme } = useTheme()
    const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark')
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        setIsMobile(isMobileDevice())
    }, [])

    // Skip grain effect on mobile - saves GPU/battery and avoids rendering issues
    if (isMobile) return null

    return (
        <div
            className={cn(
                "fixed inset-0 pointer-events-none z-50 opacity-[0.03]",
                isDark ? "opacity-[0.05]" : "invert"
            )}
            style={{
                // Use inline SVG instead of external URL to avoid network issues
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
        />
    )
}
