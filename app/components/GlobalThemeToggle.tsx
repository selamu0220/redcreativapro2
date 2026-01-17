'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useThemeStyle, ThemeStyle, THEME_STYLES } from '@/app/contexts/ThemeStyleContext'
import { Palette, Check, ChevronDown } from 'lucide-react'
import { usePathname } from 'next/navigation'

export function GlobalThemeToggle() {
    const { themeStyle, setThemeStyle, themes } = useThemeStyle()
    const [isOpen, setIsOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Close on escape key
    useEffect(() => {
        function handleEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') setIsOpen(false)
        }
        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [])

    const handleSelect = (id: ThemeStyle) => {
        setThemeStyle(id)
        setIsOpen(false)
    }

    const currentTheme = themes.find(t => t.id === themeStyle) || themes[0]

    const pathname = usePathname()

    // Hide on settings pages
    if (pathname?.startsWith('/ajustes') || pathname?.startsWith('/configuracion')) {
        return null
    }

    if (!mounted) return null

    return (
        <div
            ref={dropdownRef}
            className="fixed top-4 right-4 z-50"
        >
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-background/80 backdrop-blur-md border border-border shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                aria-label="Cambiar estilo visual"
                title="Cambiar estilo visual"
            >
                <Palette className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium hidden sm:inline">{currentTheme.name}</span>
                <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 rounded-xl bg-background/95 backdrop-blur-md border border-border shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2">
                        <p className="text-xs text-muted-foreground px-2 py-1 mb-1">Elige tu estilo</p>
                        {themes.map((theme) => (
                            <button
                                key={theme.id}
                                onClick={() => handleSelect(theme.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${themeStyle === theme.id
                                    ? 'bg-primary/10 text-primary'
                                    : 'hover:bg-muted text-foreground'
                                    }`}
                            >
                                {/* Color Preview */}
                                <div className="flex gap-1">
                                    {Object.values(theme.previewColors).slice(0, 3).map((color, i) => (
                                        <div
                                            key={i}
                                            className="w-3 h-3 rounded-full border border-black/10"
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>

                                {/* Theme Info */}
                                <div className="flex-1 text-left">
                                    <div className="text-sm font-medium">{theme.name}</div>
                                    <div className="text-xs text-muted-foreground line-clamp-1">{theme.description}</div>
                                </div>

                                {/* Checkmark */}
                                {themeStyle === theme.id && (
                                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default GlobalThemeToggle
