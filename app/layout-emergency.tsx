import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import './globals.css'

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
    <html lang="es">
      <body className={inter.className}>
        <div style={{ padding: '20px' }}>
          <h1>Red Creativa Pro - Modo Emergencia</h1>
          <p>Si ves esto, el layout funciona</p>
          {children}
        </div>
      </body>
    </html>
  )
}
