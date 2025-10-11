'use client';

import { useState } from 'react';
import { CreditCard, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from './ui/button';

interface CustomerPortalButtonProps {
  customerId: string;
  returnUrl?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

export default function CustomerPortalButton({
  customerId,
  returnUrl,
  variant = 'outline',
  size = 'default',
  className = '',
  children
}: CustomerPortalButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleOpenPortal = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          returnUrl: returnUrl || window.location.href,
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe Customer Portal
        window.location.href = data.url;
      } else {
        console.error('No portal URL received');
        alert('Error al abrir el portal de cliente. Por favor, intenta de nuevo.');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      alert('Error al abrir el portal de cliente. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleOpenPortal}
      disabled={loading || !customerId}
      variant={variant}
      size={size}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Abriendo...
        </>
      ) : (
        <>
          {children || (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Gestionar Suscripción
              <ExternalLink className="w-3 h-3 ml-2" />
            </>
          )}
        </>
      )}
    </Button>
  );
}

