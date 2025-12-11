"use client"
import Link from 'next/link'

export default function ShareBar({
  url,
  title
}: {
  url: string
  title: string
}) {
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)
  const twitter = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`
  const linkedin = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`

  return (
    <div className="mt-6 flex items-center gap-3">
      <span className="text-sm text-muted-foreground">Compartir:</span>
      <Link href={twitter} target="_blank" className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm">X</Link>
      <Link href={linkedin} target="_blank" className="px-3 py-2 bg-blue-700 text-white rounded-md text-sm">LinkedIn</Link>
    </div>
  )
}

