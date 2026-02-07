import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

export default function Breadcrumbs({ items }: { items: { href?: string; label: string }[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: 'https://redcreativa.pro'
      },
      ...items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: item.label,
        item: item.href ? `https://redcreativa.pro${item.href}` : undefined
      }))
    ]
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="flex items-center hover:text-foreground transition-colors">
          <Home className="w-4 h-4" />
        </Link>
        
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center">
            <ChevronRight className="w-4 h-4 mx-2" />
            {item.href ? (
              <Link href={item.href} className="hover:text-foreground transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium">{item.label}</span>
            )}
          </div>
        ))}
      </nav>
    </>
  )
}
