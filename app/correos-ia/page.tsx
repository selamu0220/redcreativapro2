'use client';

// Force dynamic rendering - this page requires authentication
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "../components/ProtectedRoute";
import GuestTrialInterface from "../components/GuestTrialInterface";
import ContactSelector from "../components/ContactSelector";
import { useSimpleTranslations } from "@/app/lib/simple-translations";
import { useLocalization } from "../contexts/LocalizationContext";
import { SimpleMainNavigation } from "../components/SimpleMainNavigation";
import Footer from "../components/Footer";

import { useAuth } from '../hooks/useAuth';
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';

import { useGuestTrial } from "../hooks/useGuestTrial";
import { useViewport } from "../hooks/useViewport";
import { useOpenRouterSync } from "../hooks/useOpenRouterSync";
import { getValidatedOpenRouterConfig } from '../utils/openrouter-validator';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Mail, Settings, Send, Loader2, Sparkles, User, Info, ArrowRight, AlertCircle } from "lucide-react";
import WorkingClientLayout from "../components/WorkingClientLayout";
import { LanguageProvider } from "../lib/language/context";
import { DEFAULT_LANGUAGE } from "../lib/language/config";

interface UserData {
  email: string;
  subscriptionStatus: 'free' | 'trial' | 'pro' | 'premium';
  subscriptionId?: string;
  customerId?: string;
  trialStartDate?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  aiStudioApiKey?: string;
  createdAt: string;
  lastActiveAt: string;
}

function CorreosIAPageContent() {
  const { t } = useSimpleTranslations();
  const { user, logout, isLoading: authLoading } = useAuth();
  const { get: authenticatedGet } = useAuthenticatedFetch();

  // Localization hooks
  const { country, currency, language, isLatinAmerica, config } = useLocalization();

  const { isTrialActive, canStartTrial, stopGuestTrial } = useGuestTrial();
  const [userData, setUserData] = useState<UserData | null>(null);

  // Estados para generacion de emails individuales
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [purpose, setPurpose] = useState("");
  const [context, setContext] = useState("");
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const [isLoadingContactData, setIsLoadingContactData] = useState(false);
  const [isContextExpanded, setIsContextExpanded] = useState(false);
  
  // Estados para mostrar correos recopilados
  const [collectedEmails, setCollectedEmails] = useState<any[]>([]);
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  const [showEmailsList, setShowEmailsList] = useState(false);

  // Hook de sincronización de OpenRouter
  const {
    openRouterModel,
    isClient
  } = useOpenRouterSync();
  
  const setOpenRouterModel = (model: string) => {
    // Model setter implementation
  };
  
  // Alias para compatibilidad con código existente
  const aiModel = openRouterModel;
  const setAiModel = setOpenRouterModel;

  // Modelos disponibles
  const availableModels = [
    { id: 'openai/gpt-4o', name: 'GPT-4o', description: 'Modelo ultra-rápido y ligero (recomendado)' },
    { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', description: 'Modelo económico y eficiente' },
    { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Modelo avanzado para tareas complejas' },
    { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', description: 'Modelo de Google vía OpenRouter' },
    { id: 'meta-llama/llama-3.1-8b-instruct', name: 'Llama 3.1 8B', description: 'Modelo open source rápido' }
  ];

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const recipientParam = urlParams.get('recipient');
    if (recipientParam) {
      setRecipient(recipientParam);
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  const [lastError, setLastError] = useState<{
    message: string;
    type?: string;
    retryable?: boolean;
    timestamp: number;
    suggestedRetryDelay?: number;
  } | null>(null);

  const [retryCount, setRetryCount] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const [requestInProgress, setRequestInProgress] = useState(false);
  const [showErrorBanner, setShowErrorBanner] = useState(false);

  const [currentGreeting, setCurrentGreeting] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>('');

  const showUserFriendlyError = (error: any, contextStr: string = 'operación') => {
    let title = 'Error';
    let message = 'Ha ocurrido un error inesperado';
    let actionText = 'Intentar de nuevo';
    let isRetryable = true;
    
    const isQuotaError = error.status === 429 || 
                        error.name === 'RateLimitError' ||
                        error.message?.includes('429') ||
                        error.message?.includes('Too Many Requests') ||
                        error.message?.includes('quota') ||
                        error.message?.includes('QUOTA_EXCEEDED') ||
                        error.message?.includes('rate limit') ||
                        error.message?.includes('límite de peticiones') ||
                        (error.details && error.details.errorType === 'QUOTA_EXCEEDED');
    
    if (isQuotaError) {
      title = '🚫 Cuota de API Agotada';
      message = `Has alcanzado el límite de uso de la API de OpenRouter. Esto es temporal y se restablecerá automáticamente.`;
      actionText = 'Esperar y reintentar';
      
      if (error.maxRetriesReached && error.retriesAttempted) {
        message += ` El sistema intentó ${error.retriesAttempted} veces automáticamente.`;
      }
      
      if (error.retryAfter) {
        const waitMinutes = Math.ceil(error.retryAfter / 60000);
        message += ` Tiempo de espera sugerido: ${waitMinutes} minuto${waitMinutes > 1 ? 's' : ''}.`;
      } else {
        message += ` Intenta de nuevo en unos minutos.`;
      }
      
      message += `\n\n💡 Sugerencias:\n• Espera 5-10 minutos antes de intentar de nuevo\n• Si persiste, verifica tu cuota en Google AI Studio\n• Considera usar una API key diferente si tienes una\n• Las cuotas se renuevan cada 24 horas`;
    } else if (error.status === 401 || error.status === 403) {
      title = 'Error de autenticación';
      message = 'Problema con la autenticación de la API. Verifica tu API key de OpenRouter en Ajustes y asegúrate de que sea válida.';
      actionText = 'Ir a Ajustes';
      isRetryable = false;
    } else if (error.status === 400) {
      title = 'Solicitud inválida';
      message = 'Los datos enviados no son válidos. Verifica que todos los campos estén completos y sean correctos.';
      isRetryable = false;
    } else if (error.status >= 500 && error.status < 600) {
      title = 'Error del servidor';
      message = 'Error en el servidor de OpenRouter. El sistema reintentará automáticamente.';
    } else if (error.message?.includes('timeout') || error.message?.includes('network') || error.message?.includes('fetch')) {
      title = 'Error de conexión';
      message = 'Problema de conexión a internet. Verifica tu conexión e intenta de nuevo.';
    } else {
      message = error.message || `Error al realizar la ${contextStr}. Intenta de nuevo.`;
      if (error.details && error.details.error) {
        message = error.details.error;
      }
    }
    
    setLastError({
      message: `${title}: ${message}`,
      type: error.status === 429 ? 'rate_limit' : (error.status >= 400 && error.status < 500) ? 'client' : 'server',
      retryable: isRetryable,
      timestamp: Date.now(),
      suggestedRetryDelay: error.retryAfter || 5000
    });
    
    setShowErrorBanner(true);
    setTimeout(() => {
      setShowErrorBanner(false);
    }, 8000);
    
    return { title, message, actionText, isRetryable };
  };

  const dismissError = () => {
    setShowErrorBanner(false);
    setLastError(null);
  };

  const emailPurposes = [
    "Solicitud de informacion",
    "Propuesta comercial",
    "Seguimiento de cliente",
    "Agradecimiento",
    "Disculpa o resolucion de problema",
    "Invitacion a evento",
    "Recordatorio",
    "Presentacion de servicios",
    "Solicitud de reunion",
    "Otro",
  ];

  useEffect(() => {
    if (authLoading || isInitializing) return;
    if (user?.email && user) {
      fetch(`/api/users/${encodeURIComponent(user.email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(async response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const dbUser = await response.json();
          setUserData(dbUser);
        })
        .catch(() => setUserData(null));
    } else {
      setUserData(null);
    }
  }, [user?.email, authLoading, isInitializing, user]);

  const updateGreeting = () => {
    const now = new Date();
    const hour = now.getHours();
    const timeString = now.toLocaleTimeString('es-ES', { hour12: false });
    
    let greeting = '';
    if (hour >= 6 && hour < 12) {
      greeting = 'Buenos días';
    } else if (hour >= 12 && hour < 20) {
      greeting = 'Buenas tardes';
    } else {
      greeting = 'Buenas noches';
    }
    
    setCurrentTime(timeString);
    setCurrentGreeting(greeting);
  };

  useEffect(() => {
    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user?.email && !authLoading && !isInitializing && user) {
      authenticatedGet(`/api/email-collection/${encodeURIComponent(user.email)}/export?format=json`)
        .then(responseData => {
          const emails = responseData.emails || [];
          setCollectedEmails(emails);
        })
        .catch(error => {
          if (error.status !== 404 && error.status !== 403) {
            console.error("Error loading collected emails:", error.message);
          }
          setCollectedEmails([]);
        });
    }
  }, [user?.email, authLoading, isInitializing, user, authenticatedGet]);

  const importContactData = async () => {
    if (!recipient) {
      toast.error('Destinatario requerido', {
        description: 'Por favor selecciona un destinatario primero'
      });
      return;
    }

    if (!user || authLoading || isInitializing) {
      toast.warning('Autenticación en progreso', {
        description: 'Por favor espera a que se complete la autenticación'
      });
      return;
    }

    setIsLoadingContactData(true);
    try {
      const responseData = await authenticatedGet(`/api/email-collection/${encodeURIComponent(user.email)}/export?format=json`);
      const emails = responseData.emails || [];
      const contactData = emails.find((email: any) => email.email === recipient);
      
      if (contactData) {
        let contextText = "📧 INFORMACIÓN DEL CONTACTO:\n\n";
        contextText += `📍 Email: ${contactData.email}\n`;
        
        if (contactData.collectedAt) {
          const date = new Date(contactData.collectedAt).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
          contextText += `📅 Fecha de registro: ${date}\n`;
        }
        
        if (contactData.source) contextText += `🔗 Fuente: ${contactData.source}\n`;
        if (contactData.ipAddress) contextText += `🌐 IP: ${contactData.ipAddress}\n`;
        
        if (contactData.customFields && Object.keys(contactData.customFields).length > 0) {
          contextText += "\n📋 DATOS DEL CUESTIONARIO:\n";
          Object.entries(contactData.customFields).forEach(([key, value]) => {
            const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            contextText += `• ${formattedKey}: ${value}\n`;
          });
        }
        
        setContext(contextText);
        toast.success('Datos importados exitosamente');
      } else {
        toast.error('Contacto no encontrado');
      }
    } catch (error: any) {
      if (error.status !== 404 && error.status !== 403) {
        console.error("Error importing contact data:", error.message);
        toast.error('Error al importar datos');
      }
    } finally {
      setIsLoadingContactData(false);
    }
  };

  const loadCollectedEmails = async () => {
    if (!user?.email || !user || authLoading || isInitializing) return;
    setIsLoadingEmails(true);
    try {
      const responseData = await authenticatedGet(`/api/email-collection/${encodeURIComponent(user.email)}/export?format=json`);
      setCollectedEmails(responseData.emails || []);
      setShowEmailsList(true);
    } catch (error: any) {
      if (error.status !== 404 && error.status !== 403) {
        console.error("Error loading collected emails:", error.message);
        toast.error('Error al cargar correos');
      }
    } finally {
      setIsLoadingEmails(false);
    }
  };

  const selectEmailFromList = (email: string) => {
    setRecipient(email);
    setShowEmailsList(false);
  };

  const checkRateLimit = () => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    const minInterval = 2000;
    if (timeSinceLastRequest < minInterval) return { allowed: false, waitTime: minInterval - timeSinceLastRequest };
    return { allowed: true };
  };

  const retryWithBackoff = async (fn: () => Promise<any>, attempt: number = 1, maxAttempts: number = 3): Promise<any> => {
    try {
      return await fn();
    } catch (error: any) {
      const is429Error = error.status === 429 || error.name === 'RateLimitError' || error.message?.includes('429');
      if (is429Error && attempt < maxAttempts) {
        const delay = Math.min(error.retryAfter || (3000 * Math.pow(2, attempt - 1)), 60000);
        await new Promise(resolve => setTimeout(resolve, delay));
        return retryWithBackoff(fn, attempt + 1, maxAttempts);
      }
      throw error;
    }
  };

  const generateEmail = async () => {
    if (!user || authLoading) return;
    if (!recipient || !subject || !purpose) {
      toast.error('Campos requeridos');
      return;
    }
    if (requestInProgress) return;

    const rateLimitCheck = checkRateLimit();
    if (!rateLimitCheck.allowed) {
      toast.warning('Límite de velocidad');
      return;
    }

    setRequestInProgress(true);
    setIsGenerating(true);
    setLastError(null);
    setLastRequestTime(Date.now());

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000);

    try {
      const makeApiRequest = async () => {
        const openRouterConfig = getValidatedOpenRouterConfig();
        const { apiKey: userApiKey, temperature: userTemperature, maxTokens: userMaxTokens } = openRouterConfig;
        
        const customHeaders: Record<string, string> = {
          "Content-Type": "application/json",
          "x-user-email": user?.email || "",
          "x-model": aiModel,
          "x-temperature": userTemperature.toString(),
          "x-max-tokens": userMaxTokens.toString()
        };
        if (userApiKey) customHeaders["x-api-key"] = userApiKey;
        
        const response = await fetch('/api/generate-email', {
          method: 'POST',
          headers: customHeaders,
          body: JSON.stringify({
            recipient, subject, purpose, context,
            localization: { country, language, currency, isLatinAmerica, timezone: config.timezone, locale: config.locale }
          }),
          signal: controller.signal
        });

        if (!response.ok) throw new Error(`Error ${response.status}`);
        return await response.json();
      };

      const data = await retryWithBackoff(makeApiRequest, 1, 3);
      if (!data?.email) throw new Error("La IA no pudo generar contenido.");
      setGeneratedEmail(data.email);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setLastError({ message: 'Tiempo de espera agotado.', type: 'timeout', retryable: true, timestamp: Date.now() });
      } else {
        showUserFriendlyError(error, 'generación de email');
      }
    } finally {
      clearTimeout(timeoutId);
      setIsGenerating(false);
      setRequestInProgress(false);
    }
  };

  const openGmail = () => {
    if (!generatedEmail || !recipient || !subject) return;
    const gmailLink = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(recipient)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(generatedEmail)}`;
    window.open(gmailLink, '_blank');
  };

  if (authLoading || isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      
      <main className="flex-grow container mx-auto px-4 py-12 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Generador de Correos IA</h1>
            <p className="text-muted-foreground text-lg">Crea campañas de email marketing efectivas con el poder de la inteligencia artificial.</p>
          </div>
          {user && (
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" asChild>
                <Link href={`/correosia/${encodeURIComponent(user.email || '')}/admin`}>Mi Página de Recopilación</Link>
              </Button>
              <Button variant="outline" onClick={logout}>Cerrar Sesión</Button>
            </div>
          )}
        </div>

        {showErrorBanner && lastError && (
          <div className={`mb-8 p-4 rounded-lg border flex items-start justify-between shadow-sm ${
            lastError.type === 'rate_limit' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5" />
              <p className="font-medium">{lastError.message}</p>
            </div>
            <button onClick={dismissError} className="p-1 hover:bg-black/5 rounded">✕</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <Card className="border-zinc-200 dark:border-zinc-800">
              <CardHeader>
                <CardTitle>Configuración del Email</CardTitle>
                <CardDescription>Define los detalles de tu comunicación.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Destinatario *</Label>
                  <ContactSelector value={recipient} onChange={setRecipient} placeholder="Email..." />
                </div>
                <div className="space-y-2">
                  <Label>Asunto *</Label>
                  <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Asunto..." />
                </div>
                <div className="space-y-2">
                  <Label>Propósito *</Label>
                  <Select value={purpose} onValueChange={setPurpose}>
                    <SelectTrigger><SelectValue placeholder="Objetivo..." /></SelectTrigger>
                    <SelectContent>{emailPurposes.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Contexto Adicional</Label>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={loadCollectedEmails}>Ver Correos</Button>
                      <Button variant="ghost" size="sm" onClick={importContactData}>Importar Datos</Button>
                    </div>
                  </div>
                  <Textarea value={context} onChange={(e) => setContext(e.target.value)} placeholder="Detalles..." className="min-h-[120px]" />
                </div>
                <div className="pt-4 border-t">
                  <Label className="mb-3 block text-sm font-semibold">Modelo de IA</Label>
                  <Select value={aiModel} onValueChange={setAiModel}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{availableModels.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={generateEmail} disabled={isGenerating || !recipient || !subject || !purpose} className="w-full gap-2 py-6 text-lg">
                  {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  {isGenerating ? 'Generando...' : 'Generar Email'}
                </Button>
              </CardFooter>
            </Card>
          </div>
          <div className="space-y-8">
            <Card className="border-zinc-200 dark:border-zinc-800 h-full min-h-[600px] flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                <CardTitle>Vista Previa</CardTitle>
                {generatedEmail && <Button variant="outline" size="sm" onClick={openGmail}>Abrir Gmail</Button>}
              </CardHeader>
              <CardContent className="flex-grow pt-6">
                {generatedEmail ? (
                  <div className="whitespace-pre-wrap text-sm leading-relaxed p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border">{generatedEmail}</div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-center py-20">
                    <Mail className="w-16 h-16 mb-4 opacity-20" />
                    <p className="font-medium">Tu email aparecerá aquí</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function CorreosIAPage() {
  return (
    <WorkingClientLayout>
      <LanguageProvider initialLanguage={DEFAULT_LANGUAGE}>
        <ProtectedRoute>
          <CorreosIAPageContent />
        </ProtectedRoute>
      </LanguageProvider>
    </WorkingClientLayout>
  );
}
