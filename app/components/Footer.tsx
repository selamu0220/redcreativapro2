'use client'

import Link from 'next/link'
import { Star } from 'lucide-react'
import { useTranslation } from '../lib/language/context'

export default function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded-sm bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">RC</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-bold">Red Creativa Pro</span>
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                  {t('footer.beta')}
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('footer.digitalMarketingPlatform')}
            </p>
            {/* Trustpilot */}
            <Link 
              href="https://es.trustpilot.com/review/redcreativa.pro" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>⭐ {t('footer.leaveReviewTrustpilot')}</span>
            </Link>
          </div>

          {/* Enlaces principales */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t('footer.product')}</h3>
            <div className="space-y-2">
              <Link href="/escritor-ia" className="block text-sm text-muted-foreground hover:text-foreground">
                {t('navigation.aiWriter')}
              </Link>
              <Link href="/correos-ia" className="block text-sm text-muted-foreground hover:text-foreground">
                {t('navigation.aiEmails')}
              </Link>
              <Link href="/correos-ia" className="block text-sm text-muted-foreground hover:text-foreground">
                {t('navigation.campaignsAI')}
              </Link>
            </div>
          </div>

          {/* Soporte */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t('footer.support')}</h3>
            <div className="space-y-2">
              <Link href="/centro-ayuda" className="block text-sm text-muted-foreground hover:text-foreground">
                {t('footer.helpCenter')}
              </Link>
              <Link href="/contacto" className="block text-sm text-muted-foreground hover:text-foreground">
                {t('navigation.contact')}
              </Link>
              <Link href="/blog" className="block text-sm text-muted-foreground hover:text-foreground">
                {t('navigation.blog')}
              </Link>
            </div>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t('footer.legal')}</h3>
            <div className="space-y-2">
              <Link href="/aviso-legal" className="block text-sm text-muted-foreground hover:text-foreground">
                {t('footer.legalNotice')}
              </Link>
              <Link href="/politica-privacidad" className="block text-sm text-muted-foreground hover:text-foreground">
                {t('footer.privacyPolicy')}
              </Link>
              <Link href="/terminos-servicio" className="block text-sm text-muted-foreground hover:text-foreground">
                {t('footer.termsOfService')}
              </Link>
              <Link href="/politica-cookies" className="block text-sm text-muted-foreground hover:text-foreground">
                {t('footer.cookiePolicy')}
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Red Creativa Pro. {t('footer.allRightsReserved')}.
          </p>
        </div>
      </div>
    </footer>
  )
}