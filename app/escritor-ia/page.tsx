"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Wand2,
  CheckCircle2,
  Download,
  BarChart3,
  LogIn
} from "lucide-react";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { SimpleLanguageSlider } from "../components/SimpleLanguageSlider";
import { AuthAwareNav } from "../components/AuthAwareNav";
import { useSimpleTranslations } from "../lib/simple-translations";
import LimitReachedModal from "../components/LimitReachedModal";
import { EscritorProvider, useEscritor } from "./context/EscritorContext";
import { DockLayout } from "./components/DockLayout";
import dynamic from 'next/dynamic';

// Dynamically import DockLayout to avoid SSR issues with rc-dock
const DynamicDockLayout = dynamic(
  () => import('./components/DockLayout').then(mod => mod.DockLayout),
  { ssr: false }
);

function EscritorIAContent() {
  const { isAuthenticated, isLoading: authLoading } = useKindeBrowserClient();
  const { t } = useSimpleTranslations();
  const { showLimitModal, setShowLimitModal, usageStats } = useEscritor();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LimitReachedModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        usageCount={usageStats.usage}
        limit={usageStats.limit}
      />
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0">
        <div className="container flex h-14 max-w-screen-2xl items-center mx-auto px-4">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <div className="h-6 w-6 rounded-md bg-foreground flex items-center justify-center">
                <span className="text-background font-bold text-xs">RC</span>
              </div>
              <span className="font-bold">Red Creativa Pro</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <Badge variant="outline" className="px-3 py-1 mr-2 hidden md:flex">
              <Wand2 className="h-3 w-3 mr-1" />
              {t('advancedAIWriter')}
            </Badge>
            <SimpleLanguageSlider className="mr-2" />
            <AuthAwareNav />
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Intro Banner (Collapsible or just smaller) */}
        {!isAuthenticated && !authLoading ? (
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="text-center mb-8 space-y-4">
              <h1 className="text-4xl font-extrabold tracking-tight mb-2">
                {t('aiWriter')}
              </h1>
              <Card className="max-w-xl mx-auto bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <LogIn className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-bold text-blue-900 dark:text-blue-100">{t('tryWithoutAccount')}</h3>
                      <Button size="sm" className="mt-2" asChild>
                        <Link href="/api/auth/login?post_login_redirect_url=/escritor-ia">
                          <LogIn className="h-3 w-3 mr-2" />
                          {t('loginToUseAI')}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <>
            <div className="py-2 px-4 border-b flex items-center justify-between bg-muted/20 shrink-0">
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="outline" className="h-5 px-1.5 font-normal">Gemini 2.5 Flash</Badge>
                <Badge variant="outline" className="h-5 px-1.5 font-normal">Auto-Save Protocol</Badge>
              </div>
              <div className="text-xs text-muted-foreground flex gap-3">
                <div className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Google Docs Style</div>
                <div className="flex items-center gap-1"><Download className="h-3 w-3" /> Export PDF/DOCX</div>
                <div className="flex items-center gap-1"><BarChart3 className="h-3 w-3" /> Real-time SEO</div>
              </div>
            </div>
            <div className="flex-1 relative bg-background">
              <DynamicDockLayout />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function EscritorIA() {
  return (
    <EscritorProvider>
      <EscritorIAContent />
    </EscritorProvider>
  );
}