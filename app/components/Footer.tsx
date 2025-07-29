'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const Footer = () => {
  const [showCookieBanner, setShowCookieBanner] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    if (!cookiesAccepted) {
      setShowCookieBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setShowCookieBanner(false);
  };

  const rejectCookies = () => {
    localStorage.setItem('cookiesAccepted', 'false');
    setShowCookieBanner(false);
  };

  return (
    <>
      {/* Cookie Banner */}
      {showCookieBanner && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border p-4 animate-fade-in-up">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex-1 text-sm text-muted-foreground">
              <p>
                Utilizamos cookies para mejorar tu experiencia en nuestro sitio web. 
                Al continuar navegando, aceptas nuestro uso de cookies según nuestra{' '}
                <Link href="/politica-privacidad" className="text-primary hover:underline">
                  Política de Privacidad
                </Link>.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={rejectCookies}
                className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors duration-200"
              >
                Rechazar
              </button>
              <button
                onClick={acceptCookies}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-background border-t border-border mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">RC</span>
                </div>
                <span className="font-bold text-lg">Red Creativa Pro</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Plataforma de inteligencia artificial que potencia tu creatividad con herramientas avanzadas de generación de contenido.
              </p>
            </div>

            {/* Product Links */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Productos</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/escritor-ia" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                    Escritor IA
                  </Link>
                </li>
                <li>
                  <Link href="/correos-ia" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                    Correos IA
                  </Link>
                </li>
                <li>
                  <Link href="/prompts" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                    Chat con Prompts
                  </Link>
                </li>
                <li>
                  <Link href="/planes" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                    Planes y Precios
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support Links */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Soporte</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/ayuda" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                    Centro de Ayuda
                  </Link>
                </li>
                <li>
                  <Link href="/contacto" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                    Contacto
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                    Preguntas Frecuentes
                  </Link>
                </li>
                <li>
                  <Link href="/estado" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                    Estado del Servicio
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/terminos-servicio" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                    Términos de Servicio
                  </Link>
                </li>
                <li>
                  <Link href="/politica-privacidad" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                    Política de Privacidad
                  </Link>
                </li>
                <li>
                  <Link href="/politica-cookies" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                    Política de Cookies
                  </Link>
                </li>
                <li>
                  <Link href="/aviso-legal" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                    Aviso Legal
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-border mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Red Creativa Pro. Todos los derechos reservados.
            </p>
            <div className="flex items-center space-x-4">
              <Link 
                href="https://twitter.com/redcreativapro" 
                className="text-muted-foreground hover:text-primary transition-colors duration-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </Link>
              <Link 
                href="https://linkedin.com/company/redcreativapro" 
                className="text-muted-foreground hover:text-primary transition-colors duration-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </Link>
              <Link 
                href="https://github.com/redcreativapro" 
                className="text-muted-foreground hover:text-primary transition-colors duration-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;