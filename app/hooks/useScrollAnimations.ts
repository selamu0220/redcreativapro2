import { useEffect, RefObject } from 'react'

let gsapInstance: any = null
let ScrollTriggerInstance: any = null
let initialized = false

async function initGsap() {
    if (initialized && gsapInstance) return gsapInstance
    
    if (typeof window === 'undefined') return null
    
    try {
        const gsapModule = await import('gsap')
        const scrollTriggerModule = await import('gsap/ScrollTrigger')
        
        gsapInstance = gsapModule.gsap
        ScrollTriggerInstance = scrollTriggerModule.ScrollTrigger
        
        if (gsapInstance && ScrollTriggerInstance && !initialized) {
            gsapInstance.registerPlugin(ScrollTriggerInstance)
            initialized = true
        }
        
        return gsapInstance
    } catch (error) {
        console.warn('GSAP initialization failed:', error)
        return null
    }
}

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
        
        let ctx: any = null
        
        const setup = async () => {
            const gsap = await initGsap()
            if (!gsap || !ref.current) return
            
            const {
                y = 30,
                x = 0,
                opacity = 0,
                duration = 0.8,
                delay = 0,
                start = 'top 85%',
                scrub = false,
            } = options

            ctx = gsap.context(() => {
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
        }
        
        setup()

        return () => {
            if (ctx) ctx.revert()
        }
    }, [ref, options.y, options.x, options.opacity, options.duration, options.delay, options.start, options.scrub])
}

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
        
        let ctx: any = null
        
        const setup = async () => {
            const gsap = await initGsap()
            if (!gsap || !containerRef.current) return

            const {
                y = 20,
                opacity = 0,
                duration = 0.7,
                stagger = 0.15,
                start = 'top 85%',
            } = options

            const elements = containerRef.current.querySelectorAll(selector)
            if (!elements.length) return

            ctx = gsap.context(() => {
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
        }
        
        setup()

        return () => {
            if (ctx) ctx.revert()
        }
    }, [selector, containerRef, options.y, options.opacity, options.duration, options.stagger, options.start])
}

export function useHeroAnimation(containerRef: RefObject<HTMLElement>) {
    useEffect(() => {
        if (!containerRef.current) return
        
        let ctx: any = null
        
        const setup = async () => {
            const gsap = await initGsap()
            if (!gsap || !containerRef.current) return

            const elements = containerRef.current.querySelectorAll('.hero-animate')
            if (!elements.length) return

            ctx = gsap.context(() => {
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
        }
        
        setup()

        return () => {
            if (ctx) ctx.revert()
        }
    }, [containerRef])
}
