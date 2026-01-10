import { useEffect, RefObject } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Custom hook for GSAP scroll-triggered fade-in animations
 * @param ref - React ref to the element to animate
 * @param options - Animation configuration
 */
export function useScrollAnimation(
    ref: RefObject<HTMLElement>,
    options: {
        y?: number
        x?: number
        opacity?: number
        duration?: number
        delay?: number
        stagger?: number
        start?: string
        end?: string
        scrub?: boolean | number
    } = {}
) {
    useEffect(() => {
        if (!ref.current) return

        const {
            y = 30,
            x = 0,
            opacity = 0,
            duration = 0.8,
            delay = 0,
            start = 'top 85%',
            scrub = false,
        } = options

        const ctx = gsap.context(() => {
            gsap.fromTo(
                ref.current,
                { opacity, y, x },
                {
                    opacity: 1,
                    y: 0,
                    x: 0,
                    duration,
                    delay,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: ref.current,
                        start,
                        scrub: scrub ? 1 : false,
                    },
                }
            )
        })

        return () => ctx.revert()
    }, [ref, options.y, options.x, options.opacity, options.duration, options.delay, options.start, options.scrub])
}

/**
 * Custom hook for GSAP stagger animations (multiple elements)
 * @param selector - CSS selector for elements to animate
 * @param containerRef - Parent container ref
 * @param options - Animation configuration
 */
export function useStaggerAnimation(
    selector: string,
    containerRef: RefObject<HTMLElement>,
    options: {
        y?: number
        opacity?: number
        duration?: number
        stagger?: number
        start?: string
    } = {}
) {
    useEffect(() => {
        if (!containerRef.current) return

        const {
            y = 20,
            opacity = 0,
            duration = 0.7,
            stagger = 0.15,
            start = 'top 85%',
        } = options

        const elements = containerRef.current.querySelectorAll(selector)
        if (!elements.length) return

        const ctx = gsap.context(() => {
            gsap.fromTo(
                elements,
                { opacity, y },
                {
                    opacity: 1,
                    y: 0,
                    duration,
                    stagger,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start,
                    },
                }
            )
        })

        return () => ctx.revert()
    }, [selector, containerRef, options.y, options.opacity, options.duration, options.stagger, options.start])
}

/**
 * Custom hook for hero entrance animations
 * @param containerRef - Hero section container ref
 */
export function useHeroAnimation(containerRef: RefObject<HTMLElement>) {
    useEffect(() => {
        if (!containerRef.current) return

        const elements = containerRef.current.querySelectorAll('.hero-animate')
        if (!elements.length) return

        const ctx = gsap.context(() => {
            gsap.fromTo(
                elements,
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    stagger: 0.15,
                    ease: 'power3.out',
                }
            )
        })

        return () => ctx.revert()
    }, [containerRef])
}
