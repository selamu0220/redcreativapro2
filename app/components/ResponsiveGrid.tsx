'use client'

import { useViewport } from '../hooks/useViewport'

interface ResponsiveGridProps {
  children: React.ReactNode
  columns?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  gap?: string
  className?: string
}

export default function ResponsiveGrid({ 
  children, 
  columns = { mobile: 1, tablet: 2, desktop: 2 },
  gap = '1.5rem',
  className = '' 
}: ResponsiveGridProps) {
  const { isMobile, isTablet, isDesktop } = useViewport()

  const getColumns = () => {
    if (isMobile) return columns.mobile || 1
    if (isTablet) return columns.tablet || 2
    if (isDesktop) return columns.desktop || 2
    return 1
  }

  const gridColumns = getColumns()

  return (
    <div 
      className={`grid w-full ${className}`}
      style={{
        gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
        gap: gap
      }}
    >
      {children}
    </div>
  )
}