'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Componente cliente que se carga dinámicamente
const EmailConfigSyncClient = dynamic(
  () => import('./EmailConfigSyncClient').then(mod => ({ default: mod.EmailConfigSyncClient })),
  { 
    ssr: false,
    loading: () => null
  }
);

// Wrapper component que carga el cliente dinámicamente
export function EmailConfigSync() {
  return (
    <Suspense fallback={null}>
      <EmailConfigSyncClient />
    </Suspense>
  );
}

export default EmailConfigSync;