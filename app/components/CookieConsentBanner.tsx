'use client'

import React, { useState, useEffect } from 'react'
import { Cookie, X } from 'lucide-react'
import Link from 'next/link'

const COOKIE_CONSENT_KEY = 'cookie-consent-accepted'

export function CookieConsentBanner() {
    const [isVisible, setIsVisible] = useState(false)
    const [isClosing, setIsClosing] = useState(false)

    useEffect(() => {
        // Check if consent was already given
        const hasConsented = localStorage.getItem(COOKIE_CONSENT_KEY)
        if (!hasConsented) {
            // Small delay for better UX
            const timer = setTimeout(() => setIsVisible(true), 1500)
            return () => clearTimeout(timer)
        }
    }, [])

    const handleAccept = () => {
        setIsClosing(true)
        localStorage.setItem(COOKIE_CONSENT_KEY, 'true')
        setTimeout(() => setIsVisible(false), 300)
    }

    const handleDecline = () => {
        setIsClosing(true)
        localStorage.setItem(COOKIE_CONSENT_KEY, 'declined')
        setTimeout(() => setIsVisible(false), 300)
    }

    if (!isVisible) return null

    return (
        <div
            className={`fixed bottom-0 left-0 right-0 z-50 p-4 transition-all duration-300 ${isClosing ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'
                }`}
        >
            <div className="max-w-4xl mx-auto">
                <div className="bg-background/95 backdrop-blur-md rounded-2xl border border-border shadow-2xl p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        {/* Icon */}
                        <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 flex-shrink-0">
                            <Cookie className="w-6 h-6 text-primary" />
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                                <Cookie className="w-4 h-4 text-primary sm:hidden" />
                                🍪 Usamos cookies
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Utilizamos cookies para mejorar tu experiencia, analizar el tráfico y personalizar el contenido.{' '}
                                <Link
                                    href="/politica-cookies"
                                    className="text-primary hover:underline"
                                    aria-label="Leer política de cookies"
                                >
                                    Más información
                                </Link>
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 w-full sm:w-auto flex-shrink-0">
                            <button
                                onClick={handleDecline}
                                className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg border border-border hover:bg-muted transition-colors"
                            >
                                Rechazar
                            </button>
                            <button
                                onClick={handleAccept}
                                className="flex-1 sm:flex-none px-6 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                            >
                                Aceptar
                            </button>
                        </div>

                        {/* Close button */}
                        <button
                            onClick={handleDecline}
                            className="absolute top-2 right-2 sm:static p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
                            aria-label="Cerrar"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CookieConsentBanner
