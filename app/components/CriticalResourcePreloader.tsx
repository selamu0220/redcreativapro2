'use client';

import { useEffect } from 'react';

interface CriticalResource {
  href: string;
  as: 'font' | 'image' | 'style' | 'script';
  type?: string;
  crossOrigin?: 'anonymous' | 'use-credentials';
  fetchPriority?: 'high' | 'low' | 'auto';
}

interface CriticalResourcePreloaderProps {
  resources: CriticalResource[];
  preloadHeroImages?: string[];
  preloadFonts?: string[];
}

export default function CriticalResourcePreloader({
  resources = [],
  preloadHeroImages = [],
  preloadFonts = []
}: CriticalResourcePreloaderProps) {
  
  useEffect(() => {
    // Preload critical resources
    const preloadResource = (resource: CriticalResource) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      
      if (resource.type) {
        link.type = resource.type;
      }
      
      if (resource.crossOrigin) {
        link.crossOrigin = resource.crossOrigin;
      }
      
      if (resource.fetchPriority) {
        link.setAttribute('fetchpriority', resource.fetchPriority);
      }
      
      // Add error handling
      link.onerror = () => {
        console.warn(`Failed to preload resource: ${resource.href}`);
      };
      
      document.head.appendChild(link);
      return link;
    };

    const preloadedLinks: HTMLLinkElement[] = [];

    // Preload specified resources
    resources.forEach(resource => {
      const link = preloadResource(resource);
      preloadedLinks.push(link);
    });

    // Preload hero images with high priority
    preloadHeroImages.forEach(imageUrl => {
      const link = preloadResource({
        href: imageUrl,
        as: 'image',
        fetchPriority: 'high'
      });
      preloadedLinks.push(link);
    });

    // Preload critical fonts
    preloadFonts.forEach(fontUrl => {
      const link = preloadResource({
        href: fontUrl,
        as: 'font',
        type: 'font/woff2',
        crossOrigin: 'anonymous',
        fetchPriority: 'high'
      });
      preloadedLinks.push(link);
    });

    // Cleanup function
    return () => {
      preloadedLinks.forEach(link => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      });
    };
  }, [resources, preloadHeroImages, preloadFonts]);

  return null; // This component doesn't render anything
}

// Hook for dynamic resource preloading
export function useResourcePreloader() {
  const preloadResource = (resource: CriticalResource) => {
    if (typeof window === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.href;
    link.as = resource.as;
    
    if (resource.type) {
      link.type = resource.type;
    }
    
    if (resource.crossOrigin) {
      link.crossOrigin = resource.crossOrigin;
    }
    
    if (resource.fetchPriority) {
      link.setAttribute('fetchpriority', resource.fetchPriority);
    }
    
    link.onerror = () => {
      console.warn(`Failed to preload resource: ${resource.href}`);
    };
    
    document.head.appendChild(link);
    
    return () => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    };
  };

  const preloadImage = (src: string, priority: 'high' | 'low' | 'auto' = 'high') => {
    return preloadResource({
      href: src,
      as: 'image',
      fetchPriority: priority
    });
  };

  const preloadFont = (src: string, type: string = 'font/woff2') => {
    return preloadResource({
      href: src,
      as: 'font',
      type,
      crossOrigin: 'anonymous',
      fetchPriority: 'high'
    });
  };

  return {
    preloadResource,
    preloadImage,
    preloadFont
  };
}

// Component for preloading above-the-fold images
interface AboveFoldPreloaderProps {
  heroImage?: string;
  logoImage?: string;
  backgroundImage?: string;
  additionalImages?: string[];
}

export function AboveFoldPreloader({
  heroImage,
  logoImage,
  backgroundImage,
  additionalImages = []
}: AboveFoldPreloaderProps) {
  const imagesToPreload = [
    heroImage,
    logoImage,
    backgroundImage,
    ...additionalImages
  ].filter(Boolean) as string[];

  return (
    <CriticalResourcePreloader
      preloadHeroImages={imagesToPreload}
      resources={[]}
    />
  );
}

// Component for preloading critical fonts
interface FontPreloaderProps {
  fonts: Array<{
    url: string;
    format?: string;
  }>;
}

export function FontPreloader({ fonts }: FontPreloaderProps) {
  const fontUrls = fonts.map(font => font.url);
  
  return (
    <CriticalResourcePreloader
      preloadFonts={fontUrls}
      resources={[]}
    />
  );
}

// Component for preloading critical CSS
interface CSSPreloaderProps {
  stylesheets: string[];
}

export function CSSPreloader({ stylesheets }: CSSPreloaderProps) {
  const resources: CriticalResource[] = stylesheets.map(href => ({
    href,
    as: 'style',
    fetchPriority: 'high'
  }));

  return (
    <CriticalResourcePreloader
      resources={resources}
    />
  );
}
