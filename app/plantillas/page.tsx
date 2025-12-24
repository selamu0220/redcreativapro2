'use client';

// Force dynamic rendering - this page requires authentication
export const dynamic = 'force-dynamic';

import { useAuth } from "../hooks/useAuth";
import Link from "next/link";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { SimpleMainNavigation } from "../components/SimpleMainNavigation";
import Footer from "../components/Footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { FileText, Sparkles, Mail, User, ArrowRight, LayoutDashboard } from "lucide-react";
import WorkingClientLayout from "../components/WorkingClientLayout";
import { LanguageProvider } from "../lib/language/context";
import { DEFAULT_LANGUAGE } from "../lib/language/config";

function PlantillasRedirectPageContent() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SimpleMainNavigation />

      <main className="flex-grow container mx-auto px-4 py-20 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm font-medium mb-6">
            <FileText className="w-4 h-4" />
            <span>Sistema Simplificado</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Plantillas Inteligentes</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Hemos evolucionado. Ahora no necesitas plantillas rígidas; nuestra IA crea contenido personalizado desde cero adaptado a tus necesidades reales.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <Card className="border-zinc-200 dark:border-zinc-800 flex flex-col h-full">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-black flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <CardTitle className="text-2xl">Escritura Libre con IA</CardTitle>
              <CardDescription>
                Genera cualquier tipo de contenido: artículos, posts, anuncios o guiones de video.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
                  Optimización gramatical y de estilo
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
                  Adaptación de tono de voz
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
                  Formatos SEO personalizables
                </li>
              </ul>
            </CardContent>
            <div className="p-6 pt-0">
              <Button asChild className="w-full gap-2">
                <Link href="/escritor-ia">
                  Ir al Escritor IA
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Card>

          <Card className="border-zinc-200 dark:border-zinc-800 flex flex-col h-full">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4 text-zinc-900 dark:text-zinc-100">
                <Mail className="w-6 h-6" />
              </div>
              <CardTitle className="text-2xl">Campañas de Email IA</CardTitle>
              <CardDescription>
                Crea secuencias de correos que venden basándose en la información de tus contactos.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
                  Emails de venta y seguimiento
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
                  Recopilación automática de leads
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
                  Personalización hiper-específica
                </li>
              </ul>
            </CardContent>
            <div className="p-6 pt-0">
              <Button asChild variant="outline" className="w-full gap-2">
                <Link href="/correos-ia">
                  Generar Correos IA
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Card>
        </div>

        <div className="flex flex-col items-center gap-6 pt-12 border-t">
          {user && (
            <Button asChild variant="secondary" className="gap-2">
              <Link href={`/correosia/${encodeURIComponent(user.email || '')}/admin`}>
                <User className="h-4 w-4" />
                Administrar mis contactos
              </Link>
            </Button>
          )}
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors"
          >
            <LayoutDashboard className="h-4 w-4" />
            Volver al Panel de Control
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function PlantillasPage() {
  return (
    <WorkingClientLayout>
      <LanguageProvider initialLanguage={DEFAULT_LANGUAGE}>
        <ProtectedRoute>
          <PlantillasRedirectPageContent />
        </ProtectedRoute>
      </LanguageProvider>
    </WorkingClientLayout>
  );
}
