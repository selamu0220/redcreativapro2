import type { Metadata } from 'next'
import { LanguageProvider } from '@/app/lib/language/context'

export const metadata: Metadata = {
  title: 'Blog | Red Creativa Pro',
  description: 'Artículos, tutoriales y recursos sobre IA y creatividad digital.',
  alternates: { canonical: 'https://redcreativa.pro/blog' },
  openGraph: {
    title: 'Blog | Red Creativa Pro',
    description: 'Últimas publicaciones y guías de IA para copywriting y creatividad.',
    type: 'website',
    url: 'https://redcreativa.pro/blog'
  },
  robots: { index: true, follow: true }
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <div className="blog-layout-wrapper">{children}</div>
    </LanguageProvider>
  )
}

