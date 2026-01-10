'use client'

import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'

export default function GrainOverlay() {
    const { theme, systemTheme } = useTheme()
    const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark')

    return (
        <div
            className={cn(
                "fixed inset-0 pointer-events-none z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]",
                isDark ? "opacity-[0.05]" : "invert"
            )}
        />
    )
}
