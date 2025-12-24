'use client';

// Force dynamic rendering - this page requires authentication
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '../components/ProtectedRoute';
import DocumentManager from '../components/DocumentManager';
import VideoModal from '../components/VideoModal';
import { useAuth } from '../hooks/useAuth';
import { SimpleMainNavigation } from '../components/SimpleMainNavigation';
import Footer from '../components/Footer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { FileText, Youtube, Info, ChevronRight, LayoutDashboard } from 'lucide-react';
import WorkingClientLayout from "../components/WorkingClientLayout";
import { LanguageProvider } from "../lib/language/context";
import { DEFAULT_LANGUAGE } from "../lib/language/config";

function DocumentosPageContent() {
  const { user } = useAuth();
  const [showVideoModal, setShowVideoModal] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SimpleMainNavigation />

      <main className="flex-grow container mx-auto px-4 py-12 max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Mis Documentos</h1>
            <p className="text-muted-foreground text-lg">Organiza y gestiona todos tus contenidos generados por IA.</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setShowVideoModal(true)}
            >
              <Youtube className="h-4 w-4 text-red-600" />
              <span>Ver Tutorial</span>
            </Button>
            <Button asChild>
              <Link href="/dashboard" className="gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Panel de Control
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Info Card */}
          <Card className="bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                  <Info className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Gestiona tus documentos de IA</h3>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>
                      Aquí puedes organizar todos los textos, correos y contenido generado por IA. 
                      Crea carpetas para mantener todo organizado y accede fácilmente a tus trabajos anteriores.
                    </p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 list-disc list-inside">
                      <li>Organiza documentos en carpetas</li>
                      <li>Edita y actualiza contenido</li>
                      <li>Busca y filtra por tipo de documento</li>
                      <li>Guarda automáticamente desde las herramientas</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Document Manager Component */}
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden min-h-[500px]">
            <div className="p-6">
              {user?.email && <DocumentManager userEmail={user.email} />}
            </div>
          </Card>
        </div>
      </main>

      <Footer />
      
      <VideoModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        videoId="k5OYlxYdIuA"
        title="Introducción a Red Creativa Pro"
      />
    </div>
  );
}

export default function DocumentosPage() {
  return (
    <WorkingClientLayout>
      <LanguageProvider initialLanguage={DEFAULT_LANGUAGE}>
        <ProtectedRoute>
          <DocumentosPageContent />
        </ProtectedRoute>
      </LanguageProvider>
    </WorkingClientLayout>
  );
}
