'use client'

import { Crown, Star, Zap } from 'lucide-react'
import { usePremiumTheme } from '@/app/hooks/useSubscription'

interface PremiumBadgeProps {
  variant?: 'crown' | 'star' | 'zap' | 'text'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showOnlyForPremium?: boolean
  text?: string
}

export default function PremiumBadge({ 
  variant = 'crown', 
  size = 'md', 
  className = '',
  showOnlyForPremium = true,
  text = 'Premium'
}: PremiumBadgeProps) {
  const { isPremium } = usePremiumTheme()
  
  // If showOnlyForPremium is true and user is not premium, don't render
  if (showOnlyForPremium && !isPremium) {
    return null
  }
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  }
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }
  
  const getIcon = () => {
    const iconClass = `${iconSizes[size]} mr-1`
    
    switch (variant) {
      case 'crown':
        return <Crown className={iconClass} />
      case 'star':
        return <Star className={iconClass} />
      case 'zap':
        return <Zap className={iconClass} />
      default:
        return null
    }
  }
  
  const baseClasses = `
    inline-flex items-center justify-center
    font-semibold rounded-full
    transition-all duration-300
    ${sizeClasses[size]}
  `
  
  const premiumClasses = isPremium 
    ? 'premium-badge premium-pulse'
    : 'bg-gray-200 text-gray-600'
  
  return (
    <span className={`${baseClasses} ${premiumClasses} ${className}`}>
      {variant !== 'text' && getIcon()}
      {text}
    </span>
  )
}

// Specialized premium badges for common use cases
export function PremiumCrownBadge({ className = '', size = 'md' }: { className?: string, size?: 'sm' | 'md' | 'lg' }) {
  return (
    <PremiumBadge 
      variant="crown" 
      size={size}
      className={className}
      text="Premium"
    />
  )
}

export function PremiumStarBadge({ className = '', size = 'md' }: { className?: string, size?: 'sm' | 'md' | 'lg' }) {
  return (
    <PremiumBadge 
      variant="star" 
      size={size}
      className={className}
      text="Pro"
    />
  )
}

export function PremiumZapBadge({ className = '', size = 'md' }: { className?: string, size?: 'sm' | 'md' | 'lg' }) {
  return (
    <PremiumBadge 
      variant="zap" 
      size={size}
      className={className}
      text="Unlimited"
    />
  )
}

export function LifetimeBadge({ className = '', size = 'md' }: { className?: string, size?: 'sm' | 'md' | 'lg' }) {
  return (
    <PremiumBadge 
      variant="crown" 
      size={size}
      className={className}
      text="Lifetime"
      showOnlyForPremium={false}
    />
  )
}