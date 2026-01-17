'use client'

import { useEffect, useState } from 'react'
import Lenis from '@studio-freight/lenis'

// Check if mobile device - Lenis can cause issues on mobile
function isMobileDevice() {
    if (typeof window === 'undefined') return false
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.innerWidth < 768
}

export default function SmoothScroll() {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        setIsMobile(isMobileDevice())
    }, [])

    useEffect(() => {
        // Skip Lenis on mobile - native scroll is better for touch devices
        if (isMobile) return

        try {
            const lenis = new Lenis({
                duration: 1.2,
                easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                orientation: 'vertical',
                gestureOrientation: 'vertical',
                smoothWheel: true,
                touchMultiplier: 2,
            })

            function raf(time: number) {
                lenis.raf(time)
                requestAnimationFrame(raf)
            }

            requestAnimationFrame(raf)

            return () => {
                lenis.destroy()
            }
        } catch (error) {
            console.warn('SmoothScroll: Lenis initialization failed', error)
            return
        }
    }, [isMobile])

    return null
}
