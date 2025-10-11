'use client';

import { ExternalLink, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';

export default function StripePortalLink() {
  const [copied, setCopied] = useState(false);
  const portalUrl = 'https://billing.stripe.com/p/login/bJe3cu1Ht4FDfbcba48og00';

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(portalUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
        Portal de Clientes de Stripe
      </h3>
      <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
        Los clientes también pueden acceder directamente al portal usando este enlace:
      </p>
      <div className="flex items-center gap-2">
        <code className="flex-1 text-xs bg-white dark:bg-gray-800 px-3 py-2 rounded border border-blue-200 dark:border-blue-700 overflow-x-auto">
          {portalUrl}
        </code>
        <Button
          variant="outline"
          size="sm"
          onClick={copyToClipboard}
          className="shrink-0"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-1" />
              Copiado
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-1" />
              Copiar
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(portalUrl, '_blank')}
          className="shrink-0"
        >
          <ExternalLink className="w-4 h-4 mr-1" />
          Abrir
        </Button>
      </div>
      <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
        💡 Nota: Los clientes necesitarán su email para acceder
      </p>
    </div>
  );
}

