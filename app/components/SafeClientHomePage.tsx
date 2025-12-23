'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import type { LanguageCode } from '../lib/language/config'

interface SafeClientHomePageProps {
  initialLang: LanguageCode;
}

// Simple translations without hooks to avoid hydration issues
const getTranslation = (key: string, lang: LanguageCode) => {
  const translations = {
    es: {
      campaigns: 'Campañas IA',
      membership: 'Membresía',
      blog: 'Blog',
      login: 'Iniciar Sesión',
      demo: 'Ver Demo',
      mainTitle: 'Red Creativa Pro',
      subtitle: 'Plataforma Hispana de Marketing con IA',
      description: 'Crea contenido, gestiona campañas y automatiza tu marketing con herramientas de inteligencia artificial diseñadas específicamente para el mercado hispanohablante.',
      joinPlatform: '🚀 Unirse a Red Creativa Pro'
    },
    en: {
      campaigns: 'AI Campaigns',
      membership: 'Membership',
      blog: 'Blog',
      login: 'Sign In',
      demo: 'View Demo',
      mainTitle: 'Red Creativa Pro',
      subtitle: 'Hispanic AI Marketing Platform',
      description: 'Create content, manage campaigns and automate your marketing with artificial intelligence tools designed specifically for the Spanish-speaking market.',
      joinPlatform: '🚀 Join Red Creativa Pro'
    }
  };

  const langTranslations = translations[lang] || translations.es;
  return langTranslations[key as keyof typeof langTranslations] || key;
};

export default function SafeClientHomePage({ initialLang }: SafeClientHomePageProps) {
  const [currentLang, setCurrentLang] = useState<LanguageCode>(initialLang);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCurrentLang(initialLang);
  }, [initialLang]);

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-6 w-6 rounded-sm bg-primary flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-bold text-xs">RC</span>
          </div>
          <div className="animate-pulse text-muted-foreground">Cargando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4">
          <nav className="flex h-14 items-center justify-between">
            {/* Logo */}
            <Link className="flex items-center space-x-2" href={`/`}>
              <div className="h-6 w-6 rounded-sm bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">RC</span>
              </div>
              <span className="font-bold">Red Creativa Pro Beta</span>
            </Link>
            
            {/* Navigation Links */}
            <div className="flex items-center space-x-4">
              <Link 
                href={`/correos-ia`}
                className="text-sm font-medium text-muted-foreground hover:text-primary"
              >
                {getTranslation('campaigns', currentLang)}
              </Link>
              
              <Link 
                href={`/planes`}
                className="text-sm font-medium text-muted-foreground hover:text-primary"
              >
                {getTranslation('membership', currentLang)}
              </Link>
              
              <Link 
                href={`/blog`}
                className="text-sm font-medium text-muted-foreground hover:text-primary"
              >
                {getTranslation('blog', currentLang)}
              </Link>
              
              <Link href={`/auth`}>
                <Button variant="ghost" size="sm">
                  {getTranslation('login', currentLang)}
                </Button>
              </Link>
              
              <Button variant="outline" size="sm">
                {getTranslation('demo', currentLang)}
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-background to-purple-50/50 dark:from-blue-950/20 dark:via-background dark:to-purple-950/20"></div>
          <div className="relative container mx-auto px-4 text-center">
            {/* VERSION BETA Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-8">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              VERSION BETA - Acceso anticipado disponible
            </div>

            {/* Main Title */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-primary">
              {getTranslation('mainTitle', currentLang)}
            </h1>

            {/* Subtitle */}
            <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold mb-4 text-muted-foreground">
              {getTranslation('subtitle', currentLang)}
            </h2>
            
            {/* Powered by OpenRouter */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <span className="text-sm text-muted-foreground">Potenciado por IA</span>
              <span className="text-sm font-semibold text-primary">OpenRouter</span>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">AI</span>
            </div>

            {/* Description */}
            <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed">
              {getTranslation('description', currentLang)}
            </p>

            {/* CTA Button */}
            <div className="mb-8">
              <Button 
                size="lg"
                className="text-lg px-8 py-6 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {getTranslation('joinPlatform', currentLang)}
              </Button>
            </div>

            {/* Feature Checkmarks */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground mb-6">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Sin tarjeta de crédito</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Acceso inmediato</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Cancela cuando quieras</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Preview Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Herramientas Potenciadas por IA
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Descubre el poder de la inteligencia artificial aplicada al marketing
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-background rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow duration-200">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Escritor IA</h3>
                <p className="text-muted-foreground text-sm">Genera contenido de alta calidad para blogs y redes sociales</p>
              </div>

              <div className="bg-background rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow duration-200">
                <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-secondary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Correos IA</h3>
                <p className="text-muted-foreground text-sm">Crea campañas de email marketing personalizadas</p>
              </div>

              <div className="bg-background rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow duration-200">
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-accent-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Chat con Prompts</h3>
                <p className="text-muted-foreground text-sm">Interactúa con IA usando prompts optimizados</p>
              </div>

              <div className="bg-background rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow duration-200">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Gestión de Contactos</h3>
                <p className="text-muted-foreground text-sm">Organiza tu base de datos de clientes</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted py-12 border-t">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="h-6 w-6 rounded-sm bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">RC</span>
              </div>
              <span className="font-bold">Red Creativa Pro</span>
              <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">BETA</span>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              Plataforma completa de marketing digital con IA
            </p>
            <p className="text-xs text-muted-foreground">
              © 2024 Red Creativa Pro. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}