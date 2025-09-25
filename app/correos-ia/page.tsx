"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "../components/ProtectedRoute";
import GuestTrialInterface from "../components/GuestTrialInterface";
import MobileLayout, { MobileContainer } from "../components/MobileLayout";
import { MobileOptimizedInput, MobileOptimizedTextarea, MobileOptimizedSelect } from "../components/MobileFormOptimizations";
import ContactSelector from "../components/ContactSelector";
import { useAuth } from '../hooks/useAuth';
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';
import { useGuestTrial } from "../hooks/useGuestTrial";
import { useViewport } from "../hooks/useViewport";

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
  emailProvider?: 'gmail' | 'web3forms' | 'resend';
  emailProviderConfig?: {
    gmailUser?: string;
    gmailPassword?: string;
    web3formsKey?: string;
    senderEmail?: string;
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

  // Leer parámetro recipient de la URL al cargar la página
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const recipientParam = urlParams.get('recipient');
    if (recipientParam) {
      setRecipient(recipientParam);
      // Limpiar el parámetro de la URL sin recargar la página
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  // Estados para manejo de errores
  const [lastError, setLastError] = useState<{
    message: string;
    type?: string;
    retryable?: boolean;
    timestamp: number;
  } | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

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

  // Funcion para generar email con IA
  const generateEmail = async () => {
    console.log("🤖 Iniciando generación de email...");
    console.log("📝 Datos de entrada:", {
      recipient,
      subject,
      purpose,
      contextLength: context?.length,
      userEmail: user?.email
    });

    if (!recipient || !subject || !purpose) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }

    setIsGenerating(true);
    setLastError(null);
    setRetryCount(0);

    try {
      // Obtener la API key personalizada del usuario si está configurada
      const userApiKey = localStorage.getItem('gemini_api_key');
      console.log("🔑 API Key configurada:", !!userApiKey);
      
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "x-user-email": user?.email || "",
      };
      
      // Agregar la API key personalizada si está disponible
      if (userApiKey) {
        headers["x-api-key"] = userApiKey;
      }

      const customHeaders = userApiKey ? { 'x-api-key': userApiKey } : undefined;
      const requestPayload = {
        recipient,
        subject,
        purpose,
        context: context,
      };

      console.log("📤 Enviando request a /api/generate-email:", requestPayload);

      const data = await post("/api/generate-email", requestPayload, customHeaders);
      
      console.log("📨 Respuesta de la API:", {
        hasEmail: !!data?.email,
        emailLength: data?.email?.length,
        emailPreview: data?.email?.substring(0, 100) + "..."
      });

      if (!data?.email) {
        console.error("❌ La API no devolvió contenido de email");
        alert("❌ Error: La IA no pudo generar contenido para el email. Intenta de nuevo.");
        return;
      }

      setGeneratedEmail(data.email);
      console.log("✅ Email generado exitosamente");
    } catch (error) {
      console.error("❌ Error generating email:", error);
      setLastError({
        message:
          error instanceof Error ? error.message : "Error desconocido",
        type: "generation",
        retryable: true,
        timestamp: Date.now(),
      });
      setShowErrorDialog(true);
    } finally {
      setIsGenerating(false);
    }
  };

  // Funcion para enviar email
  const sendEmail = async () => {
    console.log("🚀 Iniciando envío de email...");
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

    setIsSending(true);
    try {
      const data = await post("/api/send-email", emailPayload);
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
        }
      }
      
      alert(`❌ Error al enviar email: ${errorMessage}${debugInfo}\n\n💡 Ve a Ajustes y configura tu proveedor de email preferido.\n\n🌐 Recomendamos Web3Forms para configuración súper fácil.`);
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
          onClose={() => window.location.href = '/dashboard'}
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
                                    key={index}
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

                        {/* Generate Button */}
                        <button
                          onClick={generateEmail}
                          disabled={isGenerating || !recipient || !subject || !purpose}
                          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                        >
                          {isGenerating ? (
                            <>
                              <span>Generando...</span>
                            </>
                          ) : (
                            <>
                              <span>Generar Email con IA</span>
                            </>
                          )}
                        </button>
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
                            {window.location.origin}/correosia/{encodeURIComponent(user.email || '')}
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
            </main>
          </div>
        </MobileContainer>
      </MobileLayout>
    </ProtectedRoute>
  );
}

export default CorreosIAPage;