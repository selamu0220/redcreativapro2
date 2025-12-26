'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Footer from '../components/Footer';
import { I18nErrorBoundary } from '../components/I18nErrorBoundary';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowRight } from 'lucide-react';

import { LanguageProvider } from "../lib/language/context";
import { DEFAULT_LANGUAGE } from "../lib/language/config";

function HerramientasContent() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const tools = [
    {
      title: "Escritor IA",
      description: "Genera artículos, posts y contenido extenso con IA.",
      href: "/escritor-ia",
      icon: "✍️"
    },
    {
      title: "Correos IA",
      description: "Crea campañas de email marketing efectivas.",
      href: "/correos-ia",
      icon: "📧"
    },
    {
      title: "Corrector IA",
      description: "Corrige gramática y estilo de tus textos.",
      href: "/corrector-textos-ia",
      icon: "📝"
    },
    {
      title: "Chat con Prompts",
      description: "Asistente inteligente con prompts predefinidos.",
      href: "/ai-browser",
      icon: "🤖"
    }
  ];

  return (
    <LanguageProvider initialLanguage={DEFAULT_LANGUAGE}>
      <div className="min-h-screen bg-background flex flex-col">
        <main className="flex-grow container mx-auto px-4 py-24">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              Herramientas de IA para Copywriting
            </h1>
            <p className="text-xl text-muted-foreground">
              Potencia tu escritura con nuestra suite de herramientas inteligentes diseñadas para creadores modernos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <Link key={tool.href} href={tool.href} className="group">
                <Card className="h-full border-zinc-200 dark:border-zinc-800 transition-all hover:border-zinc-900 dark:hover:border-zinc-100 group-hover:shadow-sm">
                  <CardHeader>
                    <div className="text-3xl mb-4 group-hover:scale-110 transition-transform origin-left">{tool.icon}</div>
                    <CardTitle className="text-xl group-hover:underline underline-offset-4 decoration-1">
                      {tool.title}
                    </CardTitle>
                    <CardDescription className="text-base mt-2">
                      {tool.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" className="p-0 h-auto font-medium group-hover:text-primary transition-colors">
                      Empezar ahora <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </main>

        <Footer />
      </div>
    </LanguageProvider>
  );
}

export default function HerramientasIAPage() {
  return (
    <I18nErrorBoundary
      onError={(error, errorInfo) => {
        console.error('🚨 Error in Herramientas IA page:', error);
        console.error('Component stack:', errorInfo.componentStack);
      }}
    >
      <HerramientasContent />
    </I18nErrorBoundary>
  );
}
