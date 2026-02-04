'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
  fill?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  style?: React.CSSProperties;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
  fill = false,
  sizes,
  quality = 85,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
  style,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority); // If priority, load immediately
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  // Calculate aspect ratio for container
  const aspectRatio = width / height;

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Generate responsive sizes if not provided
  const responsiveSizes = sizes || `
    (max-width: 640px) 100vw,
    (max-width: 1024px) 50vw,
    33vw
  `;

  // Container styles to prevent layout shift
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: fill ? '100%' : width,
    height: fill ? '100%' : height,
    aspectRatio: fill ? undefined : aspectRatio,
    overflow: 'hidden',
    ...style,
  };

  // Skeleton/placeholder styles
  const skeletonStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'hsl(var(--muted))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.3s ease-in-out',
    opacity: isLoaded ? 0 : 1,
    pointerEvents: 'none',
  };

  return (
    <div
      ref={imgRef}
      className={cn('relative', className)}
      style={containerStyle}
      {...props}
    >
      {/* Skeleton/Placeholder */}
      <div style={skeletonStyle}>
        {hasError ? (
          <div className="text-muted-foreground text-sm text-center p-4">
            <svg
              className="w-8 h-8 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <div>Error loading image</div>
          </div>
        ) : (
          <div className="animate-pulse">
            <div className="bg-muted-foreground/20 w-full h-full rounded" />
          </div>
        )}
      </div>

      {/* Actual Image */}
      {(isInView || priority) && !hasError && (
        <Image
          src={src}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          sizes={responsiveSizes}
          quality={quality}
          priority={priority}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          style={{
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
      )}
    </div>
  );
}

// Utility function to generate blur data URL for placeholder
export function generateBlurDataURL(width: number = 10, height: number = 10): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  // Create a simple gradient blur effect
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#f3f4f6');
  gradient.addColorStop(1, '#e5e7eb');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL();
}

// Hook for responsive image sizes
export function useResponsiveImageSizes(breakpoints?: {
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
}) {
  const defaultBreakpoints = {
    sm: '100vw',
    md: '50vw',
    lg: '33vw',
    xl: '25vw',
    ...breakpoints,
  };

  return `
    (max-width: 640px) ${defaultBreakpoints.sm},
    (max-width: 768px) ${defaultBreakpoints.md},
    (max-width: 1024px) ${defaultBreakpoints.lg},
    ${defaultBreakpoints.xl}
  `;
}

// Component for hero images with optimized loading
interface HeroImageProps extends Omit<OptimizedImageProps, 'priority'> {
  preload?: boolean;
}

export function HeroImage({ preload = true, ...props }: HeroImageProps) {
  return (
    <OptimizedImage
      {...props}
      priority={preload}
      sizes="100vw"
      className={cn('w-full h-full', props.className)}
    />
  );
}

// Component for avatar/profile images
interface AvatarImageProps extends Omit<OptimizedImageProps, 'width' | 'height'> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function AvatarImage({ size = 'md', ...props }: AvatarImageProps) {
  const sizeMap = {
    sm: { width: 32, height: 32 },
    md: { width: 48, height: 48 },
    lg: { width: 64, height: 64 },
    xl: { width: 96, height: 96 },
  };

  const dimensions = sizeMap[size];

  return (
    <OptimizedImage
      {...props}
      {...dimensions}
      className={cn('rounded-full', props.className)}
      sizes={`${dimensions.width}px`}
    />
  );
}
