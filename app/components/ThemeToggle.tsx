'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sun, Moon, Monitor, Palette } from 'lucide-react'
import { useTheme, enableThemeTransition } from '../hooks/useTheme'

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
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme()

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    enableThemeTransition()
    setTheme(newTheme)
  }

  const getThemeIcon = (themeType: 'light' | 'dark' | 'system', isActive = false) => {
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

  const getThemeLabel = (themeType: 'light' | 'dark' | 'system') => {
    switch (themeType) {
      case 'light':
        return 'Light'
      case 'dark':
        return 'Dark'
      case 'system':
        return 'System'
      default:
        return 'Theme'
    }
  }

  const buttonSizeClass = {
    sm: 'h-8 w-8',
    md: 'h-9 w-9',
    lg: 'h-10 w-10'
  }[size]

  if (variant === 'button') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          enableThemeTransition()
          toggleTheme()
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
          {getThemeIcon(theme === 'system' ? 'system' : resolvedTheme)}
          {showLabel && (
            <span className="ml-2 text-sm">
              {getThemeLabel(theme)}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={() => handleThemeChange('light')}
          className={`flex items-center gap-2 cursor-pointer ${
            theme === 'light' ? 'bg-blue-50 dark:bg-blue-900/20' : ''
          }`}
        >
          {getThemeIcon('light', theme === 'light')}
          <span>Light</span>
          {theme === 'light' && (
            <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full" />
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => handleThemeChange('dark')}
          className={`flex items-center gap-2 cursor-pointer ${
            theme === 'dark' ? 'bg-blue-50 dark:bg-blue-900/20' : ''
          }`}
        >
          {getThemeIcon('dark', theme === 'dark')}
          <span>Dark</span>
          {theme === 'dark' && (
            <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full" />
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => handleThemeChange('system')}
          className={`flex items-center gap-2 cursor-pointer ${
            theme === 'system' ? 'bg-blue-50 dark:bg-blue-900/20' : ''
          }`}
        >
          {getThemeIcon('system', theme === 'system')}
          <div className="flex flex-col">
            <span>System</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Currently {resolvedTheme}
            </span>
          </div>
          {theme === 'system' && (
            <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Compact theme toggle for toolbars
export const CompactThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { resolvedTheme, toggleTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        enableThemeTransition()
        toggleTheme()
      }}
      className={`h-8 w-8 p-0 ${className}`}
      title={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}
    >
      {resolvedTheme === 'light' ? (
        <Moon className="w-4 h-4" />
      ) : (
        <Sun className="w-4 h-4" />
      )}
    </Button>
  )
}

// Theme status indicator
export const ThemeIndicator: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, resolvedTheme } = useTheme()

  return (
    <div className={`flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 ${className}`}>
      {getThemeIcon(theme === 'system' ? 'system' : resolvedTheme)}
      <span>
        {theme === 'system' ? `System (${resolvedTheme})` : getThemeLabel(theme)}
      </span>
    </div>
  )

  function getThemeIcon(themeType: 'light' | 'dark' | 'system') {
    const iconClass = 'w-4 h-4'
    
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

  function getThemeLabel(themeType: 'light' | 'dark' | 'system') {
    switch (themeType) {
      case 'light':
        return 'Light'
      case 'dark':
        return 'Dark'
      case 'system':
        return 'System'
      default:
        return 'Theme'
    }  
  }
}

export default ThemeToggle