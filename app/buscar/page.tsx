"use client"
import { useState } from 'react'
import Link from 'next/link'
import { blogPosts } from '@/lib/blog-data'

export default function BuscarPage() {
  const [q, setQ] = useState('')
  const results = q
    ? blogPosts.filter(p => (p.title + ' ' + p.excerpt + ' ' + p.tags.join(' ')).toLowerCase().includes(q.toLowerCase()))
    : []
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Buscar</h1>
      <input
        type="text"
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Escribe para buscar..."
        className="w-full border rounded-lg px-4 py-2 mb-6"
      />
      {q && (
        <p className="text-sm text-muted-foreground mb-4">Resultados para “{q}”</p>
      )}
      <ul className="space-y-4">
        {results.map(r => (
          <li key={r.id} className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-1">
              <Link href={`/blog/${r.id}`} className="text-blue-600 hover:text-blue-800">
                {r.title}
              </Link>
            </h3>
            <p className="text-sm text-muted-foreground">{r.excerpt}</p>
          </li>
        ))}
        {q && results.length === 0 && (
          <li className="text-sm text-muted-foreground">Sin resultados</li>
        )}
      </ul>
    </main>
  )
}
