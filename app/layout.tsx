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
          {/* No header global - cada página decide si necesita header */}
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}
