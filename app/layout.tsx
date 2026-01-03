import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import './globals.css'
import { ClientProviders } from './components/ClientProviders'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Red Creativa Pro',
  description: 'Plataforma de IA para copywriting',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ClientProviders>
          <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 max-w-screen-2xl items-center">
              <div className="mr-4 flex">
                <a href="/" className="mr-6 flex items-center space-x-2">
                  <div className="h-6 w-6 rounded-md bg-foreground flex items-center justify-center">
                    <span className="text-background font-bold text-xs">RC</span>
                  </div>
                  <span className="font-bold">Red Creativa Pro</span>
                </a>
                <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                  <a href="/blog" className="transition-colors hover:text-foreground/80 text-foreground/60">
                    Blog
                  </a>
                  <a href="/planes" className="transition-colors hover:text-foreground/80 text-foreground/60">
                    Planes
                  </a>
                </nav>
              </div>
              <div className="flex flex-1 items-center justify-end space-x-2">
                <div className="flex items-center space-x-2">
                  <a 
                    href="/api/auth/login" 
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                  >
                    Iniciar Sesión
                  </a>
                  <a 
                    href="/api/auth/register" 
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
                  >
                    Registrarse
                  </a>
                </div>
              </div>
            </div>
          </header>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}
