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
      <div className="bg-zinc-50 dark:bg-zinc-900/50 border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black text-sm font-medium mb-8">
              <FileText className="w-4 h-4" />
              <span>Gestión de Documentos</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              Tus Documentos Guardados
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Accede y gestiona todos tus contenidos generados con IA en un solo lugar.
            </p>
          </div>
        </div>
      </div>

      <main className="flex-grow container mx-auto px-4 py-12 max-w-7xl">
        <Card className="border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden">
          <DocumentManager userEmail={user?.email || ''} />
        </Card>
      </main>

      <Footer />
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
