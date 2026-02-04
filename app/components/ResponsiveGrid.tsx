'use client'

import { useViewport } from '../hooks/useViewport'
import './ui/mobile-optimizations.css'

interface ResponsiveGridProps {
  children: React.ReactNode
  columns?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function ResponsiveGrid({ 
  children, 
  columns = { mobile: 1, tablet: 2, desktop: 2 },
  gap = 'md',
  className = '' 
}: ResponsiveGridProps) {
  const { isMobile, isTablet, isDesktop } = useViewport()

  const getGridClasses = () => {
    const baseClasses = 'responsive-grid'
    
    const gapClasses = {
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6'
    }
    
    const columnClasses = []
    
    if (isMobile) {
      const mobileCols = columns.mobile || 1
      columnClasses.push(`grid-cols-${mobileCols}`)
    } else if (isTablet) {
      const tabletCols = columns.tablet || 2
      columnClasses.push(`md:grid-cols-${tabletCols}`)
    } else if (isDesktop) {
      const desktopCols = columns.desktop || 2
      columnClasses.push(`lg:grid-cols-${desktopCols}`)
    }
    
    return [baseClasses, gapClasses[gap], ...columnClasses, className].filter(Boolean).join(' ')
  }

  return (
    <div className={getGridClasses()}>
      {children}
    </div>
  )
}
