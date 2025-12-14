'use client'

import dynamic from 'next/dynamic'
import React, { Suspense } from 'react'

export const LazyCurrencyConverter = dynamic(() =>
    import('./CurrencyConverter').then(mod => mod.CurrencyConverter),
    {
        loading: () => <div className="w-full max-w-md h-[400px] bg-gray-100 rounded-xl animate-pulse" />,
        ssr: false
    }
)

export const LazyCurrencyComparisonTable = dynamic(() =>
    import('./CurrencyComparisonTable').then(mod => mod.CurrencyComparisonTable),
    {
        loading: () => <div className="w-full h-[300px] bg-gray-100 rounded-xl animate-pulse" />,
        ssr: false
    }
)

export const LazyPricingCalculator = dynamic(() =>
    import('./PricingCalculator').then(mod => mod.PricingCalculator),
    {
        loading: () => <div className="w-full h-[350px] bg-gray-100 rounded-xl animate-pulse" />,
        ssr: false
    }
)
