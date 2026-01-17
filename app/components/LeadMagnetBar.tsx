'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { X, Gift, ArrowRight, Sparkles, Download, CheckCircle2 } from 'lucide-react'
import { useSimpleTranslations } from '../lib/simple-translations'

interface LeadMagnetBarProps {
    onClose?: () => void
}

export function LeadMagnetBar({ onClose }: LeadMagnetBarProps) {
    const { t, currentLang } = useSimpleTranslations()
    const [email, setEmail] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [isVisible, setIsVisible] = useState(false)
    const [isDismissed, setIsDismissed] = useState(false)

    useEffect(() => {
        // Check if already dismissed in this session
        const dismissed = sessionStorage.getItem('leadMagnetDismissed')
        if (dismissed) {
            setIsDismissed(true)
            return
        }

        // Show after 3 seconds of page load
        const timer = setTimeout(() => {
            setIsVisible(true)
        }, 3000)

        return () => clearTimeout(timer)
    }, [])

    const handleDismiss = () => {
        setIsVisible(false)
        setIsDismissed(true)
        sessionStorage.setItem('leadMagnetDismissed', 'true')
        onClose?.()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email || isSubmitting) return

        setIsSubmitting(true)

        // Simulate submission - in production, connect to real email service
        await new Promise(resolve => setTimeout(resolve, 1000))

        setIsSubmitting(false)
        setIsSubmitted(true)

        // Store in localStorage that user downloaded
        localStorage.setItem('leadMagnetEmail', email)
    }

    if (isDismissed || !isVisible) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-500">
            <div className="bg-gradient-to-r from-primary/95 to-blue-600/95 backdrop-blur-md border-t border-primary-foreground/20 shadow-2xl">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* Left: Offer */}
                        <div className="flex items-center gap-4 text-primary-foreground">
                            <div className="hidden sm:flex h-12 w-12 rounded-full bg-white/20 items-center justify-center shrink-0">
                                <Gift className="h-6 w-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs font-bold uppercase">
                                        {currentLang === 'es' ? '100% Gratis' : '100% Free'}
                                    </Badge>
                                    <span className="text-xs opacity-80">
                                        {currentLang === 'es' ? 'Valor: €47' : 'Value: €47'}
                                    </span>
                                </div>
                                <h3 className="font-bold text-lg leading-tight">
                                    {currentLang === 'es'
                                        ? '📄 Guía: 7 Titulares SEO que Generan Clicks'
                                        : '📄 Guide: 7 SEO Headlines That Generate Clicks'}
                                </h3>
                                <p className="text-sm opacity-90">
                                    {currentLang === 'es'
                                        ? 'Plantilla + Ejemplos reales de artículos que posicionaron en Top 10'
                                        : 'Template + Real examples from articles that ranked in Top 10'}
                                </p>
                            </div>
                        </div>

                        {/* Right: Form or Success */}
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            {!isSubmitted ? (
                                <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full md:w-auto">
                                    <Input
                                        type="email"
                                        placeholder={currentLang === 'es' ? 'Tu email' : 'Your email'}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="h-11 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 min-w-[200px]"
                                    />
                                    <Button
                                        type="submit"
                                        size="lg"
                                        disabled={isSubmitting}
                                        className="h-11 bg-white text-primary hover:bg-white/90 font-bold shrink-0"
                                    >
                                        {isSubmitting ? (
                                            <Sparkles className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Download className="h-4 w-4 mr-2" />
                                                {currentLang === 'es' ? 'Descargar' : 'Download'}
                                            </>
                                        )}
                                    </Button>
                                </form>
                            ) : (
                                <div className="flex items-center gap-2 text-white">
                                    <CheckCircle2 className="h-5 w-5" />
                                    <span className="font-medium">
                                        {currentLang === 'es'
                                            ? '¡Revisa tu email! Guía enviada.'
                                            : 'Check your email! Guide sent.'}
                                    </span>
                                </div>
                            )}

                            {/* Close button */}
                            <button
                                onClick={handleDismiss}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white shrink-0"
                                aria-label="Close"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Floating version for alternative placement
export function LeadMagnetFloating() {
    const { currentLang } = useSimpleTranslations()
    const [isOpen, setIsOpen] = useState(false)
    const [hasShown, setHasShown] = useState(false)

    useEffect(() => {
        const shown = localStorage.getItem('leadMagnetShown')
        if (shown) {
            setHasShown(true)
            return
        }

        // Show after 10 seconds
        const timer = setTimeout(() => {
            setIsOpen(true)
            setHasShown(true)
            localStorage.setItem('leadMagnetShown', 'true')
        }, 10000)

        return () => clearTimeout(timer)
    }, [])

    if (hasShown && !isOpen) return null

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {isOpen ? (
                <div className="bg-card border shadow-2xl rounded-xl p-6 max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-300">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="absolute top-2 right-2 p-1 hover:bg-muted rounded-full"
                    >
                        <X className="h-4 w-4" />
                    </button>
                    <div className="space-y-4">
                        <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                            {currentLang === 'es' ? 'Regalo Gratis' : 'Free Gift'}
                        </Badge>
                        <h3 className="font-bold text-lg">
                            {currentLang === 'es'
                                ? '🎁 7 Titulares SEO que funcionan'
                                : '🎁 7 SEO Headlines that work'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {currentLang === 'es'
                                ? 'La plantilla exacta que uso para posicionar artículos en Google.'
                                : 'The exact template I use to rank articles on Google.'}
                        </p>
                        <Button className="w-full" onClick={() => setIsOpen(false)}>
                            <ArrowRight className="h-4 w-4 mr-2" />
                            {currentLang === 'es' ? 'Quiero la guía' : 'Get the guide'}
                        </Button>
                    </div>
                </div>
            ) : (
                <Button
                    onClick={() => setIsOpen(true)}
                    size="lg"
                    className="rounded-full shadow-lg animate-bounce"
                >
                    <Gift className="h-5 w-5 mr-2" />
                    {currentLang === 'es' ? 'Regalo Gratis' : 'Free Gift'}
                </Button>
            )}
        </div>
    )
}
