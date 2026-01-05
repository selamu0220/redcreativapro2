import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import './globals.css'
import { ClientProviders } from './components/ClientProviders'
import { AuthAwareNav } from './components/AuthAwareNav'

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
          <div className="relative flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-14 max-w-screen-2xl items-center mx-auto px-4">
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
                  <AuthAwareNav />
                </div>
              </div>
            </header>
            <main className="flex-1">
              {children}
            </main>
          </div>
        </ClientProviders>
      </body>
    </html>
  )
}
