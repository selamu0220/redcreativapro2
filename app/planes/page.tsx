'use client';

// Prevent static generation
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SimpleMainNavigation } from '../components/SimpleMainNavigation';
import { Badge } from '@/components/ui/badge';
import { PricingTable } from '@clerk/nextjs';

export default function PlanesPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SimpleMainNavigation />
      
      <main className="flex-grow container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
          <Badge variant="outline" className="px-3 py-1 uppercase tracking-widest text-[10px]">Precios transparentes</Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Elige tu plan de <span className="italic font-serif">productividad</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Sin contratos ocultos ni complicaciones. Cancela en cualquier momento.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {mounted ? (
            <div className="clerk-pricing-container">
              <PricingTable />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[500px] bg-muted rounded-xl border border-border" />
              ))}
            </div>
          )}
        </div>

        <div className="mt-20 text-center text-sm text-muted-foreground max-w-2xl mx-auto">
          <p>
            ¿Necesitas un plan personalizado para tu equipo? 
            <Link href="/contacto" className="text-foreground underline underline-offset-4 ml-1">Contacta con nosotros</Link>
          </p>
        </div>
      </main>

      <footer className="border-t py-12 bg-muted/20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 RED CREATIVA PRO — Gestión de suscripciones segura vía Clerk.
          </p>
        </div>
      </footer>
    </div>
  );
}

