"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useRouter } from "next/navigation";
import AIWriterEditor from "./components/AIWriterEditor";
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
  ExternalLink
} from "lucide-react";
import { useOpenRouterSync } from "../hooks/useOpenRouterSync";
import { useSubscription } from "../hooks/useSubscription";
import { toast } from "sonner";

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [savedDocuments, setSavedDocuments] = useState<SavedDocument[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);

  const { openRouterApiKey, openRouterModel, geminiApiKey } = useOpenRouterSync();
  const { subscriptionData, loading: subLoading } = useSubscription();
  const [subscriptionInfo, setSubscriptionInfo] = useState<{
    usage: number;
    limit: number;
    isPremium: boolean;
  } | null>(null);

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
          isPremium: !!subscriptionData?.isPremium
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
      const res = await fetch('/api/documents', {
        method: 'POST',
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
          toast.success("Documento guardado correctamente");
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
        toast.success("Documento cargado");
      }
    } catch (err) {
      toast.error("Error al cargar el documento");
    }
  };

  const deleteDocument = async (docId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este documento?")) return;
    
    try {
      const res = await fetch(`/api/documents/${docId}`, {
        method: 'DELETE',
        headers: { 'x-user-uid': userId || '' }
      });
      if (res.ok) {
        setSavedDocuments(prev => prev.filter(d => d.id !== docId));
        toast.success("Documento eliminado");
      }
    } catch (err) {
      toast.error("Error al eliminar");
    }
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
              

              <div className="bg-zinc-50 dark:bg-zinc-900/50 border-b">
              <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black text-sm font-medium mb-8">
                    <PenTool className="w-4 h-4" />
                    <span>Escritor IA</span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                    Potencia tu Escritura con IA
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Escribe, edita y guarda tus documentos de forma segura en la nube.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-grow container mx-auto px-4 py-12">
              <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                <div className="lg:col-span-3 space-y-6">
                  {error && (
                    <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 flex items-start justify-between shadow-sm">
                      <div className="flex gap-3">
                        <AlertCircle className="w-5 h-5 mt-0.5" />
                        <p className="font-medium">{error}</p>
                      </div>
                      <button onClick={() => setError(null)} className="p-1 hover:bg-black/5 rounded">✕</button>
                    </div>
                  )}

                  <div className="flex items-center gap-4 mb-2">
                    <input 
                      type="text" 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)}
                      className="text-2xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 w-full"
                      placeholder="Título del documento..."
                    />
                  </div>

                  <Card className="border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden">
                    <AIWriterEditor
                      content={content}
                      onContentChange={setContent}
                      onImprove={handleImprove}
                      onSave={handleSave}
                      onCopy={handleCopy}
                      onOpenSettings={handleOpenSettings}
                      isProcessing={isProcessing}
                      isSaving={isSaving}
                      usageInfo={subscriptionInfo}
                    />
                  </Card>
                </div>

                <div className="lg:col-span-1 space-y-6">
                  <Card className="border-zinc-200 dark:border-zinc-800">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <History className="w-4 h-4 text-primary" />
                        <CardTitle className="text-sm font-bold uppercase tracking-wider">Documentos Guardados</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {isLoadingDocs ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                        </div>
                      ) : savedDocuments.length > 0 ? (
                        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                          {savedDocuments.map((doc) => (
                            <div key={doc.id} className="group p-3 rounded-lg border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-all">
                              <div className="flex items-start justify-between gap-2">
                                <button 
                                  onClick={() => loadDocument(doc.id)}
                                  className="text-sm font-medium text-left hover:text-primary transition-colors line-clamp-2 flex-grow"
                                >
                                  {doc.title}
                                </button>
                                <button 
                                  onClick={() => deleteDocument(doc.id)}
                                  className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-red-500 transition-all"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-1">
                                {new Date(doc.updated_at).toLocaleDateString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                          <div className="text-center py-8 px-4 border-2 border-dashed rounded-xl border-zinc-100 dark:border-zinc-800">
                            <Info className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                            <p className="text-xs text-muted-foreground">Aún no has guardado ningún documento.</p>
                          </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-primary/5 border-primary/10">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px]">NUEVO</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Tus documentos se sincronizan automáticamente, permitiéndote acceder a ellos desde cualquier dispositivo.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            <Footer />

            <SettingsPanel
              isOpen={isSettingsOpen}
              onClose={() => setIsSettingsOpen(false)}
              onSettingsChange={handleSettingsChange}
            />
          </div>
        </ProtectedRoute>
      </LanguageProvider>
    </WorkingClientLayout>
  );
}

export default EscritorIAPage;
