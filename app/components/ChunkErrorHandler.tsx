'use client';

import { useEffect } from 'react';

export function ChunkErrorHandler() {
  useEffect(() => {
    // Only initialize on client side
    if (typeof window === 'undefined') return;

    // Dynamically import to avoid SSR issues
    import('../lib/chunk-manager').then(({ initializeChunkErrorHandler }) => {
      try {
        initializeChunkErrorHandler();
      } catch (error) {
        console.warn('Failed to initialize chunk error handler:', error);
      }
    }).catch((error) => {
      console.warn('Failed to load chunk manager:', error);
    });
  }, []);

  // This component doesn't render anything, it just initializes error handling
  return null;
}