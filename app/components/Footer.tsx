'use client'

import Link from 'next/link'
import { Star, ArrowUpRight } from 'lucide-react'
import { useTranslation } from '../lib/language/context'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export default function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo y descripción */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-[10px]">RC</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-bold tracking-tight">Red Creativa Pro</span>
                <Badge variant="secondary" className="text-[10px] scale-90">
                  {t('footer.beta')}
                </Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('footer.digitalMarketingPlatform')}
            </p>
            {/* Trustpilot */}
            <Link 
              href="https://es.trustpilot.com/review/redcreativa.pro" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-xs text-muted-foreground hover:text-foreground transition-colors group"
            >
              <Star className="w-3 h-3 fill-foreground text-foreground" />
              <span>{t('footer.leaveReviewTrustpilot')}</span>
              <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>

          {/* Enlaces principales */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider">{t('footer.product')}</h3>
            <div className="space-y-2">
              <Link href="/escritor-ia" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('navigation.aiWriter')}
              </Link>
              <Link href="/correos-ia" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('navigation.aiEmails')}
              </Link>
                <Link href="/dashboard" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t('navigation.campaignsAI')}
                </Link>
            </div>
          </div>

          {/* Soporte */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider">{t('footer.support')}</h3>
            <div className="space-y-2">
              <Link href="/centro-ayuda" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('footer.helpCenter')}
              </Link>
              <Link href="/contacto" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('navigation.contact')}
              </Link>
              <Link href="/blog" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('navigation.blog')}
              </Link>
            </div>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider">{t('footer.legal')}</h3>
            <div className="space-y-2">
              <Link href="/aviso-legal" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('footer.legalNotice')}
              </Link>
              <Link href="/politica-privacidad" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('footer.privacyPolicy')}
              </Link>
              <Link href="/terminos-servicio" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('footer.termsOfService')}
              </Link>
            </div>
          </div>
        </div>

        <Separator className="my-8 opacity-50" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground font-mono">
            © 2024 RED CREATIVA PRO — MADE IN SPAIN
          </p>
          <div className="flex gap-4">
            <div className="h-4 w-4 rounded-full bg-foreground/10" />
            <div className="h-4 w-4 rounded-full bg-foreground/5" />
          </div>
        </div>
      </div>
    </footer>
  )
}
