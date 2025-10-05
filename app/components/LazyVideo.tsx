'use client';

import { useEffect, useRef, useState } from 'react';
import { Play } from 'lucide-react';

interface LazyVideoProps {
  src: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  width?: number;
  height?: number;
}

export function LazyVideo({ 
  src, 
  poster, 
  className = '',
  autoPlay = false,
  muted = true,
  loop = false,
  controls = true,
  width,
  height
}: LazyVideoProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
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

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative ${className}`}
      style={{ 
        aspectRatio: width && height ? `${width}/${height}` : '16/9',
        width: width || '100%',
        height: height || 'auto'
      }}
    >
      {!isInView ? (
        <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center rounded-lg">
          {poster ? (
            <img 
              src={poster} 
              alt="Video thumbnail" 
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-500">
              <Play className="w-12 h-12 mb-2" />
              <span className="text-sm">Cargando video...</span>
            </div>
          )}
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            autoPlay={autoPlay}
            muted={muted}
            loop={loop}
            controls={controls}
            className="w-full h-full rounded-lg"
            onLoadedData={() => setIsLoaded(true)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            preload="metadata"
          />
          {!isPlaying && !autoPlay && (
            <button
              onClick={handlePlay}
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-40 transition-all duration-300 rounded-lg group"
              aria-label="Reproducir video"
            >
              <div className="bg-white bg-opacity-90 rounded-full p-4 group-hover:scale-110 transition-transform duration-300">
                <Play className="w-8 h-8 text-gray-800 ml-1" />
              </div>
            </button>
          )}
        </>
      )}
    </div>
  );
}