'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useTheme } from 'next-themes'

// Check if mobile device
function isMobileDevice() {
    if (typeof window === 'undefined') return false
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.innerWidth < 768
}

export default function ThreeBackground() {
    const containerRef = useRef<HTMLDivElement>(null)
    const sceneRef = useRef<THREE.Scene | null>(null)
    const blobRef = useRef<THREE.Mesh | null>(null)
    const starsRef = useRef<THREE.Points | null>(null)
    const { theme, systemTheme } = useTheme()
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
    const frameIdRef = useRef<number>(0)
    const [isMobile, setIsMobile] = useState(false)

    // Determine if dark mode is active
    const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

    // Check for mobile on mount
    useEffect(() => {
        setIsMobile(isMobileDevice())
    }, [])

    useEffect(() => {
        // Skip on mobile to avoid WebGL crashes
        if (isMobile || !containerRef.current) return

        try {
            // Setup
            const scene = new THREE.Scene()
            sceneRef.current = scene

            // Initial Fog
            // Default to dark if theme is undefined on first render to avoid flash
            const initialIsDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark') || true
            scene.fog = new THREE.FogExp2(initialIsDark ? 0x000000 : 0xffffff, 0.002)

            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
            camera.position.z = 25

            const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
            renderer.setSize(window.innerWidth, window.innerHeight)
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
            containerRef.current.appendChild(renderer.domElement)
            rendererRef.current = renderer

            // Objects
            const geometry = new THREE.IcosahedronGeometry(8, 2)
            const material = new THREE.MeshBasicMaterial({
                color: initialIsDark ? 0xffffff : 0x000000,
                wireframe: true,
                transparent: true,
                opacity: initialIsDark ? 0.08 : 0.05
            })
            const blob = new THREE.Mesh(geometry, material)
            blobRef.current = blob
            scene.add(blob)

            // Particles
            const pGeo = new THREE.BufferGeometry()
            const pCount = 800
            const pPos = new Float32Array(pCount * 3)
            for (let i = 0; i < pCount * 3; i++) {
                pPos[i] = (Math.random() - 0.5) * 80
            }
            pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
            const pMat = new THREE.PointsMaterial({
                size: 0.05,
                color: initialIsDark ? 0xffffff : 0x000000
            })
            const stars = new THREE.Points(pGeo, pMat)
            starsRef.current = stars
            scene.add(stars)

            // Animation vars
            const originalPositions = (geometry.attributes.position.array as Float32Array).slice()
            const clock = new THREE.Clock()
            let mouseX = 0
            let mouseY = 0

            const handleMouseMove = (e: MouseEvent) => {
                mouseX = (e.clientX / window.innerWidth) * 2 - 1
                mouseY = -(e.clientY / window.innerHeight) * 2 + 1
            }
            window.addEventListener('mousemove', handleMouseMove)

            const animate = () => {
                frameIdRef.current = requestAnimationFrame(animate)
                const time = clock.getElapsedTime()

                if (blobRef.current) {
                    // Rotation
                    blobRef.current.rotation.y += 0.002
                    blobRef.current.rotation.z += 0.001

                    // Mouse influence
                    blobRef.current.rotation.x += (mouseY * 0.5 - blobRef.current.rotation.x) * 0.05
                    blobRef.current.rotation.y += (mouseX * 0.5 - blobRef.current.rotation.y) * 0.05

                    // Noise/Pulse
                    const positions = blobRef.current.geometry.attributes.position.array as Float32Array
                    for (let i = 0; i < positions.length; i += 3) {
                        const ox = originalPositions[i]
                        const oy = originalPositions[i + 1]
                        const oz = originalPositions[i + 2]

                        const noise = Math.sin(ox * 0.2 + time) * Math.cos(oy * 0.3 + time)
                        const scale = 1 + noise * 0.2

                        positions[i] = ox * scale
                        positions[i + 1] = oy * scale
                        positions[i + 2] = oz * scale
                    }
                    blobRef.current.geometry.attributes.position.needsUpdate = true
                }

                if (starsRef.current) {
                    starsRef.current.rotation.y -= 0.0005
                }

                if (rendererRef.current && sceneRef.current) {
                    rendererRef.current.render(sceneRef.current, camera)
                }
            }
            animate()

            const handleResize = () => {
                const width = window.innerWidth
                const height = window.innerHeight
                if (rendererRef.current) {
                    rendererRef.current.setSize(width, height)
                }
                camera.aspect = width / height
                camera.updateProjectionMatrix()
            }
            window.addEventListener('resize', handleResize)

            return () => {
                window.removeEventListener('mousemove', handleMouseMove)
                window.removeEventListener('resize', handleResize)
                if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current)
                if (containerRef.current && rendererRef.current) {
                    containerRef.current.removeChild(rendererRef.current.domElement)
                }
                geometry.dispose()
                material.dispose()
                pGeo.dispose()
                pMat.dispose()
            }
        } catch (error) {
            console.warn('ThreeBackground: WebGL initialization failed', error)
            return
        }
    }, [isMobile]) // Run once on mount, skip on mobile

    // React to theme changes
    useEffect(() => {
        if (isMobile) return

        // Current isDark calculation
        // Note: Inside this effect we use the potentially updated 'theme' value
        const currentIsDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark')

        if (sceneRef.current && sceneRef.current.fog) {
            // @ts-ignore
            sceneRef.current.fog.color.setHex(currentIsDark ? 0x000000 : 0xffffff)
        }
        if (blobRef.current) {
            // @ts-ignore
            blobRef.current.material.color.setHex(currentIsDark ? 0xffffff : 0x000000)
            // @ts-ignore
            blobRef.current.material.opacity = currentIsDark ? 0.08 : 0.05
        }
        if (starsRef.current) {
            // @ts-ignore
            starsRef.current.material.color.setHex(currentIsDark ? 0xffffff : 0x000000)
        }
    }, [theme, systemTheme, isMobile])

    // Don't render on mobile
    if (isMobile) return null

    return <div ref={containerRef} className="fixed top-0 left-0 w-full h-screen -z-10 pointer-events-none transition-opacity duration-1000" />
}

