"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { useRouter } from "next/navigation";
import EnhancedAIWriterEditor from "./components/EnhancedAIWriterEditor";
import WriterAssistantPanel from "./components/WriterAssistantPanel"; // Importamos el nuevo componente
import SettingsPanel from "./components/SettingsPanel";
import { improveContent } from "../lib/ai-client";
import { getSettings, type AISettings } from "../lib/settings-manager";
import Footer from "../components/Footer";
import { ProtectedRoute } from "../components/ProtectedRoute";
import WorkingClientLayout from "../components/WorkingClientLayout";
import { LanguageProvider } from "../lib/language/context";
import { DEFAULT_LANGUAGE } from "../lib/language/config";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
// Importamos motores de análisis reales
import { RealTimeSEOEngine } from "../lib/real-time-seo-engine";
import { AIDetectionAvoidanceEngine } from "../lib/ai-detection-avoidance";

import {
  PenTool,
  Sparkles,
  Settings as SettingsIcon,
  Copy,
  Info,
  Zap,
  Target,
  Lock,
  CheckCircle2,
  AlertCircle,
  History,
  Trash2,
  ExternalLink,
  PanelRight // Icono para togglear panel
} from "lucide-react";
import { useOpenRouterSync } from "../hooks/useOpenRouterSync";
import { useSubscription } from "../hooks/useSubscription";
import { toast } from "sonner";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";

interface SavedDocument {
  id: string;
  title: string;
  category: string;
  updated_at: string;
}

function EscritorIAPage() {
  const { userId, loading: authLoading } = useAuth();
  const router = useRouter();

  const [content, setContent] = useState("");
  const [title, setTitle] = useState("Nuevo Documento");
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [savedDocuments, setSavedDocuments] = useState<SavedDocument[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<{ id: string, title: string } | null>(null);

  // Estados para el Asistente IA
  const [seoScore, setSeoScore] = useState(0);
  const [aiRisk, setAiRisk] = useState<'low' | 'medium' | 'high'>('low');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAssistant, setShowAssistant] = useState(true); // Toggle para panel

  const { openRouterApiKey, openRouterModel, geminiApiKey } = useOpenRouterSync();

  // Instancias de motores (memoizadas o refs para evitar recreación)
  const seoEngineRef = useRef(new RealTimeSEOEngine());
  const aiAvoidanceRef = useRef(new AIDetectionAvoidanceEngine());
  const { subscriptionData, loading: subLoading } = useSubscription();
  const [subscriptionInfo, setSubscriptionInfo] = useState<{
    usage: number;
    limit: number;
    isPremium: boolean;
  } | null>(null);

  const analysisTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // DEBUGGING: Log mount and state
  useEffect(() => {
    console.log('[EscritorPage] MOUNTED');
    console.log('[EscritorPage] State:', {
      userId,
      contentLength: content?.length,
      isProcessing,
      isLoadingDocs,
      settingsLoaded: !!settings,
      showAssistant
    });
  }, [userId, content, isProcessing, isLoadingDocs, settings, showAssistant]);

  useEffect(() => {
    const loadedSettings = getSettings();
    setSettings(loadedSettings);

    async function fetchUsage() {
      try {
        const usageRes = await fetch('/api/usage-stats');
        const usageData = await usageRes.json();
        setSubscriptionInfo({
          usage: usageData.usage || 0,
          limit: usageData.limit || 3,
          isPremium: subscriptionData?.status === 'active'
        });
      } catch (e) {
        console.error("Error fetching usage stats:", e);
      }
    }

    if (!subLoading) {
      fetchUsage();
    }

    if (userId) {
      fetchDocuments();
    }
  }, [subscriptionData, subLoading, userId]);

  // Efecto para análisis en tiempo real
  useEffect(() => {
    if (!content.trim()) {
      setSeoScore(0);
      setKeywords([]);
      return;
    }

    setIsAnalyzing(true);

    // Debounce analysis 2 seconds
    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current);
    }

    analysisTimeoutRef.current = setTimeout(() => {
      analyzeContent(content);
    }, 2000);

    return () => {
      if (analysisTimeoutRef.current) clearTimeout(analysisTimeoutRef.current);
    };
  }, [content]);

  const analyzeContent = async (text: string) => {
    try {
      // Análisis SEO Real
      const seoResult = await seoEngineRef.current.analyzeSEO(text,
        keywords.length > 0 ? keywords : undefined
      );

      setSeoScore(seoResult.score.overall);

      // Extracción de keywords sugeridas por el engine
      // Acceder a keywordAnalysis y extraer las keywords
      if (seoResult.keywordAnalysis && seoResult.keywordAnalysis.length > 0) {
        // Si ya tenemos keywords, usamos el analizador para refinarlas
        // Si no, podemos intentar extraer del contenido (esto es una simulación ya que analyzeSEO recibe keywords, no las genera desde cero explicitamente en la interfaz mostrada)
        // Sin embargo, RealTimeSEOEngine tiene extractKeywords interno.
        // Usaremos una extracción simple local si no habia keywords previas para alimentar el engine la proxima vez
      }

      // Fallback para keywords si no hay definidas
      if (keywords.length === 0) {
        const commonWords = text.toLowerCase().match(/\b\w{5,}\b/g) || [];
        const uniqueKeywords = [...new Set(commonWords)].slice(0, 5);
        if (uniqueKeywords.length > 0) setKeywords(uniqueKeywords);
      }

      // Análisis de Detección IA Real
      // Solo ejecutamos esto si no estamos en 'modo borrador' muy rápido o si el usuario
      // no ha desactivado explícitamente las ayudas automáticas (agentMode)
      if (settings?.agentModeEnabled !== false) {
        const detectionScore = await aiAvoidanceRef.current.analyzeDetectionRisk(text);

        // Mapear resultado
        let risk: 'low' | 'medium' | 'high' = 'low';
        if (detectionScore.overall > 70) risk = 'high';
        else if (detectionScore.overall > 40) risk = 'medium';

        setAiRisk(risk);
      }
    } catch (err) {
      console.error("Error analyzing content:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fetchDocuments = async () => {
    setIsLoadingDocs(true);
    try {
      const res = await fetch('/api/documents', {
        headers: { 'x-user-uid': userId || '' }
      });
      if (res.ok) {
        const data = await res.json();
        setSavedDocuments(data.documents || []);
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error("El contenido no puede estar vacío");
      return;
    }

    setIsSaving(true);
    try {
      const isUpdate = !!currentDocId;
      const url = isUpdate ? `/api/documents/${currentDocId}` : '/api/documents';
      const method = isUpdate ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-uid': userId || ''
        },
        body: JSON.stringify({
          title: title,
          content: content,
          category: 'Escritor IA'
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(isUpdate ? "Documento actualizado" : "Documento guardado");

        if (!isUpdate && data.document?.id) {
          setCurrentDocId(data.document.id);
        }

        fetchDocuments();
      } else {
        const data = await res.json();
        toast.error(data.error || "Error al guardar documento");
      }
    } catch (err) {
      toast.error("Error de conexión al guardar");
    } finally {
      setIsSaving(false);
    }
  };

  const loadDocument = async (docId: string) => {
    try {
      const res = await fetch(`/api/documents/${docId}`, {
        headers: { 'x-user-uid': userId || '' }
      });
      if (res.ok) {
        const data = await res.json();
        setContent(data.document.content);
        setTitle(data.document.title);
        setCurrentDocId(data.document.id);
        toast.success("Documento cargado");
      }
    } catch (err) {
      toast.error("Error al cargar el documento");
    }
  };

  const createNewDocument = () => {
    setContent("");
    setTitle("Nuevo Documento");
    setCurrentDocId(null);
    toast.info("Nuevo documento creado");
  };

  const deleteDocument = async (docId: string) => {
    try {
      const res = await fetch(`/api/documents/${docId}`, {
        method: 'DELETE',
        headers: { 'x-user-uid': userId || '' }
      });
      if (res.ok) {
        setSavedDocuments(prev => prev.filter(d => d.id !== docId));
        if (currentDocId === docId) {
          createNewDocument();
        }
        toast.success("Documento eliminado");
      }
    } catch (err) {
      toast.error("Error al eliminar");
    }
  };

  const confirmDeleteDocument = (doc: SavedDocument) => {
    setDocToDelete({ id: doc.id, title: doc.title });
    setIsDeleteModalOpen(true);
  };

  const handleImprove = async () => {
    if (!content.trim()) {
      setError("Por favor, escribe algo de texto primero.");
      return;
    }

    let apiKeyToUse = settings?.apiKey;
    let providerToUse = settings?.provider || 'openrouter';
    let modelToUse = settings?.model || 'google/gemini-2.0-flash-exp:free';

    if (!settings?.usePersonalKey) {
      if (providerToUse === 'google' && geminiApiKey) {
        apiKeyToUse = geminiApiKey;
      } else if (providerToUse === 'openrouter' && openRouterApiKey) {
        apiKeyToUse = openRouterApiKey;
        modelToUse = openRouterModel || modelToUse;
      }
    }

    if (!apiKeyToUse) {
      setError("Por favor, configura tu API key en ajustes para el proveedor seleccionado.");
      return;
    }

    if (!subscriptionInfo?.isPremium && subscriptionInfo && subscriptionInfo.usage >= subscriptionInfo.limit) {
      setError("Has alcanzado tu límite diario de uso gratuito. Sube a Premium para uso ilimitado.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await improveContent(
        { content },
        {
          provider: providerToUse,
          model: modelToUse,
          temperature: settings?.temperature || 0.7,
          apiKey: apiKeyToUse
        }
      );

      if (response.success && response.improvedContent) {
        setContent(response.improvedContent);
        if (!subscriptionInfo?.isPremium) {
          try {
            const trackRes = await fetch('/api/usage-stats', { method: 'POST' });
            if (trackRes.ok) {
              const trackData = await trackRes.json();
              setSubscriptionInfo(prev => prev ? { ...prev, usage: trackData.usage } : null);
            }
          } catch (trackErr) {
            console.error("Error tracking usage:", trackErr);
          }
        }
      } else if (response.error) {
        setError(response.error.userMessage);
      }
    } catch (err) {
      setError("Error inesperado. Por favor, intenta de nuevo.");
      console.error("Improve content error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast.success("Contenido copiado al portapapeles");
  };

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };

  const handleSettingsChange = (newSettings: AISettings) => {
    setSettings(newSettings);
  };

  return (
    <WorkingClientLayout>
      <LanguageProvider initialLanguage={DEFAULT_LANGUAGE}>
        <ProtectedRoute>
          <div className="min-h-screen bg-background flex flex-col">

            {/* Header Simplificado */}
            <div className="bg-zinc-50 dark:bg-zinc-900/50 border-b">
              <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                      <PenTool className="w-5 h-5 text-primary" />
                      Escritor con IA
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Tu asistente de escritura personal
                    </p>
                  </div>

                  {/* Toggle Assistant Button (Mobile only or always visible) */}
                  <Button
                    variant={showAssistant ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setShowAssistant(!showAssistant)}
                    className="hidden lg:flex items-center gap-2"
                  >
                    <PanelRight className="w-4 h-4" />
                    {showAssistant ? "Ocultar Asistente" : "Mostrar Asistente"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex-grow container mx-auto px-4 py-6">
              <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">

                {/* MAIN EDITOR AREA (Left/Center) */}
                <div className={`space-y-6 transition-all duration-300 ${showAssistant ? 'lg:col-span-8' : 'lg:col-span-12'}`}>

                  {error && (
                    <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 flex items-start justify-between shadow-sm">
                      <div className="flex gap-3">
                        <AlertCircle className="w-5 h-5 mt-0.5" />
                        <p className="font-medium">{error}</p>
                      </div>
                      <button onClick={() => setError(null)} className="p-1 hover:bg-black/5 rounded">✕</button>
                    </div>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-4 p-2 rounded-lg border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 focus-within:border-primary/50 focus-within:bg-zinc-50 dark:focus-within:bg-zinc-900/50 transition-all bg-white dark:bg-zinc-950 shadow-sm">
                      <input
                        id="doc-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="text-2xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 w-full px-2"
                        placeholder="Título del documento..."
                      />
                    </div>
                  </div>

                  <Card className="border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden h-full min-h-[600px]">
                    {/* Main Editor Component with Agent Mode */}
                    <EnhancedAIWriterEditor
                      content={content}
                      onContentChange={setContent}
                      onImprove={handleImprove} // Connect directly to our main improve handler
                      onSave={handleSave}
                      onCopy={() => {
                        window.navigator.clipboard.writeText(content);
                        toast.success("Contenido copiado al portapapeles");
                      }}
                      onOpenSettings={() => setIsSettingsOpen(true)}
                      isProcessing={isProcessing}
                      isSaving={isSaving}
                      usageInfo={subscriptionInfo}

                      // Agent Mode Props
                      enableAgentMode={settings?.agentModeEnabled ?? true}
                      enableRealTimeAnalysis={true}

                      // Handle agent mode activation changes
                      onAgentModeChange={(isActive) => {
                        // Optional: Sync with local state if needed
                        // console.log("Agent Mode:", isActive);
                      }}
                    />
                  </Card>

                  {/* Document List (Mobile/Small screens only, or moved to bottom) */}
                  <div className="lg:hidden mt-8">
                    {/* Lista de documentos duplicada para móvil si es necesario */}
                  </div>
                </div>

                {/* SIDEBAR ASSISTANT (Right) */}
                {showAssistant && (
                  <div className="lg:col-span-4 space-y-6 flex flex-col h-full">

                    {/* ASSISTANT PANEL */}
                    <WriterAssistantPanel
                      seoScore={seoScore}
                      aiRisk={aiRisk}
                      keywords={keywords}
                      isAnalyzing={isAnalyzing}
                      wordCount={content.split(/\s+/).length}
                      readabilityScore={75} // Placeholder
                    />

                    {/* DOCUMENT LIST (Moved to sidebar in Desktop) */}
                    <Card className="border-zinc-200 dark:border-zinc-800 flex-grow max-h-[400px] flex flex-col">
                      <CardHeader className="pb-3 px-4 py-3 border-b bg-muted/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <History className="w-4 h-4 text-primary" />
                            <CardTitle className="text-xs font-bold uppercase tracking-wider">Historial</CardTitle>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={createNewDocument}
                            className="h-7 px-2 text-xs gap-1 hover:bg-primary/10 hover:text-primary"
                          >
                            <PenTool className="w-3 h-3" /> Nuevo
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0 flex-grow overflow-hidden">
                        {isLoadingDocs ? (
                          <div className="flex justify-center py-8">
                            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                          </div>
                        ) : savedDocuments.length > 0 ? (
                          <div className="overflow-y-auto h-full p-2 custom-scrollbar">
                            {savedDocuments.map((doc) => (
                              <div key={doc.id} className="group p-2 rounded-md border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-all mb-1 cursor-pointer" onClick={() => loadDocument(doc.id)}>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium line-clamp-1 flex-grow">{doc.title}</span>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); confirmDeleteDocument(doc); }}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-red-500 transition-all"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                  {new Date(doc.updated_at).toLocaleDateString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-muted-foreground text-xs">
                            Sin documentos guardados
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}

              </div>
            </div>

            <Footer />

            <SettingsPanel
              isOpen={isSettingsOpen}
              onClose={() => setIsSettingsOpen(false)}
              onSettingsChange={handleSettingsChange}
            />

            <DeleteConfirmationModal
              isOpen={isDeleteModalOpen}
              onClose={() => setIsDeleteModalOpen(false)}
              onConfirm={() => docToDelete && deleteDocument(docToDelete.id)}
              itemName={docToDelete?.title}
            />
          </div>
        </ProtectedRoute>
      </LanguageProvider>
    </WorkingClientLayout>
  );
}

export default EscritorIAPage;
