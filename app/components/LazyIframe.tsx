'use client';

import { useEffect, useRef, useState } from 'react';
import { ExternalLink } from 'lucide-react';

interface LazyIframeProps {
  src: string;
  title: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  allowFullScreen?: boolean;
  loading?: 'lazy' | 'eager';
}

export function LazyIframe({ 
  src, 
  title,
  className = '',
  width = '100%',
  height = 400,
  allowFullScreen = false,
  loading = 'lazy'
}: LazyIframeProps) {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`relative ${className}`}
      style={{ width, height }}
    >
      {!isInView ? (
        <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center rounded-lg border">
          <div className="flex flex-col items-center justify-center text-gray-500">
            <ExternalLink className="w-8 h-8 mb-2" />
            <span className="text-sm text-center px-4">
              Cargando contenido externo...
            </span>
          </div>
        </div>
      ) : (
        <>
          {!isLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center rounded-lg z-10">
              <div className="flex flex-col items-center justify-center text-gray-500">
                <ExternalLink className="w-8 h-8 mb-2" />
                <span className="text-sm">Cargando...</span>
              </div>
            </div>
          )}
          <iframe
            src={src}
            title={title}
            width={width}
            height={height}
            allowFullScreen={allowFullScreen}
            loading={loading}
            className="w-full h-full rounded-lg border"
            onLoad={() => setIsLoaded(true)}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </>
      )}
    </div>
  );
}