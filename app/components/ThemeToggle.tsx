'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sun, Moon, Monitor, Palette } from 'lucide-react'
import { useTheme } from 'next-themes'
import { enableThemeTransition } from '@/lib/utils'

interface ThemeToggleProps {
  variant?: 'button' | 'dropdown'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'dropdown',
  size = 'md',
  showLabel = false,
  className = ''
}) => {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleThemeChange = (newTheme: string) => {
    enableThemeTransition()
    setTheme(newTheme)
  }

  const getThemeIcon = (themeType: string, isActive = false) => {
    const iconClass = `w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`

    switch (themeType) {
      case 'light':
        return <Sun className={iconClass} />
      case 'dark':
        return <Moon className={iconClass} />
      case 'system':
        return <Monitor className={iconClass} />
      default:
        return <Palette className={iconClass} />
    }
  }

  const getThemeLabel = (themeType: string) => {
    switch (themeType) {
      case 'light': return 'Light'
      case 'dark': return 'Dark'
      case 'system': return 'System'
      default: return 'Theme'
    }
  }

  const buttonSizeClass = {
    sm: 'h-8 w-8',
    md: 'h-9 w-9',
    lg: 'h-10 w-10'
  }[size]

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" className={`${buttonSizeClass} ${className} opacity-50 cursor-not-allowed`}>
        <Sun className="w-4 h-4" />
      </Button>
    )
  }

  if (variant === 'button') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          enableThemeTransition()
          setTheme(resolvedTheme === 'light' ? 'dark' : 'light')
        }}
        className={`${buttonSizeClass} ${className}`}
        title={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}
      >
        {resolvedTheme === 'light' ? (
          <Moon className="w-4 h-4" />
        ) : (
          <Sun className="w-4 h-4" />
        )}
        {showLabel && (
          <span className="ml-2 text-sm">
            {resolvedTheme === 'light' ? 'Dark' : 'Light'}
          </span>
        )}
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`${buttonSizeClass} ${className}`}
          title="Change theme"
        >
          {getThemeIcon(theme || 'system')}
          {showLabel && (
            <span className="ml-2 text-sm">
              {getThemeLabel(theme || 'system')}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => handleThemeChange('light')}>
          <div className={`flex items-center gap-2 w-full ${theme === 'light' ? 'text-blue-600' : ''}`}>
            <Sun className="w-4 h-4" /> <span>Light</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange('dark')}>
          <div className={`flex items-center gap-2 w-full ${theme === 'dark' ? 'text-blue-600' : ''}`}>
            <Moon className="w-4 h-4" /> <span>Dark</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange('system')}>
          <div className={`flex items-center gap-2 w-full ${theme === 'system' ? 'text-blue-600' : ''}`}>
            <Monitor className="w-4 h-4" /> <span>System</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ThemeToggle
