'use client'

import React, { createContext, useContext } from 'react'

// Single theme - ShadCN Black
export type ThemeStyle = 'minimal'

interface ThemeStyleContextType {
    themeStyle: ThemeStyle
}

const ThemeStyleContext = createContext<ThemeStyleContextType>({
    themeStyle: 'minimal'
})

export function ThemeStyleProvider({ children }: { children: React.ReactNode }) {
    return (
        <ThemeStyleContext.Provider value={{ themeStyle: 'minimal' }}>
            {children}
        </ThemeStyleContext.Provider>
    )
}

export function useThemeStyle() {
    return useContext(ThemeStyleContext)
}
