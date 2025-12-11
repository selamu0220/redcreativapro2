import Link from 'next/link'

export default function RelatedLinks({ links }: { links: { href: string; label: string }[] }) {
  if (!links?.length) return null
  return (
    <div className="mt-8 border-t pt-6">
      <h3 className="text-lg font-semibold mb-4">Relacionado</h3>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-blue-600 hover:text-blue-800">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

