'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { usePremiumAccess } from '../hooks/usePremiumAccess'
import { useTranslation } from './SimpleLanguageProvider'

// Importar ThemeToggle de forma dinámica para evitar errores de hidratación
const ThemeToggle = dynamic(() => import('./ThemeToggle').catch(() => ({ default: () => null })), { 
  ssr: false,
  loading: () => <div className="w-8 h-8" />
})

// Importar GlobalLanguageSwitcher y HeaderCountrySelector
import GlobalLanguageSwitcher from '@/app/components/GlobalLanguageSwitcher'
import { MobileHeaderCountrySelector } from '@/app/components/HeaderCountrySelector'

interface MobileNavigationProps {
  currentPath?: string
}

export default function MobileNavigation({ currentPath }: MobileNavigationProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [user, setUser] = useState(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { isPremium, loading: premiumLoading } = usePremiumAccess()
  const { t } = useTranslation()

  useEffect(() => {
    // Detección simple de móvil
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 768)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    // Manejo simple de scroll
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setIsMenuOpen(false)
  }, [currentPath])

  if (!isMobile) return null

  const publicMenuItems = [
    { href: '/', label: `🏠 ${t('navigation.home')}`, icon: '🏠' },
    { href: '/escritor-ia', label: `✍️ ${t('navigation.aiWriter')}`, icon: '✍️' },
    { href: '/correos-ia', label: `📧 ${t('navigation.aiEmails')}`, icon: '📧' },
    { href: '/correos-ia', label: `🤖 ${t('navigation.aiEmails')}`, icon: '🤖' },
    { href: '/planes', label: `💎 ${t('navigation.plans')}`, icon: '💎' },
    { href: '/blog', label: `📚 ${t('navigation.blog')}`, icon: '📚' },
    { href: '/contacto', label: `💬 ${t('navigation.contact')}`, icon: '💬' }
  ]

    const menuItems = user ? [
      { href: '/dashboard', label: `📊 ${t('navigation.dashboard')}`, icon: '📊' },
      { href: '/seo-dashboard', label: `🔍 ${t('navigation.seoDashboard')}`, icon: '🔍' },
      { href: '/contactos', label: `👥 ${t('navigation.contacts')}`, icon: '👥' },
      { href: '/plantillas', label: `📝 ${t('navigation.templates')}`, icon: '📝' },
      { href: '/lead-magnets', label: `🧲 ${t('navigation.leadMagnets')}`, icon: '🧲' },
      { href: '/importar-exportar', label: `📤 ${t('navigation.importExport')}`, icon: '📤' },
      { href: '/estadisticas', label: `📈 ${t('navigation.statistics')}`, icon: '📈' },
      { href: '/ajustes', label: `⚙️ ${t('navigation.settings')}`, icon: '⚙️' }
    ] : [

    { href: '/auth', label: `🔐 ${t('navigation.login')}`, icon: '🔐' },
    { href: '/auth', label: `📝 ${t('navigation.signup')}`, icon: '📝' }
  ]

  return (
    <>
      {/* Header móvil fijo */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-background/95 backdrop-blur-md border-b border-border/50 shadow-lg' 
          : 'bg-background/80 backdrop-blur-sm'
      }`}>
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 hover:scale-105 transition-transform duration-200">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-md">
              <span className="text-primary-foreground font-bold text-sm">RC</span>
            </div>
            <span className="font-bold text-lg text-foreground">Red Creativa Pro</span>
          </Link>

          {/* Botones de acción */}
          <div className="flex items-center space-x-2">
            <MobileHeaderCountrySelector />
            <GlobalLanguageSwitcher />
            <ThemeToggle />
            
            {/* Botón de menú hamburguesa */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded-lg transition-all duration-300 ${
                isMenuOpen 
                  ? 'bg-primary text-primary-foreground rotate-90' 
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
              aria-label="Menú"
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${
                  isMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'
                }`} />
                <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${
                  isMenuOpen ? 'opacity-0' : 'opacity-100'
                }`} />
                <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${
                  isMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'
                }`} />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Overlay del menú */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Menú lateral deslizante */}
      <nav className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-background border-l border-border z-50 transform transition-transform duration-300 ease-in-out ${
        isMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header del menú */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">{t('navigation.menu')}</h2>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Contenido del menú */}
          <div className="flex-1 overflow-y-auto">
            {/* Menú principal */}
            <div className="p-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t('navigation.navigation')}</h3>
              <div className="space-y-1">
                {publicMenuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      currentPath === item.href
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'text-foreground hover:bg-secondary hover:scale-105'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Menú de usuario */}
            <div className="p-4 border-t border-border">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {user ? t('navigation.myAccount') : t('navigation.access')}
              </h3>
              <div className="space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      currentPath === item.href
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'text-foreground hover:bg-secondary hover:scale-105'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>
              
              {/* Botón de upgrade para usuarios gratuitos */}
              {user && !isPremium && !premiumLoading && (
                <div className="mt-4 pt-4 border-t border-border">
                  <Link
                    href="/planes"
                    className="flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold transition-all duration-200 hover:from-yellow-500 hover:to-orange-600 hover:scale-105 shadow-lg"
                  >
                    <span className="text-xl">💎</span>
                    <span>{t('navigation.upgradeToPremiun')}</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Footer del menú */}
          <div className="p-4 border-t border-border">
            <div className="text-center text-sm text-muted-foreground">
              <p className="font-medium">Red Creativa Pro</p>
              <p>IA para Email Marketing</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Espaciador para el header fijo */}
      <div className="h-16" />
    </>
  )
}

// Componente de navegación inferior para móvil (estilo app nativa)
export function MobileBottomNavigation({ currentPath }: MobileNavigationProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [user, setUser] = useState(null)
  const { t } = useTranslation()

  useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 768)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (!isMobile) return null

  const bottomNavItems = [
    { href: '/', label: t('navigation.home'), icon: '🏠' },
    { href: '/escritor-ia', label: t('navigation.writer'), icon: '✍️' },
    { href: '/correos-ia', label: t('navigation.aiEmails'), icon: '📧' },
    { href: '/planes', label: t('navigation.plans'), icon: '💎' },
    { href: user ? '/dashboard' : '/auth', label: user ? t('navigation.dashboard') : t('navigation.login'), icon: user ? '📊' : '🔐' }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border shadow-lg">
      <div className="flex items-center justify-around py-2">
        {bottomNavItems.map((item) => {
          const isActive = currentPath === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-[60px] ${
                isActive
                  ? 'text-primary scale-110'
                  : 'text-muted-foreground hover:text-foreground hover:scale-105'
              }`}
            >
              <span className={`text-xl mb-1 transition-transform duration-200 ${
                isActive ? 'animate-bounce' : ''
              }`}>
                {item.icon}
              </span>
              <span className={`text-xs font-medium transition-all duration-200 ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
      {/* Espaciador para el indicador de inicio en iOS */}
      <div className="h-safe-area-inset-bottom" />
    </nav>
  )
}