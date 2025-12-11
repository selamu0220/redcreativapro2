import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Buscar | Red Creativa Pro',
  description: 'Busca artículos y recursos de IA para copywriting y creatividad.',
  alternates: { canonical: 'https://redcreativa.pro/buscar' },
  robots: { index: true, follow: true }
}

export default function BuscarLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

