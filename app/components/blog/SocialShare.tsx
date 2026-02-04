"use client";

import React from 'react';
import { Twitter, Linkedin, Link2, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface SocialShareProps {
  title: string;
  url?: string; // Optional, defaults to current window location
}

export function SocialShare({ title, url }: SocialShareProps) {
  const [shareUrl, setShareUrl] = React.useState('');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(url || window.location.href);
    }
  }, [url]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Enlace copiado al portapapeles');
  };

  const shareText = encodeURIComponent(title);
  const shareLink = encodeURIComponent(shareUrl);

  return (
    <div className="flex flex-row md:flex-col gap-2 items-center justify-center p-2 rounded-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-800 shadow-sm md:sticky md:top-32">
      <div className="text-xs font-bold text-gray-400 uppercase hidden md:block mb-2 transform -rotate-90">
        Compartir
      </div>

      <a
        href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareLink}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Compartir en Twitter"
      >
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-50 hover:text-blue-500">
          <Twitter className="w-4 h-4" />
        </Button>
      </a>

      <a
        href={`https://www.linkedin.com/shareArticle?mini=true&url=${shareLink}&title=${shareText}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Compartir en LinkedIn"
      >
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-50 hover:text-blue-700">
          <Linkedin className="w-4 h-4" />
        </Button>
      </a>

      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${shareLink}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Compartir en Facebook"
      >
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-50 hover:text-blue-600">
          <Facebook className="w-4 h-4" />
        </Button>
      </a>

      <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-50" onClick={handleCopyLink} aria-label="Copiar enlace">
        <Link2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
