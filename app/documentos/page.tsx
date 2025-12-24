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
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Herramienta no disponible</h1>
            <p className="text-muted-foreground text-lg">
              La gestión de documentos ha sido deshabilitada temporalmente por mantenimiento.
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/dashboard" className="gap-2">
                <LayoutDashboard className="h-5 w-5" />
                Volver al Panel de Control
              </Link>
            </Button>
          </div>
        </div>
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
