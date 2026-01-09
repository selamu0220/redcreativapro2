'use client';

import Link from 'next/link'
import Breadcrumbs from '@/app/components/Breadcrumbs'
import { promptPages } from '@/lib/prompts-data'
import { SimpleMainNavigation } from '@/app/components/SimpleMainNavigation'
import Footer from '@/app/components/Footer'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Lightbulb, ChevronRight, Sparkles } from 'lucide-react'
import WorkingClientLayout from "../components/WorkingClientLayout";
import { LanguageProvider } from "../lib/language/context";
import { DEFAULT_LANGUAGE } from "../lib/language/config";
import { ProtectedRoute } from "../components/ProtectedRoute";

function PromptsIndexPageContent() {
  return (
    <div className="min-h-screen bg-background flex flex-col">

      <main className="flex-grow container mx-auto px-4 py-16 max-w-5xl">
        <div className="mb-8">
          <Breadcrumbs items={[{ href: '/', label: 'Inicio' }, { label: 'Prompts IA' }]} />
        </div>

        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black text-sm font-medium mb-6">
            <Lightbulb className="w-4 h-4" />
            <span>Biblioteca de Prompts</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Prompts IA para Copywriting</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Plantillas y estructuras probadas para generar textos que posicionan y convierten con cualquier IA.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {promptPages.map((p) => (
            <Link key={p.slug} href={`/prompts/${p.slug}`}>
              <Card className="group border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-100 transition-all duration-200 cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="text-xl group-hover:underline underline-offset-4 decoration-1">{p.title}</CardTitle>
                  <CardDescription className="text-sm line-clamp-2">
                    {p.seoDescription ?? p.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-xs font-bold uppercase tracking-wider group-hover:gap-2 transition-all">
                    Ver prompt <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <Card className="bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="p-8 md:p-12 text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-6 opacity-20" />
            <h2 className="text-2xl font-bold mb-4">¿Necesitas algo más específico?</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Usa nuestro Escritor IA para generar contenido personalizado basado en tus necesidades exactas.
            </p>
            <Button asChild size="lg">
              <Link href="/escritor-ia">
                Ir al Escritor IA
              </Link>
            </Button>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  )
}

export default function PromptsPage() {
  return (
    <WorkingClientLayout>
      <LanguageProvider>
        {/* Not strictly protected in middleware, but good to have for consistency */}
        <PromptsIndexPageContent />
      </LanguageProvider>
    </WorkingClientLayout>
  );
}
