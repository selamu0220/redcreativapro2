'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Ghost } from 'lucide-react';

import { useEffect } from 'react';
import { useAnalytics } from '@/app/hooks/useAnalytics';

export default function NotFound() {
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    trackEvent('feature_interaction', {
      feature_name: '404_page',
      interaction_type: 'view',
      page_path: window.location.pathname
    });
  }, [trackEvent]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground overflow-hidden relative">
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/20 blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-secondary/20 blur-[100px] animate-pulse" />
      </div>

      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto space-y-8">
        <div className="relative inline-block">
          <h1 className="text-[10rem] md:text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/10 leading-none select-none">
            404
          </h1>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background/50 backdrop-blur-sm p-4 rounded-full border border-border shadow-2xl animate-bounce">
            <Ghost className="w-12 h-12 text-primary" />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Página no encontrada
          </h2>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            Parece que te has perdido en el ciberespacio. La página que buscas no existe o ha sido movida.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <Button asChild size="lg" className="rounded-full px-8 font-semibold shadow-lg shadow-primary/20 hover:scale-105 transition-transform duration-200">
            <Link href="/">
              <Home className="w-5 h-5 mr-2" />
              Volver al Inicio
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full px-8 font-semibold hover:bg-secondary/50 hover:scale-105 transition-transform duration-200">
            <Link href="/dashboard">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Ir al Dashboard
            </Link>
          </Button>
        </div>

        <div className="pt-8 border-t border-border/50">
          <p className="text-sm font-medium text-muted-foreground mb-4">Quizás buscabas:</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/blog" className="text-primary hover:underline underline-offset-4">Blog de Periodismo IA</Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/prompts" className="text-primary hover:underline underline-offset-4">Prompts para Escritores</Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/herramientas-ia-copywriting" className="text-primary hover:underline underline-offset-4">Herramientas Gratuitas</Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/buscar" className="text-primary hover:underline underline-offset-4">Buscar en la web</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
