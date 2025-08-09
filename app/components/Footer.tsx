'use client'

import Link from 'next/link'

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
              <span className="font-bold">Red Creativa Pro</span>
            </div>
            <p className="text-sm text-muted-foreground">
              IA para Email Marketing Profesional
            </p>
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