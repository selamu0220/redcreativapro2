'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface SafeImageProps extends ImageProps {
    fallbackSrc?: string;
}

export default function SafeImage({ src, fallbackSrc = '/images/placeholder.jpg', className, alt, ...props }: SafeImageProps) {
    const [error, setError] = useState(false);

    return (
        <Image
            src={error ? fallbackSrc : src}
            alt={alt}
            className={cn(className)}
            onError={() => setError(true)}
            {...props}
        />
    );
}
