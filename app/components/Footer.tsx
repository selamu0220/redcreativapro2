'use client'

import Link from 'next/link'
import { Star } from 'lucide-react'

export default function Footer() {
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
                  BETA
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Plataforma completa de marketing digital con IA
            </p>
            {/* Trustpilot */}
            <Link 
              href="https://es.trustpilot.com/review/redcreativa.pro" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>⭐ Déjanos una reseña en Trustpilot</span>
            </Link>
          </div>

          {/* Enlaces principales */}
          <div className="space-y-4">
            <h3 className="font-semibold">Producto</h3>
            <div className="space-y-2">
              <Link href="/escritor-ia" className="block text-sm text-muted-foreground hover:text-foreground">
                Escritor IA
              </Link>
              <Link href="/correos-ia" className="block text-sm text-muted-foreground hover:text-foreground">
                Correos IA
              </Link>
              <Link href="/correos-ia" className="block text-sm text-muted-foreground hover:text-foreground">
                Campañas IA
              </Link>
            </div>
          </div>

          {/* Soporte */}
          <div className="space-y-4">
            <h3 className="font-semibold">Soporte</h3>
            <div className="space-y-2">
              <Link href="/centro-ayuda" className="block text-sm text-muted-foreground hover:text-foreground">
                Centro de Ayuda
              </Link>
              <Link href="/contacto" className="block text-sm text-muted-foreground hover:text-foreground">
                Contacto
              </Link>
              <Link href="/blog" className="block text-sm text-muted-foreground hover:text-foreground">
                Blog
              </Link>
            </div>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold">Legal</h3>
            <div className="space-y-2">
              <Link href="/aviso-legal" className="block text-sm text-muted-foreground hover:text-foreground">
                Aviso Legal
              </Link>
              <Link href="/politica-privacidad" className="block text-sm text-muted-foreground hover:text-foreground">
                Política de Privacidad
              </Link>
              <Link href="/terminos-servicio" className="block text-sm text-muted-foreground hover:text-foreground">
                Términos de Servicio
              </Link>
              <Link href="/politica-cookies" className="block text-sm text-muted-foreground hover:text-foreground">
                Política de Cookies
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Red Creativa Pro. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}