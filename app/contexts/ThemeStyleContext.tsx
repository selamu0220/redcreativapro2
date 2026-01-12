'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

export type ThemeStyle = 'minimal' | 'notebook' | 'neo-brutalism' | 'claude'

export interface ThemeStyleConfig {
    id: ThemeStyle
    name: string
    description: string
    previewColors: {
        primary: string
        secondary: string
        accent: string
        background: string
    }
}

export const THEME_STYLES: ThemeStyleConfig[] = [
    {
        id: 'minimal',
        name: 'Minimal',
        description: 'Limpio y profesional. Diseño neutro y moderno.',
        previewColors: {
            primary: '#212121',
            secondary: '#f5f5f5',
            accent: '#f5f5f5',
            background: '#ffffff',
        },
    },
    {
        id: 'notebook',
        name: 'Cuaderno',
        description: 'Creativo y personal. Estilo manuscrito con toques cálidos.',
        previewColors: {
            primary: '#595959',
            secondary: '#e8e0d5',
            accent: '#e8d88c',
            background: '#faf8f5',
        },
    },
    {
        id: 'neo-brutalism',
        name: 'Neo-Brutalismo',
        description: 'Audaz y llamativo. Colores vibrantes, sombras duras.',
        previewColors: {
            primary: '#e85d04',
            secondary: '#fde047',
            accent: '#6366f1',
            background: '#ffffff',
        },
    },
    {
        id: 'claude',
        name: 'Terracota',
        description: 'Cálido y acogedor. Tonos terracota amigables.',
        previewColors: {
            primary: '#d97706',
            secondary: '#e5ddd4',
            accent: '#e5ddd4',
            background: '#faf6f1',
        },
    },
]

interface ThemeStyleContextType {
    themeStyle: ThemeStyle
    setThemeStyle: (style: ThemeStyle) => void
    themes: ThemeStyleConfig[]
    isFirstVisit: boolean
    markVisited: () => void
}

const ThemeStyleContext = createContext<ThemeStyleContextType | undefined>(undefined)

const STORAGE_KEY = 'redcreativa-theme-style'
const VISITED_KEY = 'redcreativa-theme-visited'

export function ThemeStyleProvider({ children }: { children: React.ReactNode }) {
    const [themeStyle, setThemeStyleState] = useState<ThemeStyle>('minimal')
    const [isFirstVisit, setIsFirstVisit] = useState(false)
    const [mounted, setMounted] = useState(false)

    // Load theme from localStorage on mount
    useEffect(() => {
        setMounted(true)

        const savedTheme = localStorage.getItem(STORAGE_KEY) as ThemeStyle | null
        const hasVisited = localStorage.getItem(VISITED_KEY)

        if (savedTheme && THEME_STYLES.some(t => t.id === savedTheme)) {
            setThemeStyleState(savedTheme)
            document.documentElement.dataset.theme = savedTheme
        } else {
            document.documentElement.dataset.theme = 'minimal'
        }

        if (!hasVisited) {
            setIsFirstVisit(true)
        }
    }, [])

    const setThemeStyle = useCallback((style: ThemeStyle) => {
        setThemeStyleState(style)
        document.documentElement.dataset.theme = style
        localStorage.setItem(STORAGE_KEY, style)

        // Handle font loading for notebook theme
        if (style === 'notebook') {
            loadNotebookFont()
        }
    }, [])

    const markVisited = useCallback(() => {
        localStorage.setItem(VISITED_KEY, 'true')
        setIsFirstVisit(false)
    }, [])

    return (
        <ThemeStyleContext.Provider
            value={{
                themeStyle,
                setThemeStyle,
                themes: THEME_STYLES,
                isFirstVisit: mounted ? isFirstVisit : false,
                markVisited,
            }}
        >
            {children}
        </ThemeStyleContext.Provider>
    )
}

export function useThemeStyle() {
    const context = useContext(ThemeStyleContext)
    if (context === undefined) {
        throw new Error('useThemeStyle must be used within a ThemeStyleProvider')
    }
    return context
}

// Helper to load Google Font for Notebook theme
function loadNotebookFont() {
    if (document.querySelector('link[href*="Architects+Daughter"]')) {
        return // Already loaded
    }

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Architects+Daughter&display=swap'
    document.head.appendChild(link)
}
