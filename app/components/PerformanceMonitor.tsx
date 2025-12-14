'use client'

import React, { useEffect, useState } from 'react'

export function PerformanceMonitor() {
    const [metrics, setMetrics] = useState<Record<string, number>>({})

    useEffect(() => {
        if (typeof window === 'undefined') return

        // Simple performance observer
        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                setMetrics(prev => ({
                    ...prev,
                    [entry.name]: entry.startTime
                }))
                console.log(`[Perf] ${entry.name}: ${entry.startTime.toFixed(2)}ms`)
            })
        })

        try {
            observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift'] })
        } catch (e) {
            console.warn('PerformanceObserver not fully supported')
        }

        return () => observer.disconnect()
    }, [])

    if (process.env.NODE_ENV !== 'development') return null

    return (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded text-xs font-mono z-50 pointer-events-none">
            <div className="font-bold mb-2">Web Vitals</div>
            {Object.entries(metrics).map(([key, value]) => (
                <div key={key} className="flex justify-between gap-4">
                    <span>{key}</span>
                    <span>{value.toFixed(2)}ms</span>
                </div>
            ))}
        </div>
    )
}
