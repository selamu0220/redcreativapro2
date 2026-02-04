'use client'

import React, { useState, useEffect } from 'react'
import Image, { ImageProps } from 'next/image'
import { cn } from '@/lib/utils'

interface OptimizedImageProps extends ImageProps {
  lowBandwidthQuality?: number
  highBandwidthQuality?: number
}

/**
 * Optimized Image Component
 * Automatically adjusts quality based on network conditions if available
 */
export function OptimizedImage({
  className,
  quality,
  lowBandwidthQuality = 60,
  highBandwidthQuality = 85,
  ...props
}: OptimizedImageProps) {
  const [effectiveQuality, setEffectiveQuality] = useState<number | undefined>(
    typeof quality === 'number' ? quality : undefined
  )
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for Network Information API support
    // @ts-ignore - Navigator types might not include connection yet
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection

    if (connection) {
      // If user is on slow connection (save-data or 2g/3g)
      if (connection.saveData || connection.effectiveType === '2g' || connection.effectiveType === '3g') {
        setEffectiveQuality(lowBandwidthQuality)
      } else {
        setEffectiveQuality(highBandwidthQuality)
      }
    }
  }, [lowBandwidthQuality, highBandwidthQuality])

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <Image
        {...props}
        quality={effectiveQuality}
        className={cn(
          'duration-700 ease-in-out',
          isLoading ? 'scale-110 blur-2xl grayscale' : 'scale-100 blur-0 grayscale-0',
          className
        )}
        onLoad={(e) => {
          setIsLoading(false)
          if (props.onLoad) props.onLoad(e)
        }}
      />
    </div>
  )
}
