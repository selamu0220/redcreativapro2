"use client";

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

import { useAuth } from '../hooks/useAuth';
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';

import { useGuestTrial } from "../hooks/useGuestTrial";
import { useViewport } from "../hooks/useViewport";
import { useOpenRouterSync } from "../hooks/useOpenRouterSync";
import { getValidatedOpenRouterConfig } from '../utils/openrouter-validator';
import { toast } from 'sonner';


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
    <ProtectedRoute>
      <MobileLayout>
        <MobileContainer>

          <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-16 max-w-screen-2xl items-center">
                <div className="flex items-center space-x-4">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center space-x-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Dashboard</span>
                  </Link>
                  <div className="h-6 w-px bg-border" />
                  <h1 className="text-xl font-semibold">
                    Generador de Correos IA
                  </h1>
                </div>
                <div className="flex flex-1 items-center justify-end space-x-4">
                  {user ? (
                    <>
                      <span className="text-sm text-muted-foreground">{user.email}</span>
                      <Link
                        href={`/correosia/${encodeURIComponent(user.email || '')}/admin`}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-3"
                      >
                        Mi Página de Recopilación
                      </Link>
                      <button
                        onClick={logout}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                      >
                        Cerrar Sesion
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        Modo Prueba
                      </span>
                      <button
                        onClick={stopGuestTrial}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                      >
                        Salir
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* Error Banner */}
            {showErrorBanner && lastError && (
              <div className="sticky top-16 z-30 mx-auto max-w-screen-2xl px-4 py-2">
                <div className={`p-4 rounded-lg border shadow-lg ${
                  lastError.type === 'rate_limit' 
                    ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
                    : lastError.type === 'client'
                    ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                    : lastError.type === 'server'
                    ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800'
                    : 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                        lastError.type === 'rate_limit'
                          ? 'bg-yellow-100 dark:bg-yellow-800'
                          : lastError.type === 'client'
                          ? 'bg-red-100 dark:bg-red-800'
                          : lastError.type === 'server'
                          ? 'bg-orange-100 dark:bg-orange-800'
                          : 'bg-blue-100 dark:bg-blue-800'
                      }`}>
                        <svg className={`w-4 h-4 ${
                          lastError.type === 'rate_limit'
                            ? 'text-yellow-600 dark:text-yellow-300'
                            : lastError.type === 'client'
                            ? 'text-red-600 dark:text-red-300'
                            : lastError.type === 'server'
                            ? 'text-orange-600 dark:text-orange-300'
                            : 'text-blue-600 dark:text-blue-300'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {lastError.type === 'rate_limit' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                          ) : lastError.type === 'client' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          ) : lastError.type === 'server' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          )}
                        </svg>

                        {/* Current Greeting Info */}
                        <div className="p-3 rounded-md bg-muted/50 border border-green-200 dark:border-green-800 mb-4">
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">
                                Saludo actual: {currentGreeting}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Hora: {currentTime} - El email usará este saludo automáticamente
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${
                          lastError.type === 'rate_limit'
                            ? 'text-yellow-800 dark:text-yellow-200'
                            : lastError.type === 'client'
                            ? 'text-red-800 dark:text-red-200'
                            : lastError.type === 'server'
                            ? 'text-orange-800 dark:text-orange-200'
                            : 'text-blue-800 dark:text-blue-200'
                        }`}>
                          {lastError.message.split(':')[0]}
                        </p>
                        <p className={`text-sm mt-1 ${
                          lastError.type === 'rate_limit'
                            ? 'text-yellow-700 dark:text-yellow-300'
                            : lastError.type === 'client'
                            ? 'text-red-700 dark:text-red-300'
                            : lastError.type === 'server'
                            ? 'text-orange-700 dark:text-orange-300'
                            : 'text-blue-700 dark:text-blue-300'
                        }`}>
                          {lastError.message.split(':').slice(1).join(':').trim()}
                        </p>
                        {lastError.suggestedRetryDelay && (
                          <p className={`text-xs mt-2 ${
                            lastError.type === 'rate_limit'
                              ? 'text-yellow-600 dark:text-yellow-400'
                              : lastError.type === 'client'
                              ? 'text-red-600 dark:text-red-400'
                              : lastError.type === 'server'
                              ? 'text-orange-600 dark:text-orange-400'
                              : 'text-blue-600 dark:text-blue-400'
                          }`}>
                            💡 Reintento automático en {Math.ceil(lastError.suggestedRetryDelay / 1000)} segundos
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={dismissError}
                      className={`flex-shrink-0 p-1 rounded-md transition-colors ${
                        lastError.type === 'rate_limit'
                          ? 'text-yellow-600 hover:bg-yellow-100 dark:text-yellow-400 dark:hover:bg-yellow-800'
                          : lastError.type === 'client'
                          ? 'text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-800'
                          : lastError.type === 'server'
                          ? 'text-orange-600 hover:bg-orange-100 dark:text-orange-400 dark:hover:bg-orange-800'
                          : 'text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-800'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Main Content */}
            <main className="container max-w-screen-2xl py-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Form Section */}
                <div className="space-y-6">
                  <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                    <div className="p-6">
                      <h2 className="text-2xl font-semibold leading-none tracking-tight mb-6">
                        Generar Email con IA
                      </h2>
                      
                      <div className="space-y-4">
                        {/* Recipient */}
                        <div>
                          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Destinatario *
                          </label>
                          <ContactSelector
                            value={recipient}
                            onChange={setRecipient}
                            placeholder="Buscar contacto o escribir email..."
                            className="mt-1"
                          />
                        </div>

                        {/* Subject */}
                        <div>
                          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Asunto *
                          </label>
                          <MobileOptimizedInput
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Escribe el asunto del email"
                            required
                          />
                        </div>

                        {/* Purpose */}
                        <div>
                          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Proposito del Email *
                          </label>
                          <MobileOptimizedSelect
                            value={purpose}
                            onChange={(value) => setPurpose(value)}
                            options={[
                              { value: '', label: 'Cual es el objetivo del email?' },
                              ...emailPurposes.map(p => ({
                                value: p,
                                label: `${p}`
                              }))
                            ]}
                            placeholder="Cual es el objetivo del email?"
                          />
                        </div>

                        {/* Context */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              Contexto Adicional
                              <span className="text-xs text-muted-foreground ml-2">
                                ({context.length} caracteres)
                              </span>
                            </label>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setIsContextExpanded(!isContextExpanded)}
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-7 px-2"
                              >
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isContextExpanded ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                                </svg>
                                {isContextExpanded ? 'Contraer' : 'Expandir'}
                              </button>
                              <button
                                onClick={loadCollectedEmails}
                                disabled={isLoadingEmails}
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-7 px-2"
                              >
                                {isLoadingEmails ? (
                                  <>
                                    <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin mr-1"></div>
                                    Cargando...
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Ver Correos ({collectedEmails.length})
                                  </>
                                )}
                              </button>
                              {recipient && (
                                <button
                                  onClick={importContactData}
                                  disabled={isLoadingContactData}
                                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-7 px-2"
                                >
                                  {isLoadingContactData ? (
                                    <>
                                      <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin mr-1"></div>
                                      Importando...
                                    </>
                                  ) : (
                                    <>
                                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                      </svg>
                                      Importar Datos
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                          <MobileOptimizedTextarea
                            value={context}
                            onChange={(e) => setContext(e.target.value)}
                            placeholder="Información adicional que ayude a personalizar el email...\n\nEjemplos:\n• Detalles sobre el producto o servicio\n• Historial de interacciones previas\n• Preferencias del cliente\n• Contexto específico de la situación\n\nTip: Usa el botón 'Importar Datos' para cargar automáticamente la información del cuestionario del contacto"
                            rows={isContextExpanded ? 8 : 4}
                            className={`transition-all duration-200 ${isContextExpanded ? 'min-h-[200px]' : ''}`}
                          />
                          {context && (
                            <div className="mt-2 flex justify-end">
                              <button
                                onClick={() => setContext('')}
                                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                              >
                                Limpiar contexto
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Lista de correos recopilados */}
                        {showEmailsList && (
                          <div className="border rounded-lg p-4 bg-muted/50">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="text-sm font-medium flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Correos Recopilados ({collectedEmails.length})
                              </h3>
                              <button
                                onClick={() => setShowEmailsList(false)}
                                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                              >
                                ✕ Cerrar
                              </button>
                            </div>
                            
                            {collectedEmails.length === 0 ? (
                              <p className="text-sm text-muted-foreground text-center py-4">
                                📭 No hay correos recopilados aún
                              </p>
                            ) : (
                              <div className="space-y-2 max-h-60 overflow-y-auto">
                                {collectedEmails.map((email, index) => (
                                  <div
                                    key={`email-${email.email}-${index}`}
                                    className="flex items-center justify-between p-3 bg-background rounded border hover:bg-accent/50 transition-colors cursor-pointer"
                                    onClick={() => selectEmailFromList(email.email)}
                                  >
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium truncate">{email.email}</span>
                                        {email.customFields && Object.keys(email.customFields).length > 0 && (
                                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                                            📋 Con datos
                                          </span>
                                        )}
                                      </div>
                                      {email.collectedAt && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                          📅 {new Date(email.collectedAt).toLocaleDateString('es-ES', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </p>
                                      )}
                                    </div>
                                    <button
                                      className="ml-2 px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        selectEmailFromList(email.email);
                                      }}
                                    >
                                      Seleccionar
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* AI Model & API Configuration - Integrated Section */}
                        <div className="border rounded-lg p-4 bg-muted/30">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                              <h3 className="text-lg font-semibold text-foreground">
                                Modelo de IA & Configuración
                              </h3>
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-muted text-muted-foreground font-medium border border-border">
                                ✓ Listo para usar
                              </span>
                            </div>
                            <Link
                              href="/ajustes"
                              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-8 px-3"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              Configuración Avanzada
                            </Link>
                          </div>
                          
                          {/* Model Selector */}
                          <div className="mb-4">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block">
                              Seleccionar Modelo de IA
                            </label>
                            <select
                              value={aiModel}
                              onChange={(e) => setAiModel(e.target.value)}
                              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-medium"
                            >
                              {availableModels.map((model) => (
                                <option key={model.id} value={model.id}>
                                  {model.name}
                                </option>
                              ))}
                            </select>
                            <div className="flex items-center mt-2 p-2 bg-muted/50 rounded-md">
                              <svg className="w-4 h-4 text-primary mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <p className="text-xs text-muted-foreground">
                                {availableModels.find(m => m.id === aiModel)?.description || 'Selecciona el modelo de IA para generar el email'}
                              </p>
                            </div>
                          </div>
                          
                        </div>

                        {/* Error Display */}
                        {lastError && lastError.type !== 'rate_limit' && (
                          <div className={`p-3 rounded-md border ${
                            lastError.type === 'network' 
                              ? 'bg-muted border-orange-200 dark:border-orange-800'
                              : lastError.type === 'api_error'
                              ? 'bg-muted border-destructive dark:border-red-800'
                              : 'bg-muted border-border'
                          }`}>
                            <div className="flex items-start space-x-2">
                              <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                                lastError.type === 'network'
                                  ? 'text-orange-600 dark:text-orange-400'
                                  : lastError.type === 'api_error'
                                  ? 'text-destructive'
                                  : 'text-muted-foreground'
                              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {lastError.type === 'network' ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                                ) : (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                )}
                              </svg>
                              <div className="flex-1">
                                <p className={`text-sm font-medium ${
                                  lastError.type === 'network'
                                    ? 'text-orange-800 dark:text-orange-200'
                                    : lastError.type === 'api_error'
                                    ? 'text-destructive'
                                    : 'text-foreground'
                                }`}>
                                  {lastError.type === 'network' 
                                    ? 'Problema de conexión'
                                    : lastError.type === 'api_error'
                                    ? 'Error del servicio de IA'
                                    : 'Error al generar el email'
                                  }
                                </p>
                                <p className={`text-sm mt-1 ${
                                  lastError.type === 'network'
                                    ? 'text-orange-700 dark:text-orange-300'
                                    : lastError.type === 'api_error'
                                    ? 'text-destructive/90'
                                    : 'text-muted-foreground'
                                }`}>
                                  {lastError.message}
                                </p>
                                {lastError.suggestedRetryDelay && (
                                  <p className={`text-xs mt-2 ${
                                    lastError.type === 'network'
                                      ? 'text-orange-600 dark:text-orange-400'
                                      : lastError.type === 'api_error'
                                      ? 'text-destructive'
                                      : 'text-muted-foreground'
                                  }`}>
                                    💡 Sugerencia: Intenta nuevamente en {Math.ceil(lastError.suggestedRetryDelay / 1000)} segundos
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Rate Limit Warning */}
                        {lastError && lastError.type === 'rate_limit' && (
                          <div className="p-3 rounded-md bg-muted border border-yellow-200 dark:border-yellow-800">
                            <div className="flex items-start space-x-2">
                              <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                              </svg>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">
                                  Límite de peticiones alcanzado
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {lastError.message}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Generate Button */}
                        <button
                          onClick={generateEmail}
                          disabled={isGenerating || requestInProgress || !recipient || !subject || !purpose}
                          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                        >
                          {isGenerating || requestInProgress ? (
                            <>
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                              <span>
                                {lastError?.type === 'rate_limit' ? 'Reintentando...' : 'Generando con IA...'}
                              </span>
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                              <span>Generar Email con IA</span>
                            </>
                          )}
                        </button>

                        {/* Progress Indicator */}
                        {(isGenerating || requestInProgress) && (
                          <div className="mt-2 p-3 rounded-md bg-muted border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">
                                  {lastError?.type === 'rate_limit' ? 'Manejando límite de peticiones...' : 'Generando email personalizado...'}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {lastError?.type === 'rate_limit' 
                                    ? 'La aplicación está reintentando automáticamente con delays inteligentes'
                                    : 'La IA está analizando tu contexto y creando un email profesional'
                                  }
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* New Collection Page Info */}
                  {user && (
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                      <div className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Tu Página de Recopilación</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Ahora tienes tu propia página personalizada para recopilar emails:
                        </p>
                        <div className="bg-muted p-3 rounded-md mb-4">
                          <code className="text-sm break-all">
                            {typeof window !== 'undefined' ? window.location.origin : ''}/correosia/{encodeURIComponent(user.email || '')}
                          </code>
                        </div>
                        <div className="flex space-x-2">
                          <Link
                            href={`/correosia/${encodeURIComponent(user.email || '')}`}
                            target="_blank"
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
                          >
                            Ver Página
                          </Link>
                          <Link
                            href={`/correosia/${encodeURIComponent(user.email || '')}/admin`}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                          >
                            Administrar
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Preview Section */}
                <div className="space-y-6">
                  <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Vista Previa del Email</h3>
                        {generatedEmail && (
                          <div className="flex space-x-2">
                            <button
                              onClick={openGmail}
                              title="Abrir en Gmail"
                              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-green-600 text-white hover:bg-green-700 h-9 px-3"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <span>Abrir en Gmail</span>
                            </button>

                            <button
                              onClick={() => setGeneratedEmail("")}
                              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                            >
                              <span>Limpiar</span>
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="min-h-[400px] border rounded-md p-4 bg-muted/30">
                        {generatedEmail ? (
                          <div className="whitespace-pre-wrap text-sm text-foreground">
                            {generatedEmail}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
                            <div className="text-6xl opacity-20 grayscale">📧</div>
                            <div className="text-lg font-medium">Email generado aparecera aqui</div>
                            <div className="text-sm text-muted-foreground/70">Completa el formulario y haz clic en "Generar Email con IA"</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
            </div>
            </main>
          </div>
        </MobileContainer>

        {/* Language Toggle */}
        <SimpleLanguageToggle />
      </MobileLayout>
    </ProtectedRoute>
  );
}

export default CorreosIAPage;