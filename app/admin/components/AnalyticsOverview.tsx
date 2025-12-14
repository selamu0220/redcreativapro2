'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { BarChart, Map, Activity, Globe } from 'lucide-react'

// Simple mock analytics since we don't have a DB for historical data yet
// In production, this would fetch from a real analytics endpoint
export function AnalyticsOverview() {
    const [stats, setStats] = useState({
        requests: 0,
        cacheHits: 0,
        avgLatency: 0,
        topCountries: [] as string[]
    })

    // Simulate fetching data
    useEffect(() => {
        // In a real app, fetch from API
        // const res = await fetch('/api/admin/stats')
        setStats({
            requests: 1250,
            cacheHits: 850,
            avgLatency: 120,
            topCountries: ['MX', 'CO', 'AR']
        })
    }, [])

    const cards = [
        {
            title: "Total Solicitudes",
            value: "1.2k", // stats.requests
            change: "+12%",
            icon: <Activity className="h-4 w-4 text-muted-foreground" />,
        },
        {
            title: "Cache Hits (Geo)",
            value: "68%", // stats.cacheHits / stats.requests
            change: "+4%",
            icon: <BarChart className="h-4 w-4 text-muted-foreground" />,
        },
        {
            title: "Latencia Promedio",
            value: "120ms",
            change: "-15ms",
            icon: <Globe className="h-4 w-4 text-muted-foreground" />,
        },
        {
            title: "Países Activos",
            value: "8",
            change: "+1",
            icon: <Map className="h-4 w-4 text-muted-foreground" />,
        },
    ]

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
                <Card key={card.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {card.title}
                        </CardTitle>
                        {card.icon}
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{card.value}</div>
                        <p className="text-xs text-muted-foreground">
                            {card.change} vs mes anterior
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
