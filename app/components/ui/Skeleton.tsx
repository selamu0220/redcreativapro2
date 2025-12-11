'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  animation?: 'pulse' | 'wave' | 'none';
  lines?: number;
}

export function Skeleton({
  className,
  width,
  height,
  variant = 'rectangular',
  animation = 'pulse',
  lines = 1,
  ...props
}: SkeletonProps) {
  const baseClasses = 'bg-muted';
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-md',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-gradient-x bg-gradient-to-r from-muted via-muted-foreground/10 to-muted',
    none: '',
  };

  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('space-y-2', className)} {...props}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              baseClasses,
              variantClasses.text,
              animationClasses[animation],
              index === lines - 1 && 'w-3/4' // Last line is shorter
            )}
            style={index === lines - 1 ? { ...style, width: '75%' } : style}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={style}
      {...props}
    />
  );
}

// Specialized skeleton components for common use cases

export function SkeletonText({ 
  lines = 3, 
  className, 
  ...props 
}: Omit<SkeletonProps, 'variant'> & { lines?: number }) {
  return (
    <Skeleton
      variant="text"
      lines={lines}
      className={className}
      {...props}
    />
  );
}

export function SkeletonAvatar({ 
  size = 'md',
  className,
  ...props 
}: Omit<SkeletonProps, 'variant' | 'width' | 'height'> & { 
  size?: 'sm' | 'md' | 'lg' | 'xl' 
}) {
  const sizeMap = {
    sm: { width: 32, height: 32 },
    md: { width: 48, height: 48 },
    lg: { width: 64, height: 64 },
    xl: { width: 96, height: 96 },
  };

  const dimensions = sizeMap[size];

  return (
    <Skeleton
      variant="circular"
      width={dimensions.width}
      height={dimensions.height}
      className={className}
      {...props}
    />
  );
}

export function SkeletonCard({ 
  className,
  showAvatar = false,
  showTitle = true,
  showDescription = true,
  ...props 
}: Omit<SkeletonProps, 'variant'> & {
  showAvatar?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
}) {
  return (
    <div className={cn('p-4 space-y-4', className)} {...props}>
      {showAvatar && (
        <div className="flex items-center space-x-3">
          <SkeletonAvatar size="md" />
          <div className="space-y-2 flex-1">
            <Skeleton variant="text" width="60%" height={16} />
            <Skeleton variant="text" width="40%" height={14} />
          </div>
        </div>
      )}
      
      {showTitle && (
        <Skeleton variant="text" width="80%" height={20} />
      )}
      
      {showDescription && (
        <SkeletonText lines={3} />
      )}
    </div>
  );
}

export function SkeletonButton({ 
  className,
  size = 'md',
  ...props 
}: Omit<SkeletonProps, 'variant'> & { 
  size?: 'sm' | 'md' | 'lg' 
}) {
  const sizeMap = {
    sm: { width: 80, height: 32 },
    md: { width: 120, height: 40 },
    lg: { width: 160, height: 48 },
  };

  const dimensions = sizeMap[size];

  return (
    <Skeleton
      variant="rounded"
      width={dimensions.width}
      height={dimensions.height}
      className={className}
      {...props}
    />
  );
}

export function SkeletonTable({ 
  rows = 5,
  columns = 4,
  className,
  ...props 
}: Omit<SkeletonProps, 'variant'> & {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className={cn('space-y-3', className)} {...props}>
      {/* Header */}
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton
            key={`header-${index}`}
            variant="text"
            width="100%"
            height={16}
            className="flex-1"
          />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={`cell-${rowIndex}-${colIndex}`}
              variant="text"
              width="100%"
              height={14}
              className="flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// Layout skeleton for preventing CLS during page loads
export function SkeletonLayout({ 
  className,
  showHeader = true,
  showSidebar = false,
  showFooter = true,
  ...props 
}: Omit<SkeletonProps, 'variant'> & {
  showHeader?: boolean;
  showSidebar?: boolean;
  showFooter?: boolean;
}) {
  return (
    <div className={cn('min-h-screen flex flex-col', className)} {...props}>
      {/* Header */}
      {showHeader && (
        <div className="h-16 border-b p-4 flex items-center justify-between">
          <Skeleton width={120} height={32} variant="rounded" />
          <div className="flex space-x-2">
            <Skeleton width={80} height={32} variant="rounded" />
            <Skeleton width={32} height={32} variant="circular" />
          </div>
        </div>
      )}

      <div className="flex flex-1">
        {/* Sidebar */}
        {showSidebar && (
          <div className="w-64 border-r p-4 space-y-4">
            <Skeleton width="100%" height={20} variant="text" />
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton
                  key={index}
                  width="100%"
                  height={36}
                  variant="rounded"
                />
              ))}
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 p-6 space-y-6">
          <Skeleton width="60%" height={32} variant="text" />
          <SkeletonCard showAvatar showTitle showDescription />
          <SkeletonCard showTitle showDescription />
          <SkeletonTable rows={4} columns={3} />
        </div>
      </div>

      {/* Footer */}
      {showFooter && (
        <div className="h-20 border-t p-4 flex items-center justify-center">
          <Skeleton width={200} height={16} variant="text" />
        </div>
      )}
    </div>
  );
}

export default Skeleton;