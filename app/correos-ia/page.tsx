"use client";

// Force dynamic rendering - this page requires authentication
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "../components/ProtectedRoute";
import GuestTrialInterface from "../components/GuestTrialInterface";
import MobileLayout, { MobileContainer } from "../components/MobileLayout";
import { MobileOptimizedInput, MobileOptimizedTextarea, MobileOptimizedSelect } from "../components/MobileFormOptimizations";
import ContactSelector from "../components/ContactSelector";
import SimpleLanguageToggle from "@/app/components/SimpleLanguageToggle";
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
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Mail, Settings, Send, Loader2, Sparkles, User, Info, ArrowRight } from "lucide-react";


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

function CorreosIAPage() {
  const { t } = useSimpleTranslations();
  const { user, logout, loading: authLoading, isInitializing } = useAuth();
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
    isClient,
    setOpenRouterModel
  } = useOpenRouterSync();
  
  // Alias para compatibilidad con código existente
  const aiModel = openRouterModel;
  const setAiModel = setOpenRouterModel;
  // Usando OpenRouter directamente

  // Modelos disponibles
  const availableModels = [
    { id: 'openai/gpt-4o', name: 'GPT-4o', description: 'Modelo ultra-rápido y ligero (recomendado)' },
    { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', description: 'Modelo económico y eficiente' },
    { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Modelo avanzado para tareas complejas' },
    { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', description: 'Modelo de Google vía OpenRouter' },
    { id: 'meta-llama/llama-3.1-8b-instruct', name: 'Llama 3.1 8B', description: 'Modelo open source rápido' }
  ];

  // Leer parámetro recipient de la URL al cargar la página
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const recipientParam = urlParams.get('recipient');
    if (recipientParam) {
      setRecipient(recipientParam);
      // Limpiar el parámetro de la URL sin recargar la página
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  // Estados para manejo de errores y rate limiting
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





  // Estados para el saludo actual
  const [currentGreeting, setCurrentGreeting] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>('');

  // Función para mostrar errores de manera más amigable
  const showUserFriendlyError = (error: any, context: string = 'operación') => {
    let title = 'Error';
    let message = 'Ha ocurrido un error inesperado';
    let actionText = 'Intentar de nuevo';
    let isRetryable = true;
    
    // Detectar errores de cuota/rate limit de manera más robusta
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
      
      // Agregar información sobre reintentos si está disponible
      if (error.maxRetriesReached && error.retriesAttempted) {
        message += ` El sistema intentó ${error.retriesAttempted} veces automáticamente.`;
      }
      
      // Agregar información específica sobre el tiempo de espera
      if (error.retryAfter) {
        const waitMinutes = Math.ceil(error.retryAfter / 60000);
        message += ` Tiempo de espera sugerido: ${waitMinutes} minuto${waitMinutes > 1 ? 's' : ''}.`;
      } else {
        message += ` Intenta de nuevo en unos minutos.`;
      }
      
      // Agregar sugerencias útiles
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
      message = error.message || `Error al realizar la ${context}. Intenta de nuevo.`;
      if (error.details && error.details.error) {
        message = error.details.error;
      }
    }
    
    // Actualizar el estado del error para mostrar el banner
    setLastError({
      message: `${title}: ${message}`,
      type: error.status === 429 ? 'rate_limit' : (error.status >= 400 && error.status < 500) ? 'client' : 'server',
      retryable: isRetryable,
      timestamp: Date.now(),
      suggestedRetryDelay: error.retryAfter || 5000
    });
    
    setShowErrorBanner(true);
    
    // Auto-ocultar el banner después de un tiempo
    setTimeout(() => {
      setShowErrorBanner(false);
    }, 8000);
    
    return { title, message, actionText, isRetryable };
  };

  // Función para cerrar el banner de error
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

  // Cargar datos del usuario desde la base de datos
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

  // Función para obtener el saludo actual basado en la hora
  const getCurrentGreeting = () => {
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

  // Actualizar saludo cada minuto
  useEffect(() => {
    getCurrentGreeting();
    const interval = setInterval(getCurrentGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  // Cargar correos recopilados automáticamente
  useEffect(() => {
    if (user?.email && !authLoading && !isInitializing && user) {
      // Cargar correos sin mostrar la lista automáticamente
      authenticatedGet(`/api/email-collection/${encodeURIComponent(user.email)}/export?format=json`)
        .then(responseData => {
          const emails = responseData.emails || [];
          setCollectedEmails(emails);
        })
        .catch(error => {
          // Only log non-404 errors to reduce console noise
          if (error.status !== 404 && error.status !== 403) {
            console.error("Error loading collected emails:", error.message);
          }
          // Set empty array on error to prevent UI issues
          setCollectedEmails([]);
        });
    }
  }, [user?.email, authLoading, isInitializing, user, authenticatedGet]);

  // Función para importar datos del contacto
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
      // Buscar datos del contacto en los archivos de emails recopilados
      // Agregar parámetro format=json para obtener respuesta JSON en lugar de CSV
      const responseData = await authenticatedGet(`/api/email-collection/${encodeURIComponent(user.email)}/export?format=json`);
      const collectedEmails = responseData.emails || [];
      
      // Buscar el contacto específico
      const contactData = collectedEmails.find((email: any) => email.email === recipient);
      
      if (contactData) {
        // Formatear toda la información disponible del contacto
        let contextText = "📧 INFORMACIÓN DEL CONTACTO:\n\n";
        
        // Información básica
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
        
        if (contactData.source) {
          contextText += `🔗 Fuente: ${contactData.source}\n`;
        }
        
        if (contactData.ipAddress) {
          contextText += `🌐 IP: ${contactData.ipAddress}\n`;
        }
        
        // Datos del cuestionario si existen
        if (contactData.customFields && Object.keys(contactData.customFields).length > 0) {
          contextText += "\n📋 DATOS DEL CUESTIONARIO:\n";
          Object.entries(contactData.customFields).forEach(([key, value]) => {
            const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            contextText += `• ${formattedKey}: ${value}\n`;
          });
        }
        
        // Información adicional si existe
        if (contactData.timestamp && contactData.timestamp !== contactData.collectedAt) {
          const timestampDate = new Date(contactData.timestamp).toLocaleDateString('es-ES');
          contextText += `\n⏰ Timestamp adicional: ${timestampDate}\n`;
        }
        
        setContext(contextText);
        toast.success('Datos importados exitosamente', {
          description: `Se encontró información completa para: ${contactData.email}`
        });
      } else {
        // Mostrar todos los emails disponibles para ayudar al usuario
        if (collectedEmails.length > 0) {
          const emailList = collectedEmails.map((email: any) => email.email).join(', ');
          toast.error('Contacto no encontrado', {
            description: `No se encontró "${recipient}". Emails disponibles: ${emailList}`
          });
        } else {
          toast.error('Sin correos recopilados', {
            description: 'No se encontraron correos recopilados para este usuario'
          });
        }
      }
    } catch (error: any) {
      // Only log non-404/403 errors to reduce console noise
      if (error.status !== 404 && error.status !== 403) {
        console.error("Error importing contact data:", error.message);
        toast.error('Error al importar datos', {
          description: error.message || 'Error desconocido'
        });
      }
    } finally {
      setIsLoadingContactData(false);
    }
  };

  // Función para cargar todos los correos recopilados
  const loadCollectedEmails = async () => {
    if (!user?.email || !user || authLoading || isInitializing) {
      toast.warning('Autenticación en progreso', {
        description: 'Por favor espera a que se complete la autenticación'
      });
      return;
    }
    
    setIsLoadingEmails(true);
    try {
      const responseData = await authenticatedGet(`/api/email-collection/${encodeURIComponent(user.email)}/export?format=json`);
      const emails = responseData.emails || [];
      setCollectedEmails(emails);
      setShowEmailsList(true);
    } catch (error: any) {
      // Only log non-404/403 errors to reduce console noise
      if (error.status !== 404 && error.status !== 403) {
        console.error("Error loading collected emails:", error.message);
        toast.error('Error al cargar correos', {
          description: error.message || 'Error desconocido'
        });
      } else {
        // For 404/403 errors, just set empty state without showing error toast
        setCollectedEmails([]);
      }
    } finally {
      setIsLoadingEmails(false);
    }
  };

  // Función para seleccionar un email de la lista
  const selectEmailFromList = (email: string) => {
    setRecipient(email);
    setShowEmailsList(false);
  };

  // Función para verificar rate limiting
  const checkRateLimit = (): { allowed: boolean; waitTime?: number } => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    const minInterval = 2000; // Mínimo 2 segundos entre peticiones
    
    if (timeSinceLastRequest < minInterval) {
      return {
        allowed: false,
        waitTime: minInterval - timeSinceLastRequest
      };
    }
    
    return { allowed: true };
  };



  // Función para manejar reintentos con backoff exponencial (mejorada)
  const retryWithBackoff = async (fn: () => Promise<any>, attempt: number = 1, maxAttempts: number = 3): Promise<any> => {
    try {
      return await fn();
    } catch (error: any) {
      console.log(`❌ Intento ${attempt} falló:`, error);
      
      // Verificar si es un error 429 usando el objeto de error mejorado
      const is429Error = error.status === 429 || error.name === 'RateLimitError' || 
                         error.message?.includes('429') || error.message?.includes('Too Many Requests');
      
      if (is429Error && attempt < maxAttempts) {
        // Usar el Retry-After del header si está disponible, sino usar backoff exponencial
        let delay;
        if (error.retryAfter && error.retryAfter > 0) {
          // Usar el tiempo sugerido por el servidor (ya está en ms)
          delay = Math.min(error.retryAfter, 60000); // Máximo 1 minuto
          console.log(`⏳ Usando Retry-After del servidor: ${delay}ms`);
        } else {
          // Calcular delay con backoff exponencial
          const baseDelay = 3000; // 3 segundos base
          const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
          const jitter = Math.random() * 1000; // Agregar jitter para evitar thundering herd
          delay = Math.min(exponentialDelay + jitter, 30000); // Máximo 30 segundos
        }
        
        console.log(`⏳ Error 429 detectado. Esperando ${Math.round(delay)}ms antes del intento ${attempt + 1}...`);
        
        // Mostrar mensaje al usuario con información más detallada
        const waitSeconds = Math.round(delay / 1000);
        setLastError({
          message: `Límite de peticiones alcanzado. Reintentando en ${waitSeconds} segundos... (Intento ${attempt}/${maxAttempts})`,
          type: 'rate_limit',
          retryable: true,
          timestamp: Date.now(),
          suggestedRetryDelay: delay
        });
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return retryWithBackoff(fn, attempt + 1, maxAttempts);
      }
      
      // Verificar otros tipos de errores que podrían ser reintentables
      const isNetworkError = error.message?.includes('network') || error.message?.includes('timeout') || 
                             error.message?.includes('fetch');
      const isServerError = error.status >= 500 && error.status < 600;
      
      if ((isNetworkError || isServerError) && attempt < maxAttempts) {
        // Reintentar errores de red y errores del servidor con un delay menor
        const delay = 2000 * attempt; // 2s, 4s, 6s...
        console.log(`⏳ Error de red/servidor detectado. Esperando ${delay}ms antes del intento ${attempt + 1}...`);
        
        setLastError({
          message: `Error de conexión. Reintentando en ${Math.round(delay / 1000)} segundos... (Intento ${attempt}/${maxAttempts})`,
          type: 'network',
          retryable: true,
          timestamp: Date.now(),
          suggestedRetryDelay: delay
        });
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return retryWithBackoff(fn, attempt + 1, maxAttempts);
      }
      
      // Si no es un error reintentar o ya agotamos los intentos, lanzar el error con contexto adicional
      if (attempt >= maxAttempts) {
        // Preservar la información original del error y agregar contexto de reintentos
        const enhancedError = {
          ...error,
          message: error.message || 'Error en la API de OpenRouter',
          originalError: error,
          retriesAttempted: attempt,
          maxRetriesReached: true,
          lastAttemptTime: new Date().toISOString()
        };
        
        console.error(`❌ Todos los reintentos agotados (${attempt}/${maxAttempts}). Error final:`, enhancedError);
        throw enhancedError;
      }
      
      throw error;
    }
  };

  // Funcion para generar email con IA (mejorada con rate limiting y reintentos)
  const generateEmail = async () => {
    console.log("🤖 Iniciando generación de email...");
    
    // Verificar autenticación antes de continuar
    if (!user || authLoading) {
      toast.warning('Autenticación en progreso', {
        description: 'Por favor espera a que se complete la autenticación'
      });
      return;
    }
    
    // Validar campos requeridos
    if (!recipient || !subject || !purpose) {
      toast.error('Campos requeridos', {
        description: 'Por favor completa todos los campos requeridos'
      });
      return;
    }

    // Verificar si ya hay una petición en progreso
    if (requestInProgress) {
      toast.warning('Generación en progreso', {
        description: 'Ya hay una generación de email en progreso. Por favor espera.'
      });
      return;
    }

    // Verificar rate limiting
    const rateLimitCheck = checkRateLimit();
    if (!rateLimitCheck.allowed) {
      const waitSeconds = Math.ceil(rateLimitCheck.waitTime! / 1000);
      toast.warning('Límite de velocidad', {
        description: `Por favor espera ${waitSeconds} segundos antes de generar otro email.`
      });
      return;
    }

    setRequestInProgress(true);
    setIsGenerating(true);
    setLastError(null);
    setRetryCount(0);
    setLastRequestTime(Date.now());

    console.log("📝 Datos de entrada:", {
      recipient,
      subject,
      purpose,
      contextLength: context?.length,
      userEmail: user?.email
    });

    // Crear AbortController para timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('⏰ TIMEOUT: La petición tardó más de 90 segundos');
      controller.abort();
    }, 90000); // 90 segundos timeout

    try {
      // Función que realiza la petición a la API con timeout
      const makeApiRequest = async () => {
        // Obtener configuración validada de OpenRouter
    const openRouterConfig = getValidatedOpenRouterConfig();
    const { apiKey: userApiKey, temperature: userTemperature, maxTokens: userMaxTokens } = openRouterConfig;

    console.log("🔑 Configuración OpenRouter:", {
          hasApiKey: !!userApiKey,
          model: aiModel, // Usar el modelo seleccionado por el usuario
          temperature: userTemperature,
          maxTokens: userMaxTokens
        });
        
        // Construir headers con toda la configuración
        const customHeaders: Record<string, string> = {
          "x-user-email": user?.email || "",
          "x-model": aiModel, // Usar el modelo seleccionado por el usuario
          "x-temperature": userTemperature,
          "x-max-tokens": userMaxTokens
        };
        
        // Agregar la API key personalizada si está disponible
        if (userApiKey) {
          customHeaders["x-api-key"] = userApiKey;
        }
        
        // Add localization context to the request
        const requestPayload = {
          recipient,
          subject,
          purpose,
          context: context,
          // Regional localization data
          localization: {
            country,
            language,
            currency,
            isLatinAmerica,
            timezone: config.timezone,
            locale: config.locale
          }
        };

        console.log("📤 Enviando request a /api/generate-email:", {
          payload: requestPayload,
          headers: customHeaders
        });

        // Usar fetch directamente con AbortController para timeout
        const response = await fetch('/api/generate-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...customHeaders
          },
          body: JSON.stringify(requestPayload),
          signal: controller.signal
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Error en la respuesta:', errorText);
          throw new Error(`Error ${response.status}: ${errorText}`);
        }

        return await response.json();
      };

      // Ejecutar la petición con reintentos automáticos
      const data = await retryWithBackoff(makeApiRequest, 1, 3);
      
      console.log("📨 Respuesta de la API:", {
        hasEmail: !!data?.email,
        emailLength: data?.email?.length,
        emailPreview: data?.email?.substring(0, 100) + "..."
      });

      if (!data?.email) {
        console.error("❌ La API no devolvió contenido de email");
        throw new Error("La IA no pudo generar contenido para el email. Intenta de nuevo.");
      }

      setGeneratedEmail(data.email);
      setLastError(null); // Limpiar errores previos en caso de éxito
      console.log("✅ Email generado exitosamente");
      
    } catch (error: any) {
      console.error("❌ Error generating email:", error);
      
      // Manejar timeout específicamente
      if (error.name === 'AbortError') {
        console.log('⏰ CONFIRMADO: La petición fue cancelada por timeout');
        setLastError({
          message: 'La generación de email tardó demasiado tiempo (más de 90 segundos). Esto puede deberse a problemas de conectividad o sobrecarga del servidor. Por favor, intenta de nuevo.',
          type: 'timeout',
          retryable: true,
          timestamp: Date.now()
        });
      } else {
        // Usar la nueva función de manejo de errores amigable
        showUserFriendlyError(error, 'generación de email');
      }
      
    } finally {
      // Limpiar el timeout
      clearTimeout(timeoutId);
      setIsGenerating(false);
      setRequestInProgress(false);
    }
  };

  // Función para generar enlace de Gmail
  const generateGmailLink = (to: string, subject: string, body: string) => {
    const encodedTo = encodeURIComponent(to);
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);
    return `https://mail.google.com/mail/?view=cm&to=${encodedTo}&su=${encodedSubject}&body=${encodedBody}`;
  };

  // Función para abrir Gmail
  const openGmail = () => {
    if (!generatedEmail || !recipient || !subject) {
      toast.error('Datos incompletos', {
        description: 'Necesitas generar un email primero'
      });
      return;
    }

    const gmailLink = generateGmailLink(recipient, subject, generatedEmail);
    window.open(gmailLink, '_blank');
    
    toast.success('Gmail abierto', {
      description: 'Se ha abierto Gmail en una nueva pestaña'
    });
  };



  const { isMobile } = useViewport();

  if (!user && !isTrialActive) {
    return (
      <ProtectedRoute>
        <GuestTrialInterface
          toolName="Generador de Correos con IA"
          onClose={() => {
            if (typeof window !== 'undefined') {
              window.location.href = '/dashboard';
            }
          }}
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Generador de Correos con IA</h2>
            <p className="text-gray-300">Crea correos profesionales personalizados usando inteligencia artificial</p>
          </div>
        </GuestTrialInterface>
      </ProtectedRoute>
    );
  }

  // Mostrar estado de carga mientras se autentica
  if (authLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-muted-foreground">Verificando autenticación...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SimpleMainNavigation />

      <main className="flex-grow container mx-auto px-4 py-12 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Generador de Correos IA</h1>
            <p className="text-muted-foreground text-lg">Crea campañas de email marketing efectivas con el poder de la inteligencia artificial.</p>
          </div>
          
          {user && (
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" asChild>
                <Link href={`/correosia/${encodeURIComponent(user.email || '')}/admin`}>
                  Mi Página de Recopilación
                </Link>
              </Button>
              <Button variant="outline" onClick={logout}>Cerrar Sesión</Button>
            </div>
          )}
        </div>

        {/* Error Banner */}
        {showErrorBanner && lastError && (
          <div className={`mb-8 p-4 rounded-lg border flex items-start justify-between shadow-sm ${
            lastError.type === 'rate_limit' 
              ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-900/30 text-yellow-800 dark:text-yellow-400'
              : 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30 text-red-800 dark:text-red-400'
          }`}>
            <div className="flex gap-3">
              {lastError.type === 'rate_limit' ? <Info className="w-5 h-5 mt-0.5" /> : <AlertCircle className="w-5 h-5 mt-0.5" />}
              <div>
                <p className="font-semibold">{lastError.message.split(':')[0]}</p>
                <p className="text-sm opacity-90">{lastError.message.split(':').slice(1).join(':').trim()}</p>
              </div>
            </div>
            <button onClick={dismissError} className="p-1 hover:bg-black/5 rounded">✕</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-8">
            <Card className="border-zinc-200 dark:border-zinc-800">
              <CardHeader>
                <CardTitle>Configuración del Email</CardTitle>
                <CardDescription>Define los detalles de tu comunicación.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Destinatario *</Label>
                  <ContactSelector
                    value={recipient}
                    onChange={setRecipient}
                    placeholder="Buscar contacto o escribir email..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Asunto *</Label>
                  <Input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Escribe el asunto del email"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Propósito *</Label>
                  <Select value={purpose} onValueChange={setPurpose}>
                    <SelectTrigger>
                      <SelectValue placeholder="¿Cuál es el objetivo del email?" />
                    </SelectTrigger>
                    <SelectContent>
                      {emailPurposes.map(p => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Contexto Adicional</Label>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={loadCollectedEmails} disabled={isLoadingEmails}>
                        {isLoadingEmails ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Mail className="w-3 h-3 mr-1" />}
                        Ver Correos ({collectedEmails.length})
                      </Button>
                      {recipient && (
                        <Button variant="ghost" size="sm" onClick={importContactData} disabled={isLoadingContactData}>
                          {isLoadingContactData ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                          Importar Datos
                        </Button>
                      )}
                    </div>
                  </div>
                  <Textarea
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="Detalles específicos para personalizar el email..."
                    className="min-h-[120px]"
                  />
                </div>

                <div className="pt-4 border-t">
                  <Label className="mb-3 block text-sm font-semibold">Modelo de IA</Label>
                  <div className="grid grid-cols-1 gap-3">
                    <Select value={aiModel} onValueChange={setAiModel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableModels.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{model.name}</span>
                              <span className="text-xs text-muted-foreground">{model.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={generateEmail} 
                  disabled={isGenerating || requestInProgress || !recipient || !subject || !purpose}
                  className="w-full gap-2 py-6 text-lg"
                >
                  {isGenerating || requestInProgress ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Sparkles className="w-5 h-5" />
                  )}
                  {isGenerating || requestInProgress ? 'Generando...' : 'Generar Email con IA'}
                </Button>
              </CardFooter>
            </Card>

            {/* Collected Emails List */}
            {showEmailsList && (
              <Card className="border-zinc-200 dark:border-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-lg">Correos Recopilados</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowEmailsList(false)}>✕</Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {collectedEmails.length === 0 ? (
                      <p className="text-center py-8 text-muted-foreground italic">No hay correos recopilados aún.</p>
                    ) : (
                      collectedEmails.map((email, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => selectEmailFromList(email.email)}
                          className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium text-sm">{email.email}</p>
                            <p className="text-xs text-muted-foreground">{new Date(email.collectedAt).toLocaleDateString()}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Preview Section */}
          <div className="space-y-8">
            <Card className="border-zinc-200 dark:border-zinc-800 h-full min-h-[600px] flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                <div>
                  <CardTitle>Vista Previa</CardTitle>
                  <CardDescription>El contenido generado aparecerá aquí.</CardDescription>
                </div>
                {generatedEmail && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={openGmail} className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200">
                      Abrir Gmail
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setGeneratedEmail("")}>Limpiar</Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="flex-grow pt-6">
                {generatedEmail ? (
                  <div className="whitespace-pre-wrap text-sm leading-relaxed p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border">
                    {generatedEmail}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-center py-20">
                    <Mail className="w-16 h-16 mb-4 opacity-20" />
                    <p className="font-medium text-lg">Tu email aparecerá aquí</p>
                    <p className="text-sm max-w-xs mx-auto">Completa el formulario y haz clic en generar para ver la magia de la IA.</p>
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

export default CorreosIAPage;