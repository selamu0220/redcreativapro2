'use client'

import { useState } from 'react'
import { Share2, Twitter, Facebook, Linkedin, Link2, Check } from 'lucide-react'

interface SocialShareProps {
  title: string
  url: string
  description?: string
}

export default function SocialShare({ title, url, description }: SocialShareProps) {
  const [copied, setCopied] = useState(false)

  const shareData = {
    title,
    url: typeof window !== 'undefined' ? window.location.origin + url : url,
    text: description || title
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareData.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.error('Error sharing:', err)
      }
    }
  }

  const shareLinks = [
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`,
      color: 'hover:bg-primary'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`,
      color: 'hover:bg-primary/90'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}`,
      color: 'hover:bg-primary/80'
    }
  ]

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Share2 className="w-5 h-5" />
        Compartir artículo
      </h3>
      
      <div className="flex flex-wrap gap-3">
        {shareLinks.map((platform) => (
          <a
            key={platform.name}
            href={platform.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm font-medium transition-all duration-300 hover:border-zinc-600 ${platform.color}`}
            aria-label={`Compartir en ${platform.name}`}
          >
            <platform.icon className="w-4 h-4" />
            {platform.name}
          </a>
        ))}
        
        <button type="button"
          onClick={handleCopyLink}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm font-medium transition-all duration-300 hover:border-zinc-600 hover:bg-zinc-700"
          aria-label="Copiar enlace"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-500" />
              ¡Copiado!
            </>
          ) : (
            <>
              <Link2 className="w-4 h-4" />
              Copiar enlace
            </>
          )}
        </button>
        
        {typeof navigator !== 'undefined' && navigator.share !== undefined && (
          <button type="button"
            onClick={handleNativeShare}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm font-medium transition-all duration-300 hover:border-zinc-600 hover:bg-zinc-700"
            aria-label="Compartir"
          >
            <Share2 className="w-4 h-4" />
            Compartir
          </button>
        )}
      </div>
    </div>
  )
}