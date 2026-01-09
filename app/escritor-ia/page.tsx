"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sparkles,
  Zap,
  Settings,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sliders,
  FileText,
  Wand2,
  Download,
  BarChart3,
  Hash,
  Eye,
  BookOpen,
  Plus,
  Minus,
  FileDown,
  FileType,
  FileImage,
  PlusCircle,
  X,

  LogIn,
  Lock,
  ScrollText,
  BarChart2,
  Layout
} from "lucide-react";
import { SEOAnalyzer, type SEOAnalysis } from "@/app/lib/seo-analyzer";
import { DocumentExporter } from "@/app/lib/document-exporter";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";

import { SimpleLanguageSlider } from "../components/SimpleLanguageSlider";
import { AuthAwareNav } from "../components/AuthAwareNav";
import { useSimpleTranslations } from "../lib/simple-translations";
import LimitReachedModal from "../components/LimitReachedModal";

interface Settings {
  creativity: number; // 0.1 - 1.0 (temperatura)
  autoInterval: number; // segundos entre mejoras automáticas (mínimo 2)
  autoMode: boolean; // activar/desactivar agente
  customPrompt: string; // pre-prompt personalizable
}

interface Page {
  id: string;
  title: string;
  content: string;
}

export default function EscritorIA() {
  const { isAuthenticated, isLoading: authLoading } = useKindeBrowserClient();
  const { t } = useSimpleTranslations();
  const [pages, setPages] = useState<Page[]>([
    { id: '1', title: 'Página 1', content: '' }
  ]);
  const [currentPageId, setCurrentPageId] = useState('1');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [seoAnalysis, setSeoAnalysis] = useState<SEOAnalysis | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [usageStats, setUsageStats] = useState({ usage: 0, limit: 3 });
  const [settings, setSettings] = useState<Settings>({
    creativity: 0.3,
    autoInterval: 2, // Mínimo 2 segundos
    autoMode: false,
    customPrompt: "Mejora este texto corrigiendo gramática, ortografía y fluidez. Mantén el idioma original y el tono."
  });

  const [timeLeft, setTimeLeft] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Get current page
  const currentPage = pages.find(p => p.id === currentPageId) || pages[0];
  const text = currentPage.content;

  // Update text for current page
  const setText = (newText: string) => {
    setPages(prev => prev.map(page =>
      page.id === currentPageId
        ? { ...page, content: newText }
        : page
    ));
  };

  // Update SEO analysis when text changes
  useEffect(() => {
    if (text.trim()) {
      const analysis = SEOAnalyzer.analyze(text);
      setSeoAnalysis(analysis);
    } else {
      setSeoAnalysis(null);
    }
  }, [text]);

  // Limpiar intervalos al desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // Manejar modo automático
  useEffect(() => {
    if (settings.autoMode && text.trim() && text.trim().split(/\s+/).length >= 5) {
      startAutoMode();
    } else {
      stopAutoMode();
    }

    return () => stopAutoMode();
  }, [settings.autoMode, settings.autoInterval, currentPageId]);

  // Keyboard shortcut: Shift+1 para activar/desactivar modo agente
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.shiftKey && event.key === '1') {
        event.preventDefault();
        setSettings(prev => ({ ...prev, autoMode: !prev.autoMode }));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const startAutoMode = () => {
    stopAutoMode(); // Limpiar intervalos existentes

    setTimeLeft(settings.autoInterval);

    // Countdown
    countdownRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          improveText(true); // Auto mode
          return settings.autoInterval;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopAutoMode = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setTimeLeft(0);
  };

  const improveText = async (isAutoMode = false) => {
    // Check authentication first
    if (!isAuthenticated) {
      if (window.confirm('Necesitas iniciar sesión para usar la IA. ¿Quieres iniciar sesión ahora?')) {
        window.location.href = '/api/auth/login?post_login_redirect_url=/escritor-ia';
      }
      return;
    }

    if (!text.trim()) {
      setError("Escribe algo de texto primero");
      return;
    }

    const wordCount = text.trim().split(/\s+/).length;
    if (wordCount < 5) {
      setError(`Necesitas al menos 5 palabras. Tienes ${wordCount}.`);
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log("🚀 Mejorando texto con configuración:", {
        creativity: settings.creativity,
        autoMode: isAutoMode,
        customPrompt: settings.customPrompt.substring(0, 50) + "..."
      });

      const response = await fetch('/api/improve-text-ai-sdk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: text,
          creativity: settings.creativity,
          customPrompt: settings.customPrompt
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error(data.error || 'Límite diario alcanzado');
        }
        throw new Error(data.error || 'Error en la API');
      }

      if (!data.improvedContent) {
        throw new Error('No se recibió contenido mejorado');
      }

      // Verificar que cambió
      if (text.trim().toLowerCase() === data.improvedContent.trim().toLowerCase()) {
        if (!isAutoMode) {
          setError('El texto no cambió - no se pudo mejorar');
        }
        return;
      }

      setText(data.improvedContent);
      setSuccess(isAutoMode ? "✨ Mejorado automáticamente" : "✨ Texto mejorado exitosamente");

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(""), 3000);

    } catch (err) {
      console.error("❌ Error:", err);
      // Check for limit reached error
      // Ideally fetching response.json() should have happened before throwing if status was 403.
      // But we threw error with message. 
      // We need to parse the error message or better yet, handle 403 explicitly in the fetch block.
      // Refactoring fetch block to return data instead of throwing immediately for 403.

      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';

      if (errorMessage.includes('límite diario') || errorMessage.includes('Daily limit')) {
        setError('Has alcanzado tu límite gratuito diario.');
        // Parse usage from error message or response if possible, 
        // but for now we know it's 3/3 if triggered.
        setUsageStats({ usage: 3, limit: 3 });
        setShowLimitModal(true);
      } else {
        setError(errorMessage);
      }

      // Si es modo automático y hay error, pausar por un momento
      if (isAutoMode) {
        setTimeout(() => setError(""), 5000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Page management functions
  const addPage = () => {
    const newId = (pages.length + 1).toString();
    const newPage: Page = {
      id: newId,
      title: `Página ${newId}`,
      content: ''
    };
    setPages(prev => [...prev, newPage]);
    setCurrentPageId(newId);
  };

  const removePage = (pageId: string) => {
    if (pages.length <= 1) return; // Don't remove the last page

    setPages(prev => prev.filter(p => p.id !== pageId));

    // If we're removing the current page, switch to the first available page
    if (currentPageId === pageId) {
      const remainingPages = pages.filter(p => p.id !== pageId);
      setCurrentPageId(remainingPages[0]?.id || '1');
    }
  };

  const updatePageTitle = (pageId: string, newTitle: string) => {
    setPages(prev => prev.map(page =>
      page.id === pageId
        ? { ...page, title: newTitle }
        : page
    ));
  };

  // Export functions
  const handleExport = async (format: 'pdf' | 'docx' | 'txt') => {
    if (!text.trim()) {
      setError("No hay contenido para exportar");
      return;
    }

    setIsExporting(true);
    try {
      const allContent = pages.map(page =>
        `${page.title}\n${'='.repeat(page.title.length)}\n\n${page.content}`
      ).join('\n\n---\n\n');

      const options = {
        title: pages.length > 1 ? 'Documento Multi-página' : currentPage.title,
        author: 'Red Creativa Pro',
        subject: 'Documento generado con IA'
      };

      switch (format) {
        case 'pdf':
          await DocumentExporter.exportToPDF(allContent, options);
          break;
        case 'docx':
          await DocumentExporter.exportToDOCX(allContent, options);
          break;
        case 'txt':
          await DocumentExporter.exportToTXT(allContent, options);
          break;
      }

      setSuccess(`✅ Documento exportado como ${format.toUpperCase()}`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error exporting:", err);
      setError(`Error al exportar como ${format.toUpperCase()}`);
    } finally {
      setIsExporting(false);
    }
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="min-h-screen bg-background">
      <LimitReachedModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        usageCount={usageStats.usage}
        limit={usageStats.limit}
      />
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-4">
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <Badge variant="outline" className="px-4 py-1.5 text-xs font-medium uppercase tracking-wider border-primary/20 text-primary">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              {t('advancedAI')}
            </Badge>
            <Badge variant="secondary" className="px-4 py-1.5 text-xs font-medium uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="h-3 w-3" /> Gemini 2.5 Flash
            </Badge>
            <Badge variant="outline" className="px-4 py-1.5 text-xs font-medium uppercase tracking-wider flex items-center gap-1.5">
              <Download className="h-3 w-3" /> PDF/DOCX/TXT
            </Badge>
            <Badge variant="outline" className="px-4 py-1.5 text-xs font-medium uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="h-3 w-3" /> {t('seoAnalysis')}
            </Badge>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1]">
            {t('aiWriter')}
            <span className="block text-3xl md:text-4xl text-muted-foreground font-normal mt-2">
              {t('googleDocsStyle')}
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            {t('professionalEditorDesc')}
          </p>

          {/* Preview mode banner */}
          {!isAuthenticated && !authLoading && (
            <Card className="max-w-3xl mx-auto bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <LogIn className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="font-bold text-blue-900 dark:text-blue-100">{t('tryWithoutAccount')}</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {t('tryWithoutAccountDesc')}
                    </p>
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
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Panel Principal - Editor */}
          <div className="lg:col-span-2">
            {/* Page Tabs */}
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">{t('documentPages')}</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={addPage}
                    className="h-8 px-3"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {t('newPage')}
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {pages.map((page) => (
                    <div
                      key={page.id}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${currentPageId === page.id
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background hover:bg-muted border-border'
                        }`}
                      onClick={() => setCurrentPageId(page.id)}
                    >
                      <BookOpen className="h-3 w-3" />
                      <input
                        type="text"
                        value={page.title}
                        onChange={(e) => updatePageTitle(page.id, e.target.value)}
                        className="bg-transparent border-none outline-none text-sm min-w-0 flex-1"
                        onClick={(e) => e.stopPropagation()}
                      />
                      {pages.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removePage(page.id);
                          }}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Main Editor */}
            <Card className="border-2 border-primary/20 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <FileText className="h-6 w-6 text-primary" />
                      {currentPage.title}
                    </CardTitle>
                    <CardDescription>
                      {t('googleDocsStyle')}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={wordCount >= 5 ? "default" : "secondary"} className="px-3 py-1">
                      {wordCount} {t('words')}
                    </Badge>
                    {settings.autoMode && timeLeft > 0 && (
                      <Badge variant="outline" className="px-3 py-1 text-blue-600 border-blue-200">
                        <Clock className="h-3 w-3 mr-1" />
                        {timeLeft}s
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={t('writeYourText')}
                    className="w-full h-96 p-6 border-2 border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary resize-none bg-white dark:bg-gray-900 text-foreground text-base leading-relaxed transition-all font-serif shadow-inner"
                    style={{
                      fontFamily: 'Georgia, "Times New Roman", serif',
                      lineHeight: '1.8',
                      letterSpacing: '0.01em'
                    }}
                    disabled={isLoading}
                  />
                </div>

                {error && (
                  <Card className="border-destructive/50 bg-destructive/5">
                    <CardContent className="p-4 flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                      <p className="text-destructive font-medium">{error}</p>
                    </CardContent>
                  </Card>
                )}

                {success && (
                  <Card className="border-green-500/50 bg-green-50 dark:bg-green-950/20">
                    <CardContent className="p-4 flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                      <p className="text-green-700 dark:text-green-300 font-medium">{success}</p>
                    </CardContent>
                  </Card>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    size="lg"
                    onClick={() => improveText(false)}
                    disabled={isLoading || !text.trim() || wordCount < 5}
                    className="h-12 px-8 text-base rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all w-full sm:w-auto"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2"></div>
                        {t('improving')}
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        {t('improveWithAI')}
                      </>
                    )}
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setText("")}
                    disabled={isLoading || !text.trim()}
                    className="h-12 px-8 text-base rounded-full w-full sm:w-auto"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    {t('clean')}
                  </Button>
                </div>

                <div className="text-center">
                  {wordCount < 5 ? (
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <AlertCircle className="h-4 w-4" />
                      <span>{t('needMoreWords')} ({5 - wordCount})</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{t('readyToImprove')}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel Lateral */}
          <div className="lg:col-span-2 space-y-6">

            {/* Export Panel */}
            <Card className="border-2 border-green-500/20 hover:border-green-500/40 transition-all">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Download className="h-5 w-5 text-green-500" />
                  {t('exportDocument')}
                </CardTitle>
                <CardDescription>
                  {t('downloadFormats')}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('pdf')}
                    disabled={isExporting || !text.trim()}
                    className="h-auto p-3 flex flex-col items-center gap-2"
                  >
                    <FileType className="h-6 w-6 text-red-500" />
                    <span className="text-xs font-medium">PDF</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('docx')}
                    disabled={isExporting || !text.trim()}
                    className="h-auto p-3 flex flex-col items-center gap-2"
                  >
                    <FileImage className="h-6 w-6 text-blue-500" />
                    <span className="text-xs font-medium">DOCX</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('txt')}
                    disabled={isExporting || !text.trim()}
                    className="h-auto p-3 flex flex-col items-center gap-2"
                  >
                    <FileDown className="h-6 w-6 text-gray-500" />
                    <span className="text-xs font-medium">TXT</span>
                  </Button>
                </div>

                {isExporting && (
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                    <span>Exportando...</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SEO Analysis Panel */}
            {seoAnalysis && (
              <Card className="border-2 border-purple-500/20 hover:border-purple-500/40 transition-all">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-500" />
                    {t('seoAnalysis')}
                    <Badge variant="outline" className="ml-auto">
                      {seoAnalysis.seoScore}/100
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {t('realTimeAnalysis')}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{t('wordCount')}:</span>
                        <span className="font-medium">{seoAnalysis.wordCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>{t('charactersCount')}:</span>
                        <span className="font-medium">{seoAnalysis.characterCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>{t('paragraphs')}:</span>
                        <span className="font-medium">{seoAnalysis.paragraphCount}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{t('readability')}:</span>
                        <span className="font-medium">{seoAnalysis.readabilityScore}/100</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>{t('readingTime')}:</span>
                        <span className="font-medium">{seoAnalysis.readingTime} min</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>{t('keywords')}:</span>
                        <span className="font-medium">{seoAnalysis.keywords.length}</span>
                      </div>
                    </div>
                  </div>

                  {seoAnalysis.metaKeywords.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <Hash className="h-3 w-3" />
                        Meta Keywords
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {seoAnalysis.metaKeywords.map((keyword, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {seoAnalysis.suggestions.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <Eye className="h-3 w-3" />
                        {t('suggestions')}
                      </h4>
                      <div className="space-y-1">
                        {seoAnalysis.suggestions.slice(0, 3).map((suggestion, index) => (
                          <p key={index} className="text-xs text-muted-foreground">
                            • {suggestion}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Modo Automático */}
            <Card className="border-2 border-blue-500/20 hover:border-blue-500/40 transition-all">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${settings.autoMode ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <Zap className="h-5 w-5 text-blue-500" />
                  {t('autoAgent')}
                  <Badge variant="outline" className="text-xs ml-auto">
                    Shift+1
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {t('autoAgentDesc')}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t('activateAgent')}</span>
                  <Button
                    variant={settings.autoMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSettings(prev => ({ ...prev, autoMode: !prev.autoMode }))}
                    className="h-8 px-3"
                  >
                    {settings.autoMode ? (
                      <>
                        <Pause className="h-3 w-3 mr-1" />
                        {t('active')}
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3 mr-1" />
                        {t('inactive')}
                      </>
                    )}
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{t('interval')}</span>
                    <Badge variant="outline">{settings.autoInterval}s</Badge>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="300"
                    step="1"
                    value={settings.autoInterval}
                    onChange={(e) => setSettings(prev => ({ ...prev, autoInterval: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    aria-label={t('interval')}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>2s</span>
                    <span>5min</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Creatividad */}
            <Card className="border-2 border-purple-500/20 hover:border-purple-500/40 transition-all">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-purple-500" />
                  {t('creativity')}
                </CardTitle>
                <CardDescription>
                  {t('creativityDesc')}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{t('level')}</span>
                    <Badge variant="outline">
                      {settings.creativity} {settings.creativity <= 0.3 ? `(${t('conservative')})` : settings.creativity <= 0.7 ? `(${t('balanced')})` : `(${t('creative')})`}
                    </Badge>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={settings.creativity}
                    onChange={(e) => setSettings(prev => ({ ...prev, creativity: parseFloat(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    aria-label="Nivel de creatividad"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Conservador</span>
                    <span>Creativo</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pre-prompt Personalizable */}
            <Card className="border-2 border-green-500/20 hover:border-green-500/40 transition-all">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5 text-green-500" />
                  Instrucciones IA
                </CardTitle>
                <CardDescription>
                  Personaliza cómo debe mejorar tu texto
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <textarea
                  value={settings.customPrompt}
                  onChange={(e) => setSettings(prev => ({ ...prev, customPrompt: e.target.value }))}
                  placeholder="Instrucciones para la IA..."
                  className="w-full h-24 p-3 border-2 border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none bg-background text-foreground text-sm"
                />
              </CardContent>
            </Card>

          </div>
        </div >

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <Card className="bg-muted/30 border-dashed border-2 border-primary/20">
            <CardContent className="p-6">
              <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Powered by Gemini 2.5 Flash</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Editor estilo Google Docs</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Exportación PDF/DOCX/TXT</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Análisis SEO en tiempo real</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}