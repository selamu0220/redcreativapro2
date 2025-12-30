"use client";

import React, { useState } from "react";
import { Twitter, Facebook, Linkedin, Link2, Check } from "lucide-react";

interface SocialShareProps {
  title: string;
  url: string;
  description?: string;
}

export default function SocialShare({ title, url, description }: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const shareOnTwitter = () => {
    const text = encodeURIComponent(title);
    const shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`;
    window.open(shareUrl, "_blank", "width=600,height=400");
  };

  const shareOnFacebook = () => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(shareUrl, "_blank", "width=600,height=400");
  };

  const shareOnLinkedIn = () => {
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(shareUrl, "_blank", "width=600,height=400");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
        Compartir:
      </span>
      
      <button
        onClick={shareOnTwitter}
        className="p-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
        aria-label="Compartir en Twitter"
      >
        <Twitter size={16} />
      </button>
      
      <button
        onClick={shareOnFacebook}
        className="p-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
        aria-label="Compartir en Facebook"
      >
        <Facebook size={16} />
      </button>
      
      <button
        onClick={shareOnLinkedIn}
        className="p-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
        aria-label="Compartir en LinkedIn"
      >
        <Linkedin size={16} />
      </button>
      
      <button
        onClick={copyLink}
        className="p-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-400"
        aria-label="Copiar enlace"
      >
        {copied ? <Check size={16} className="text-green-600" /> : <Link2 size={16} />}
      </button>
      
      {copied && (
        <span className="text-xs text-green-600 dark:text-green-400 ml-1">
          ¡Enlace copiado!
        </span>
      )}
    </div>
  );
}