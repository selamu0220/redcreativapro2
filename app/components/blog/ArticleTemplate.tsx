import Breadcrumbs from '@/app/components/Breadcrumbs'
import RelatedLinks from '@/app/components/RelatedLinks'
import SchemaMarkup from '@/app/components/seo/SchemaMarkup'

export default function ArticleTemplate({
  title,
  description,
  children,
  faqJsonLd,
  relatedLinks,
  breadcrumbsItems
}: {
  title: string
  description?: string
  children: React.ReactNode
  faqJsonLd?: any
  relatedLinks?: { href: string; label: string }[]
  breadcrumbsItems?: { href?: string; label: string }[]
}) {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <SchemaMarkup
        breadcrumb={{
          items: (
            (breadcrumbsItems ?? [
              { href: '/', label: 'Inicio' },
              { href: '/blog', label: 'Blog' },
              { label: title }
            ])
          ).map((item, idx) => ({
            name: item.label,
            url: item.href ? `https://redcreativa.pro${item.href}` : 'https://redcreativa.pro',
            position: idx + 1
          }))
        }}
      />
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}
      <Breadcrumbs items={
        breadcrumbsItems ?? [
          { href: '/', label: 'Inicio' },
          { href: '/blog', label: 'Blog' },
          { label: title }
        ]
      } />
      <h1 className="text-4xl font-bold mb-4">{title}</h1>
      {description && <p className="text-lg text-muted-foreground mb-6">{description}</p>}
      <article>{children}</article>
      {relatedLinks && relatedLinks.length > 0 && <RelatedLinks links={relatedLinks} />}
    </main>
  )
}
