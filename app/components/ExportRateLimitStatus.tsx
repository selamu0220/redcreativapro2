'use client';

import { useState, useEffect } from 'react';
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';

interface RateLimitInfo {
  remaining: number;
  maxExports: number;
  resetTime?: string;
  resetIn?: number;
}

interface ExportRateLimitStatusProps {
  userEmail: string;
  onRateLimitUpdate?: (info: RateLimitInfo | null) => void;
}

export function ExportRateLimitStatus({ userEmail, onRateLimitUpdate }: ExportRateLimitStatusProps) {
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const { get } = useAuthenticatedFetch();

  const checkRateLimit = async () => {
    if (!userEmail) return;
    
    setLoading(true);
    try {
      // Make a HEAD request to check rate limit without actually exporting
      const response = await fetch(`/api/email-collection/${encodeURIComponent(userEmail)}/export?format=json&check=true`, {
        method: 'HEAD'
      });
      
      const remaining = response.headers.get('X-RateLimit-Remaining');
      const limit = response.headers.get('X-RateLimit-Limit');
      const reset = response.headers.get('X-RateLimit-Reset');
      
      if (remaining && limit) {
        const info: RateLimitInfo = {
          remaining: parseInt(remaining),
          maxExports: parseInt(limit),
          resetTime: reset || undefined,
          resetIn: reset ? Math.ceil((new Date(reset).getTime() - Date.now()) / (1000 * 60 * 60)) : undefined
        };
        
        setRateLimitInfo(info);
        onRateLimitUpdate?.(info);
      }
    } catch (error) {
      console.warn('Could not check rate limit status:', error);
      setRateLimitInfo(null);
      onRateLimitUpdate?.(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkRateLimit();
  }, [userEmail]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        Verificando límites de exportación...
      </div>
    );
  }

  if (!rateLimitInfo) {
    return null;
  }

  const { remaining, maxExports, resetIn } = rateLimitInfo;
  const isLimited = remaining === 0;

  return (
    <div className={`p-3 rounded-lg border ${isLimited ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isLimited ? 'bg-red-500' : 'bg-green-500'}`}></div>
          <span className="text-sm font-medium">
            Exportaciones disponibles: {remaining}/{maxExports}
          </span>
        </div>
        
        {isLimited && resetIn && (
          <span className="text-xs text-red-600">
            Se restablece en {resetIn}h
          </span>
        )}
      </div>
      
      {isLimited && (
        <p className="text-xs text-red-600 mt-1">
          Has alcanzado el límite diario de exportaciones. El límite se restablecerá automáticamente en {resetIn} horas.
        </p>
      )}
      
      {!isLimited && remaining <= 5 && (
        <p className="text-xs text-orange-600 mt-1">
          Te quedan pocas exportaciones disponibles para hoy.
        </p>
      )}
    </div>
  );
}