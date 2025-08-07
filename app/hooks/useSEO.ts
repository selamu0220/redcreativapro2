import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Post } from '../types/blog';

interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
}

export const useSEO = (config: SEOConfig) => {
  const router = useRouter();

  useEffect(() => {
    // Update document title
    if (config.title) {
      document.title = config.title;
    }

    // Update meta description
    if (config.description) {
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', config.description);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = config.description;
        document.head.appendChild(meta);
      }
    }

    // Update meta keywords
    if (config.keywords && config.keywords.length > 0) {
      const metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        metaKeywords.setAttribute('content', config.keywords.join(', '));
      } else {
        const meta = document.createElement('meta');
        meta.name = 'keywords';
        meta.content = config.keywords.join(', ');
        document.head.appendChild(meta);
      }
    }

    // Update Open Graph image
    if (config.ogImage) {
      const ogImageMeta = document.querySelector('meta[property="og:image"]');
      if (ogImageMeta) {
        ogImageMeta.setAttribute('content', config.ogImage);
      } else {
        const meta = document.createElement('meta');
        meta.setAttribute('property', 'og:image');
        meta.content = config.ogImage;
        document.head.appendChild(meta);
      }
    }

    // Update canonical URL
    if (config.canonicalUrl) {
      const canonicalLink = document.querySelector('link[rel="canonical"]');
      if (canonicalLink) {
        canonicalLink.setAttribute('href', config.canonicalUrl);
      } else {
        const link = document.createElement('link');
        link.rel = 'canonical';
        link.href = config.canonicalUrl;
        document.head.appendChild(link);
      }
    }
  }, [config]);

  return {
    updateSEO: (newConfig: SEOConfig) => {
      // This could be used to dynamically update SEO
    }
  };
};

export const generatePostSEO = (post: Post): SEOConfig => {
  return {
    title: `${post.title} | Red Creativa Pro`,
    description: post.excerpt || post.content?.substring(0, 160),
    keywords: post.tags || [],
    ogImage: post.image,
    canonicalUrl: `/blog/${post.slug}`
  };
};