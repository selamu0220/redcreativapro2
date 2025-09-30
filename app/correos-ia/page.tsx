"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "../components/ProtectedRoute";
import GuestTrialInterface from "../components/GuestTrialInterface";
import MobileLayout, { MobileContainer } from "../components/MobileLayout";
import { MobileOptimizedInput, MobileOptimizedTextarea, MobileOptimizedSelect } from "../components/MobileFormOptimizations";
import ContactSelector from "../components/ContactSelector";
import ResendConfig from "../components/ResendConfig";
import EmailErrorModal from "../components/EmailErrorModal";
import { useAuth } from '../hooks/useAuth';
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';
import { useGuestTrial } from "../hooks/useGuestTrial";
import { useViewport } from "../hooks/useViewport";
import { useGeminiSync } from "../hooks/useGeminiSync";
import { getValidatedGeminiConfig } from "../utils/gemini-validator";
import TestDebug from './test-debug';

interface UserData {
  email: string;
  subscriptionStatus: 'free' | 'trial' | 'pro' | 'premium';
  subscriptionId?: string;
  customerId?: string;
  trialStartDate?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  aiStudioApiKey?: string;
  gmailUser?: string;
  gmailPassword?: string;
  gmailConfigNotified?: boolean;
  // Nuevas propiedades para proveedores de email
  emailProvider?: 'gmail' | 'resend';
  emailProviderConfig?: {
    gmailUser?: string;
    gmailPassword?: string;
    resendApiKey?: string;
    resendFromEmail?: string;
  };
  createdAt: string;
  lastActiveAt: string;
}

function CorreosIAPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const { get, post, put, del } = useAuthenticatedFetch();
  const { isTrialActive, canStartTrial, stopGuestTrial } = useGuestTrial();
  const [userData, setUserData] = useState<UserData | null>(null);

  // Estados para generacion de emails individuales
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [purpose, setPurpose] = useState("");
  const [context, setContext] = useState("");
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingContactData, setIsLoadingContactData] = useState(false);
  const [isContextExpanded, setIsContextExpanded] = useState(false);
  
  // Estados para mostrar correos recopilados
  const [collectedEmails, setCollectedEmails] = useState<any[]>([]);
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  const [showEmailsList, setShowEmailsList] = useState(false);

  // Hook de sincronización de Gemini
  const {
    geminiApiKey,
    geminiModel,
    isClient,
    setGeminiApiKey,
    setGeminiModel,
    saveGeminiConfig,
    clearGeminiConfig
  } = useGeminiSync();
  
  // Estados locales para la UI - mostrar configuración si no hay API key
  const [showApiKeyConfig, setShowApiKeyConfig] = useState(false);
  const [isTestingApiKey, setIsTestingApiKey] = useState(false);
  const [apiKeyTestResult, setApiKeyTestResult] = useState<{
    success: boolean;
    message: string;
    timestamp: number;
  } | null>(null);
  
  // Alias para compatibilidad con código existente
  const aiModel = geminiModel;
  const setAiModel = setGeminiModel;

  // Modelos disponibles
  const availableModels = [
    { id: 'openai/gpt-4o', name: 'GPT-4o', description: 'Modelo ultra-rápido y ligero (recomendado)' },
    { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', description: 'Modelo económico y eficiente' },
    { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Modelo avanzado para tareas complejas' },
    { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', description: 'Modelo de Google vía OpenRouter' },
    { id: 'meta-llama/llama-3.1-8b-instruct', name: 'Llama 3.1 8B', description: 'Modelo open source rápido' }
  ];

  // SOLUCIÓN EXTREMA: ELIMINAR TODA LÓGICA CONDICIONAL - SIEMPRE VISIBLE
  const shouldShowApiConfig = true; // FORZADO SIEMPRE VISIBLE
  const FORCE_SHOW_API_CONFIG = true; // BACKUP FORZADO
  
  // Debug logs para verificar estados
  useEffect(() => {
    console.log('🔧 DEBUG - isClient:', isClient);
    console.log('🔧 DEBUG - geminiApiKey:', geminiApiKey);
    console.log('🔧 DEBUG - showApiKeyConfig:', showApiKeyConfig);
    console.log('🔧 DEBUG - shouldShowApiConfig:', shouldShowApiConfig);
  }, [isClient, geminiApiKey, showApiKeyConfig]);

  // Debug específico para la sección de API Config
  useEffect(() => {
    console.log('🚨 API CONFIG SECTION DEBUG:', {
      timestamp: new Date().toISOString(),
      shouldShowApiConfig,
      showApiKeyConfig,
      geminiApiKey: geminiApiKey ? 'HAS_KEY' : 'NO_KEY',
      isClient,
      location: 'correos-ia page - API Config Section'
    });
  }, [shouldShowApiConfig, showApiKeyConfig, geminiApiKey, isClient]);

  // FORZAR CONFIGURACIÓN SIEMPRE VISIBLE - SIN CONDICIONES
  useEffect(() => {
    setShowApiKeyConfig(true);
    console.log('🚨 EXTREMO: FORZANDO showApiKeyConfig = true SIEMPRE');
  }, []); // Sin dependencias - ejecutar siempre

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
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const [requestInProgress, setRequestInProgress] = useState(false);
  const [showErrorBanner, setShowErrorBanner] = useState(false);

  // Estados para configuración Resend
  const [showResendConfig, setShowResendConfig] = useState(false);

  // Estados para el modal de errores de email
  const [showEmailErrorModal, setShowEmailErrorModal] = useState(false);
  const [emailErrorType, setEmailErrorType] = useState<'resend' | 'gmail' | 'general'>('general');
  const [emailErrorMessage, setEmailErrorMessage] = useState('');

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
      message = `Has alcanzado el límite de uso de la API de Gemini. Esto es temporal y se restablecerá automáticamente.`;
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
      message = 'Problema con la autenticación de la API. Verifica tu API key de Gemini en Ajustes y asegúrate de que sea válida.';
      actionText = 'Ir a Ajustes';
      isRetryable = false;
    } else if (error.status === 400) {
      title = 'Solicitud inválida';
      message = 'Los datos enviados no son válidos. Verifica que todos los campos estén completos y sean correctos.';
      isRetryable = false;
    } else if (error.status >= 500 && error.status < 600) {
      title = 'Error del servidor';
      message = 'Error en el servidor de Gemini. El sistema reintentará automáticamente.';
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
    if (authLoading) return;
    if (user?.email) {
      get(`/api/users/${encodeURIComponent(user.email || '')}`)
        .then(dbUser => {
          setUserData(dbUser);
        })
        .catch(() => setUserData(null));
    } else {
      setUserData(null);
    }
  }, [user?.email, authLoading]);

  // Cargar correos recopilados automáticamente
  useEffect(() => {
    if (user?.email && !authLoading) {
      // Cargar correos sin mostrar la lista automáticamente
      get(`/api/email-collection/${encodeURIComponent(user.email)}/export?format=json`)
        .then(response => {
          const emails = response.emails || [];
          setCollectedEmails(emails);
        })
        .catch(error => {
          console.error("Error loading collected emails:", error);
        });
    }
  }, [user?.email, authLoading]);

  // Función para importar datos del contacto
  const importContactData = async () => {
    if (!recipient) {
      alert("Por favor selecciona un destinatario primero");
      return;
    }

    setIsLoadingContactData(true);
    try {
      // Buscar datos del contacto en los archivos de emails recopilados
      // Agregar parámetro format=json para obtener respuesta JSON en lugar de CSV
      const response = await get(`/api/email-collection/${encodeURIComponent(user?.email || '')}/export?format=json`);
      const collectedEmails = response.emails || [];
      
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
        alert(`✅ Datos del contacto importados exitosamente\n\nSe encontró información completa para: ${contactData.email}`);
      } else {
        // Mostrar todos los emails disponibles para ayudar al usuario
        if (collectedEmails.length > 0) {
          const emailList = collectedEmails.map((email: any) => email.email).join('\n• ');
          alert(`❌ No se encontró el contacto: ${recipient}\n\n📋 Emails disponibles:\n• ${emailList}`);
        } else {
          alert("❌ No se encontraron correos recopilados para este usuario");
        }
      }
    } catch (error) {
      console.error("Error importing contact data:", error);
      alert(`❌ Error al importar datos del contacto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsLoadingContactData(false);
    }
  };

  // Función para cargar todos los correos recopilados
  const loadCollectedEmails = async () => {
    if (!user?.email) return;
    
    setIsLoadingEmails(true);
    try {
      const response = await get(`/api/email-collection/${encodeURIComponent(user.email)}/export?format=json`);
      const emails = response.emails || [];
      setCollectedEmails(emails);
      setShowEmailsList(true);
    } catch (error) {
      console.error("Error loading collected emails:", error);
      alert(`❌ Error al cargar correos recopilados: ${error instanceof Error ? error.message : 'Error desconocido'}`);
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

  // Funciones para manejar la API key de Gemini (usando hook de sincronización)
  const saveGeminiApiKey = async () => {
    if (typeof window === 'undefined') return;
    
    if (!geminiApiKey.trim()) {
      alert('Por favor ingresa una API key válida');
      return;
    }
    
    // Usar el hook para guardar y sincronizar
    saveGeminiConfig(geminiApiKey, aiModel);
    alert('API key de Gemini guardada exitosamente');
  };

  const clearGeminiApiKeyLocal = async () => {
    if (typeof window === 'undefined') return;
    if (confirm('¿Estás seguro de que quieres limpiar la API key de Gemini?')) {
      // Usar el hook para limpiar y sincronizar
      clearGeminiConfig();
      setApiKeyTestResult(null);
      alert('API key de Gemini limpiada exitosamente');
    }
  };

  const testGeminiApiKey = async () => {
    if (!geminiApiKey.trim()) {
      alert('Por favor ingresa una API key antes de probar');
      return;
    }

    setIsTestingApiKey(true);
    setApiKeyTestResult(null);

    try {
      // Hacer una petición de prueba simple a la API de Gemini
      const response = await fetch('/api/test-gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user?.getIdToken()}`,
          'x-api-key': geminiApiKey
        },
        body: JSON.stringify({
          model: aiModel,
          testMessage: 'Hola, esto es una prueba de conexión.'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setApiKeyTestResult({
          success: true,
          message: '✅ API Key válida y funcionando correctamente',
          timestamp: Date.now()
        });
        // Guardar automáticamente si la prueba es exitosa usando el hook de sincronización
        saveGeminiConfig(geminiApiKey, aiModel);
      } else {
        const errorData = await response.json();
        setApiKeyTestResult({
          success: false,
          message: `❌ Error: ${errorData.error || 'API Key inválida'}`,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('Error testing API key:', error);
      setApiKeyTestResult({
        success: false,
        message: '❌ Error de conexión al probar la API Key',
        timestamp: Date.now()
      });
    } finally {
      setIsTestingApiKey(false);
    }
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
          message: error.message || 'Error en la API de Gemini',
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
    
    // Validar campos requeridos
    if (!recipient || !subject || !purpose) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }

    // Verificar si ya hay una petición en progreso
    if (requestInProgress) {
      alert("Ya hay una generación de email en progreso. Por favor espera.");
      return;
    }

    // Verificar rate limiting
    const rateLimitCheck = checkRateLimit();
    if (!rateLimitCheck.allowed) {
      const waitSeconds = Math.ceil(rateLimitCheck.waitTime! / 1000);
      alert(`Por favor espera ${waitSeconds} segundos antes de generar otro email.`);
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
        // Obtener configuración validada de Gemini
        const geminiConfig = getValidatedGeminiConfig(geminiApiKey);
        const { apiKey: userApiKey, temperature: userTemperature, maxTokens: userMaxTokens } = geminiConfig;
        
        console.log("🔑 Configuración Gemini:", {
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
        
        const requestPayload = {
          recipient,
          subject,
          purpose,
          context: context,
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
            'Authorization': `Bearer ${await user?.getIdToken()}`,
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

  // Funcion para enviar email
  const sendEmail = async () => {
    console.log("🚀 Iniciando envío de email...");
    
    // Debug: Verificar configuración en localStorage
    const localStorageDebug = typeof window !== 'undefined' ? {
      selectedProvider: localStorage.getItem('selectedEmailProvider'),
      gmailUser: localStorage.getItem('gmailUser'),
      gmailPassword: localStorage.getItem('gmailPassword'),
      resendKey: localStorage.getItem('resend_api_key'),
      resendSender: localStorage.getItem('resend_from_email')
    } : {
      selectedProvider: null,
      gmailUser: null,
      gmailPassword: null,
      resendKey: null,
      resendSender: null
    };
    
    console.log('=== DEBUGGING EMAIL PROVIDER SELECTION ===');
    console.log('🔍 Configuración en localStorage:', localStorageDebug);
    console.log('🎯 Provider seleccionado:', localStorageDebug.selectedProvider);
    console.log('📊 Estado de configuraciones:');
    console.log('  - Resend configurado:', !!(localStorageDebug.resendKey && localStorageDebug.resendSender));
    console.log('  - Gmail configurado:', !!(localStorageDebug.gmailUser && localStorageDebug.gmailPassword));
    
    // Verificar todos los valores de localStorage relacionados con email
    console.log('🗂️ Todos los valores de localStorage relacionados con email:');
    const allEmailKeys = ['selectedEmailProvider', 'email_provider', 'gmailUser', 'gmailPassword', 'gmail_user', 'gmail_password', 'resend_api_key', 'resend_from_email'];
    if (typeof window !== 'undefined') {
      allEmailKeys.forEach(key => {
        const value = localStorage.getItem(key);
        console.log(`  ${key}: ${value ? '✅ ' + value : '❌ null'}`);
      });
    }
    
    // Verificar si hay configuración de email
    const hasEmailConfig = (
      (localStorageDebug.selectedProvider === 'gmail' && localStorageDebug.gmailUser && localStorageDebug.gmailPassword) ||
      (localStorageDebug.selectedProvider === 'resend' && localStorageDebug.resendKey && localStorageDebug.resendSender)
    );
    
    // Si no hay configuración, mostrar modal de Resend
    if (!hasEmailConfig) {
      setShowResendConfig(true);
      return;
    }
    
    console.log("📧 Datos del email:", {
      recipient: recipient,
      subject: subject,
      generatedEmailLength: generatedEmail?.length,
      generatedEmailPreview: generatedEmail?.substring(0, 100) + "...",
      hasUserData: !!userData,
      gmailUser: userData?.gmailUser,
      hasGmailPassword: !!userData?.gmailPassword
    });

    if (!generatedEmail || !recipient) {
      alert("No hay email generado o destinatario especificado");
      return;
    }

    if (!generatedEmail.trim()) {
      alert("❌ El contenido del email está vacío. Por favor genera un email primero.");
      return;
    }

    const emailPayload = {
      to: recipient,
      subject: subject,
      text: generatedEmail,
      html: generatedEmail.replace(/\n/g, '<br>'), // Convertir saltos de línea a HTML
      isPromotional: false
    };

    console.log("📤 Payload del email:", {
      to: emailPayload.to,
      subject: emailPayload.subject,
      textLength: emailPayload.text?.length,
      htmlLength: emailPayload.html?.length,
      isPromotional: emailPayload.isPromotional
    });

    // CRÍTICO: El backend usa getUserEmailProviderAsync que necesita x-user-email
    const headers: Record<string, string> = {};
    
    // Header más importante: identificar al usuario para buscar config en BD
    if (user?.email) {
      headers['x-user-email'] = user.email;
      console.log('🔑 HEADER CRÍTICO agregado - x-user-email:', user.email);
    } else {
      console.error('🚨 ERROR CRÍTICO: No hay user.email para x-user-email header!');
      alert('Error: No se puede identificar al usuario. Por favor, inicia sesión nuevamente.');
      return;
    }
    
    // Headers de localStorage como fallback (aunque el backend usa la BD)
    if (localStorageDebug.selectedProvider) headers['x-selected-provider'] = localStorageDebug.selectedProvider;
    if (localStorageDebug.gmailUser) headers['x-gmail-user'] = localStorageDebug.gmailUser;
    if (localStorageDebug.gmailPassword) headers['x-gmail-password'] = localStorageDebug.gmailPassword;
    if (localStorageDebug.resendKey) headers['x-resend-key'] = localStorageDebug.resendKey;
    if (localStorageDebug.resendSender) headers['x-resend-sender'] = localStorageDebug.resendSender;
    
    console.log('📋 === HEADERS PREPARADOS PARA ENVÍO ===');
    console.log('🔑 Headers que se enviarán:', {
      keys: Object.keys(headers),
      values: headers,
      count: Object.keys(headers).length
    });
    
    console.log('🎯 Validación de configuración antes del envío:', {
      hasSelectedProvider: !!localStorageDebug.selectedProvider,
      selectedProvider: localStorageDebug.selectedProvider,
      configurationComplete: {
        gmail: !!(localStorageDebug.selectedProvider === 'gmail' && localStorageDebug.gmailUser && localStorageDebug.gmailPassword),
        resend: !!(localStorageDebug.selectedProvider === 'resend' && localStorageDebug.resendKey && localStorageDebug.resendSender)
      }
    });
    
    console.log('🚨 ANÁLISIS CRÍTICO: Validación de configuración');
    console.log('1. Provider seleccionado:', localStorageDebug.selectedProvider);
    console.log('2. ¿Es Resend?', localStorageDebug.selectedProvider === 'resend');
    console.log('3. ¿Tiene config Resend?', !!(localStorageDebug.resendKey && localStorageDebug.resendSender));
    console.log('4. ¿Debería usar Resend?', localStorageDebug.selectedProvider === 'resend' && localStorageDebug.resendKey && localStorageDebug.resendSender);
    
    if (localStorageDebug.selectedProvider === 'resend' && (!localStorageDebug.resendKey || !localStorageDebug.resendSender)) {
      console.error('🚨 ERROR: Resend seleccionado pero mal configurado!');
      console.error('  - API Key:', localStorageDebug.resendKey ? 'Presente' : 'FALTANTE');
      console.error('  - From Email:', localStorageDebug.resendSender ? 'Presente' : 'FALTANTE');
      alert('Error: Resend está seleccionado pero no está configurado correctamente. Por favor, ve a Ajustes y configura la API key y el email de origen.');
      return;
    }

    // Verificar configuración en la base de datos antes de enviar
    console.log('🔍 Verificando configuración en la base de datos...');
    try {
      const dbConfig = await get('/api/debug-email-config');
      console.log('📊 Configuración en BD:', dbConfig);
      
      if (!dbConfig.debug?.provider) {
        console.error('🚨 PROBLEMA DETECTADO: La BD no tiene configuración válida!');
        console.error('  - Provider en BD:', dbConfig.debug?.provider);
        console.error('  - Config en BD:', dbConfig.debug?.rawConfig);
        alert('Error: No hay configuración de email válida en la base de datos. Por favor, ve a Ajustes y configura Resend o Gmail.');
        return;
      }
    } catch (dbError) {
      console.error('❌ Error verificando configuración en BD:', dbError);
    }

    setIsSending(true);
    try {
      console.log('📤 ENVIANDO REQUEST CON ESTOS DATOS:');
      console.log('  - URL: /api/send-email');
      console.log('  - Payload:', emailPayload);
      console.log('  - Headers:', headers);
      console.log('  - User Email (crítico):', user?.email);
      
      const data = await post("/api/send-email", emailPayload, headers);
      alert("✅ Email enviado exitosamente");
      // Limpiar formulario
      setRecipient("");
      setSubject("");
      setPurpose("");
      setContext("");
      setGeneratedEmail("");
    } catch (error) {
      console.error("Error sending email:", error);
      
      // Extraer información detallada del error
      let errorMessage = "Error desconocido";
      let debugInfo = "";
      
      if (error instanceof Error) {
        try {
          // Intentar parsear la respuesta JSON del error
          const errorData = JSON.parse(error.message);
          errorMessage = errorData.error || error.message;
          
          // Detectar errores específicos de proveedores
  
          
          // Agregar información de debug si está disponible
          if (errorData.missingParams) {
            debugInfo += `\n\n🔍 Parámetros faltantes: ${errorData.missingParams.join(', ')}`;
          }
          if (errorData.missingCredentials) {
            debugInfo += `\n\n🔑 Credenciales faltantes: ${errorData.missingCredentials.join(', ')}`;
          }
          if (errorData.receivedParams) {
            const params = errorData.receivedParams;
            debugInfo += `\n\n📋 Estado de parámetros:`;
            debugInfo += `\n• Destinatario: ${params.to ? '✅' : '❌'}`;
            debugInfo += `\n• Asunto: ${params.subject ? '✅' : '❌'}`;
            debugInfo += `\n• Contenido: ${params.text ? '✅' : '❌'}`;
            debugInfo += `\n• Gmail User: ${params.gmailUser ? '✅' : '❌'}`;
            debugInfo += `\n• Gmail Password: ${params.gmailPassword ? '✅' : '❌'}`;
          }
        } catch (parseError) {
          // Si no se puede parsear, usar el mensaje original
          errorMessage = error.message;
          
          // Verificar errores en el mensaje original

        }
      }
      
      // Determinar el tipo de error para proveedores
      let errorType: 'resend' | 'gmail' | 'general' = 'general';
      if (errorMessage.toLowerCase().includes('resend')) {
        errorType = 'resend';
      } else if (errorMessage.toLowerCase().includes('gmail') || errorMessage.toLowerCase().includes('smtp')) {
        errorType = 'gmail';
      }
      
      setEmailErrorType(errorType);
      setEmailErrorMessage(errorMessage + debugInfo);
      setShowEmailErrorModal(true);
    } finally {
      setIsSending(false);
    }
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

  return (
    <ProtectedRoute>
      <MobileLayout>
        <MobileContainer>
          {/* CONFIGURACIÓN API FORZADA - SIEMPRE VISIBLE */}
          <div style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            backgroundColor: '#1f2937',
            color: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '2px solid #10b981',
            zIndex: 9999,
            minWidth: '300px',
            maxWidth: '400px'
          }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold' }}>🔧 Configuración API Gemini</h3>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>API Key:</label>
              <input
                type="password"
                value={geminiApiKey || ''}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="Ingresa tu API key de Gemini"
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #374151',
                  backgroundColor: '#374151',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Modelo:</label>
              <select
                value={geminiModel || 'gemini-2.0-flash-lite'}
                onChange={(e) => setGeminiModel(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #374151',
                  backgroundColor: '#374151',
                  color: 'white',
                  fontSize: '14px'
                }}
              >
                {availableModels.map(model => (
                  <option key={model.id} value={model.id}>{model.name}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => {
                saveGeminiConfig(geminiApiKey, aiModel);
                alert('Configuración guardada!');
              }}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              💾 Guardar Configuración
            </button>
            <div style={{ marginTop: '10px', fontSize: '12px', opacity: 0.8 }}>
              Estado: {geminiApiKey ? '✅ API Key configurada' : '❌ Falta API Key'}
            </div>
          </div>
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
                        <div className="border rounded-lg p-4 bg-gradient-to-r from-primary/5 to-secondary/5">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                              <h3 className="text-lg font-semibold text-foreground">
                                Modelo de IA & Configuración
                              </h3>
                              {geminiApiKey ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 font-medium">
                                  ✓ Listo para usar
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 font-medium animate-pulse">
                                  ⚠ Configuración requerida
                                </span>
                              )}
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
                          
                          {/* API Key Configuration */}
                          <div className="border-t pt-4">
                            {/* Debug info - temporal */}
                            <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs" style={{backgroundColor: 'yellow', border: '2px solid red', padding: '10px'}}>
                              <strong>🚨 DEBUG FORZADO:</strong> shouldShowApiConfig={shouldShowApiConfig.toString()}, 
                              showApiKeyConfig={showApiKeyConfig.toString()}, 
                              geminiApiKey={geminiApiKey ? 'SET' : 'EMPTY'}, 
                              isClient={isClient.toString()}
                            </div>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3a1 1 0 011-1h2.586l6.243-6.243A6 6 0 0121 9z" />
                                </svg>
                                <label className="text-sm font-medium leading-none">
                                  API Key de OpenRouter
                                </label>
                              </div>
                              <button
                                onClick={() => {
                                  // Solo permitir ocultar si hay API key configurada
                                  if (geminiApiKey) {
                                    setShowApiKeyConfig(!showApiKeyConfig);
                                  }
                                }}
                                disabled={!geminiApiKey}
                                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-8 px-3 ${
                                  !geminiApiKey 
                                    ? 'bg-primary text-primary-foreground cursor-default'
                                    : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
                                }`}
                              >
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showApiKeyConfig ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                                </svg>
                                {!geminiApiKey ? 'Configurar API Key' : (showApiKeyConfig ? 'Ocultar' : 'Editar API Key')}
                              </button>
                            </div>
                          
                          {/* CONFIGURACIÓN API - EXTREMA VISIBILIDAD FORZADA */}
                          <div className="space-y-3" style={{
                            display: 'block',
                            visibility: 'visible',
                            opacity: '1',
                            position: 'relative',
                            zIndex: '99999',
                            backgroundColor: '#ff0000',
                            border: '5px solid #00ff00',
                            borderRadius: '8px',
                            padding: '20px',
                            margin: '20px 0',
                            minHeight: '300px',
                            width: '100%',
                            boxShadow: '0 0 20px rgba(255,0,0,0.5)'
                          }}>
                              <div>
                                <MobileOptimizedInput
                                  type="password"
                                  value={geminiApiKey}
                                  onChange={(e) => setGeminiApiKey(e.target.value)}
                                  placeholder="Ingresa tu API key de OpenRouter"
                                  className="font-mono text-sm"
                                />
                                <p className="text-xs text-muted-foreground mt-2">
                                  💡 <strong>¿Cómo obtener tu API key?</strong>
                                </p>
                                <ol className="text-xs text-muted-foreground mt-1 ml-4 space-y-1">
                                  <li>1. Ve a <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OpenRouter Keys</a></li>
                                  <li>2. Inicia sesión o crea una cuenta</li>
                                  <li>3. Haz clic en "Create Key"</li>
                                  <li>4. Copia la clave y pégala aquí</li>
                                </ol>
                              </div>
                              
                              {/* API Key Actions */}
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => testGeminiApiKey()}
                                  disabled={!geminiApiKey || isTestingApiKey}
                                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3 flex-1"
                                >
                                  {isTestingApiKey ? (
                                    <>
                                      <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin mr-1"></div>
                                      Probando...
                                    </>
                                  ) : (
                                    <>
                                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      Probar API Key
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => saveGeminiApiKey()}
                                  disabled={!geminiApiKey}
                                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3"
                                >
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                  </svg>
                                  Guardar
                                </button>
                                {geminiApiKey && (
                                  <button
                                    onClick={() => clearGeminiApiKeyLocal()}
                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground h-8 px-3"
                                  >
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Limpiar
                                  </button>
                                )}
                              </div>
                              
                              {/* API Key Test Result */}
                              {apiKeyTestResult && (
                                <div className={`p-3 rounded-md border ${
                                  apiKeyTestResult.success
                                    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                                    : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                                }`}>
                                  <div className="flex items-start space-x-2">
                                    <svg className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                                      apiKeyTestResult.success
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-red-600 dark:text-red-400'
                                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      {apiKeyTestResult.success ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      )}
                                    </svg>
                                    <div className="flex-1">
                                      <p className={`text-sm font-medium ${
                                        apiKeyTestResult.success
                                          ? 'text-green-800 dark:text-green-200'
                                          : 'text-red-800 dark:text-red-200'
                                      }`}>
                                        {apiKeyTestResult.success ? '✓ API Key válida' : '✗ API Key inválida'}
                                      </p>
                                      <p className={`text-xs mt-1 ${
                                        apiKeyTestResult.success
                                          ? 'text-green-700 dark:text-green-300'
                                          : 'text-red-700 dark:text-red-300'
                                      }`}>
                                        {apiKeyTestResult.message}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {geminiApiKey && (
                                <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded dark:bg-green-900/20 dark:border-green-800">
                                  <div className="flex items-center space-x-2">
                                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-sm text-green-800 dark:text-green-200">API Key guardada localmente</span>
                                  </div>
                                </div>
                              )}
                              
                              <div className="p-2 bg-blue-50 border border-blue-200 rounded dark:bg-blue-900/20 dark:border-blue-800">
                                <p className="text-xs text-blue-800 dark:text-blue-200">
                                  🔒 <strong>Seguridad:</strong> Tu API key se guarda solo en tu navegador y nunca se envía a nuestros servidores.
                                </p>
                              </div>
                              
                              {/* DIV DE PRUEBA EXTREMADAMENTE VISIBLE */}
                              <div style={{
                                position: 'fixed',
                                top: '50px',
                                left: '50px',
                                width: '300px',
                                height: '100px',
                                backgroundColor: '#ff00ff',
                                border: '10px solid #ffff00',
                                zIndex: '999999',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '20px',
                                fontWeight: 'bold',
                                color: '#000000',
                                textAlign: 'center',
                                boxShadow: '0 0 50px rgba(255,0,255,0.8)'
                              }}>
                                🚨 API CONFIG VISIBLE! 🚨
                              </div>
                            </div>
                        </div>

                        {/* Error Display */}
                        {lastError && lastError.type !== 'rate_limit' && (
                          <div className={`p-3 rounded-md border ${
                            lastError.type === 'network' 
                              ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800'
                              : lastError.type === 'api_error'
                              ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                              : 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800'
                          }`}>
                            <div className="flex items-start space-x-2">
                              <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                                lastError.type === 'network'
                                  ? 'text-orange-600 dark:text-orange-400'
                                  : lastError.type === 'api_error'
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-gray-600 dark:text-gray-400'
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
                                    ? 'text-red-800 dark:text-red-200'
                                    : 'text-gray-800 dark:text-gray-200'
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
                                    ? 'text-red-700 dark:text-red-300'
                                    : 'text-gray-700 dark:text-gray-300'
                                }`}>
                                  {lastError.message}
                                </p>
                                {lastError.suggestedRetryDelay && (
                                  <p className={`text-xs mt-2 ${
                                    lastError.type === 'network'
                                      ? 'text-orange-600 dark:text-orange-400'
                                      : lastError.type === 'api_error'
                                      ? 'text-red-600 dark:text-red-400'
                                      : 'text-gray-600 dark:text-gray-400'
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
                          <div className="p-3 rounded-md bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
                            <div className="flex items-start space-x-2">
                              <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                              </svg>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                  Límite de peticiones alcanzado
                                </p>
                                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
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
                          <div className="mt-2 p-3 rounded-md bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                  {lastError?.type === 'rate_limit' ? 'Manejando límite de peticiones...' : 'Generando email personalizado...'}
                                </p>
                                <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
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
                              onClick={sendEmail}
                              disabled={isSending}
                              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
                            >
                              <span>Enviar</span>
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
                      
                      <div className="min-h-[400px] border rounded-md p-4 bg-muted/50">
                        {generatedEmail ? (
                          <div className="whitespace-pre-wrap text-sm">
                            {generatedEmail}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
                            <div className="text-6xl opacity-50">📧</div>
                            <div className="text-lg font-medium">Email generado aparecera aqui</div>
                            <div className="text-sm text-muted-foreground/70">Completa el formulario y haz clic en "Generar Email con IA"</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </main>
          </div>
        </MobileContainer>
      </MobileLayout>
      
      {/* Modal de configuración Resend */}
      {showResendConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Configurar Resend</h2>
                <button
                  onClick={() => setShowResendConfig(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <ResendConfig 
                isOpen={true}
                onClose={() => setShowResendConfig(false)}
                onConfigured={() => {
                  setShowResendConfig(false);
                  // Intentar enviar el email nuevamente después de configurar
                  setTimeout(() => {
                    sendEmail();
                  }, 500);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal de error de email */}
      <EmailErrorModal
        isOpen={showEmailErrorModal}
        onClose={() => setShowEmailErrorModal(false)}
        errorType={emailErrorType}
        errorMessage={emailErrorMessage}
      />
    </ProtectedRoute>
  );
}

export default CorreosIAPage;