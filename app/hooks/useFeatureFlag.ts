'use client'

import { useState, useEffect } from 'react'
import { featureFlags, FeatureFlag } from '@/app/lib/feature-flags'

/**
 * Hook to check feature flags in components
 */
export function useFeatureFlag(flag: FeatureFlag): boolean {
    const [isEnabled, setIsEnabled] = useState(featureFlags.isEnabled(flag))

    useEffect(() => {
        // In a real app, we might subscribe to flag changes here
        // For now, we just check on mount
        setIsEnabled(featureFlags.isEnabled(flag))
    }, [flag])

    return isEnabled
}

/**
 * Component to conditionally render content based on a feature flag
 */
export function FeatureGate({
    flag,
    children,
    fallback = null
}: {
    flag: FeatureFlag
    children: React.ReactNode
    fallback?: React.ReactNode
}) {
    const enabled = useFeatureFlag(flag)

    if (!enabled) {
        return <>{ fallback } </>
    }

    return <>{ children } </>
}
