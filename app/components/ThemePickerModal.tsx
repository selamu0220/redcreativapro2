'use client'

import React, { useEffect, useState } from 'react'
import { useThemeStyle, ThemeStyle } from '@/app/contexts/ThemeStyleContext'
import { ThemePicker } from './ThemePicker'
import { X, Sparkles } from 'lucide-react'

interface ThemePickerModalProps {
    isOpen?: boolean
    onClose?: () => void
    showOnFirstVisit?: boolean
}

export function ThemePickerModal({
    isOpen: controlledOpen,
    onClose,
    showOnFirstVisit = true
}: ThemePickerModalProps) {
    const { isFirstVisit, markVisited } = useThemeStyle()
    const [internalOpen, setInternalOpen] = useState(false)

    const isOpen = controlledOpen ?? internalOpen

    useEffect(() => {
        if (showOnFirstVisit && isFirstVisit) {
            // Small delay for better UX
            const timer = setTimeout(() => {
                setInternalOpen(true)
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [isFirstVisit, showOnFirstVisit])

    const handleClose = () => {
        setInternalOpen(false)
        markVisited()
        onClose?.()
    }

    const handleSelectTheme = (theme: ThemeStyle) => {
        // Don't auto-close, let user explore
    }

    const handleContinue = () => {
        handleClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-auto bg-background rounded-2xl shadow-2xl border border-border animate-in zoom-in-95 fade-in duration-300">
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors z-10"
                    aria-label="Cerrar"
                >
                    <X className="w-5 h-5 text-muted-foreground" />
                </button>

                {/* Header */}
                <div className="p-6 pb-4 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
                        <Sparkles className="w-7 h-7 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                        ¡Bienvenido a Red Creativa Pro!
                    </h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Elige el estilo visual que más te guste. Puedes cambiarlo en cualquier momento desde ajustes.
                    </p>
                </div>

                {/* Theme Picker */}
                <div className="px-6 pb-4">
                    <ThemePicker onSelect={handleSelectTheme} />
                </div>

                {/* Footer */}
                <div className="p-6 pt-4 border-t border-border bg-muted/30">
                    <button
                        onClick={handleContinue}
                        className="w-full py-3 px-6 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity"
                    >
                        Continuar
                    </button>
                    <p className="text-xs text-center text-muted-foreground mt-3">
                        💡 Tip: El modo oscuro/claro se controla por separado
                    </p>
                </div>
            </div>
        </div>
    )
}

export default ThemePickerModal
