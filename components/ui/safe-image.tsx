'use client'

import React, { useState } from 'react'
import Image, { ImageProps } from 'next/image'
import { ImageOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SafeImageProps extends ImageProps {
    fallbackSrc?: string
}

export function SafeImage({ src, alt, className, fallbackSrc, ...props }: SafeImageProps) {
    const [errorLevel, setErrorLevel] = useState(0) // 0: tried src, 1: tried fallback, 2: tried default

    // Default fallback image
    const defaultFallback = 'https://images.unsplash.com/photo-1499750310159-5b5f87e8e12b?auto=format&fit=crop&q=80'

    const handleError = () => {
        setErrorLevel(prev => prev + 1)
    }

    // 1. Try Original Source
    if (errorLevel === 0) {
        return (
            <Image
                src={src}
                alt={alt}
                className={className}
                {...props}
                onError={handleError}
            />
        )
    }

    // 2. Try Custom Fallback
    if (errorLevel === 1 && fallbackSrc) {
        return (
            <Image
                src={fallbackSrc}
                alt={alt || "Fallback image"}
                className={className}
                {...props}
                onError={handleError}
            />
        )
    }

    // 3. Try Default Fallback
    if (errorLevel <= 2 && defaultFallback) {
        return (
            <Image
                src={defaultFallback}
                alt={alt || "Default image"}
                className={className}
                {...props}
                onError={handleError}
            />
        )
    }

    // 4. Give up -> Show Placeholder
    return (
        <div className={cn("flex items-center justify-center bg-muted text-muted-foreground w-full h-full min-h-[200px]", className)}>
            <ImageOff className="h-8 w-8 opacity-50" />
        </div>
    )
}
