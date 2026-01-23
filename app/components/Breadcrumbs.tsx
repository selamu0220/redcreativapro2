import Link from 'next/link'

export default function Breadcrumbs({ items }: { items: { href?: string; label: string }[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href ? `https://www.redcreativa.pro${item.href}` : undefined
    }))
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
        {items.map((item, idx) => (
          <span key={idx} className="flex items-center">
            {item.href ? (
              <Link href={item.href} className="hover:text-blue-600 transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium">{item.label}</span>
            )}
            {idx < items.length - 1 && <span className="mx-2">/</span>}
          </span>
        ))}
      </nav>
    </>
  )
}
