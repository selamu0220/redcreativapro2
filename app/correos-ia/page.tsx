"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "../components/ProtectedRoute";
import GuestTrialInterface from "../components/GuestTrialInterface";
import VideoModal from "../components/VideoModal";
import MobileLayout, { MobileContainer } from "../components/MobileLayout";
import ResponsiveGrid from "../components/ResponsiveGrid";
import { MobileOptimizedForm, MobileOptimizedInput, MobileOptimizedTextarea, MobileOptimizedSelect } from "../components/MobileFormOptimizations";
import { MobileOptimizedLoader, MobileErrorState, useLoadingState } from "../components/MobileLoadingStates";
import { useAuth } from "../hooks/useAuth";
import { useGuestTrial } from "../hooks/useGuestTrial";
import { useViewport } from "../hooks/useViewport";
import {
  ContactData,
  EmailCollectionPageData
} from "../lib/database";

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
  createdAt: string;
  lastActiveAt: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  timesUsed: number;
}

function CorreosIAPage() {
  const { user, logout, loading: authLoading } = useAuth();
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
  const [showGmailScript, setShowGmailScript] = useState(false);

  // Estados para el sistema de email marketing
  const [activeTab, setActiveTab] = useState("generator"); // 'generator', 'contacts', 'pages', 'templates'
  const [contacts, setContacts] = useState<ContactData[]>([]);
  const [emailPages, setEmailPages] = useState<EmailCollectionPageData[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Estados para manejo de errores
  const [lastError, setLastError] = useState<{
    message: string;
    type?: string;
    retryable?: boolean;
    timestamp: number;
  } | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Estados para modales
  const [showContactModal, setShowContactModal] = useState(false);
  const [showPageModal, setShowPageModal] = useState(false);
  const [showContactSelector, setShowContactSelector] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactData | null>(
    null
  );
  const [editingPage, setEditingPage] =
    useState<EmailCollectionPageData | null>(null);

  // Estados para el editor de plantillas
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [templateContent, setTemplateContent] = useState("");
  const [templatePreview, setTemplatePreview] = useState("");
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);
  const [showSendTemplateModal, setShowSendTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [selectedContact, setSelectedContact] = useState<string>("");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    subject: '',
    content: '',
    category: 'general'
  });

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
      fetch(`/api/users/${encodeURIComponent(user.email)}`)
        .then(res => res.ok ? res.json() : null)
        .then(dbUser => {
          setUserData(dbUser);
        })
        .catch(() => setUserData(null));
    } else {
      setUserData(null);
    }
  }, [user?.email, authLoading]);

  // Cargar datos al cambiar de tab
  useEffect(() => {
    if (authLoading) return; // Wait for auth to complete
    if (user?.email) {
      switch (activeTab) {
        case "contacts":
          loadContacts();
          break;
        case "pages":
          loadEmailPages();
          break;
        case "templates":
          loadTemplates();
          break;
        default:
          break;
      }
    }
  }, [activeTab, user?.email, authLoading]);

  // Funciones para cargar datos
  const loadContacts = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const response = await fetch(`${window.location.origin}/api/contacts`, {
        headers: {
          'x-user-email': user.email
        }
      });
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts || []);
      }
    } catch (error) {
      console.error("Error loading contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadEmailPages = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const response = await fetch(`${window.location.origin}/api/email-pages`, {
        headers: {
          'x-user-email': user.email
        }
      });
      if (response.ok) {
        const data = await response.json();
        setEmailPages(data.pages || []);
      }
    } catch (error) {
      console.error("Error loading email pages:", error);
    } finally {
      setLoading(false);
    }
  };

  // Funcion para generar email con IA
  const generateEmail = async () => {
    if (!recipient || !subject || !purpose) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }

    setIsGenerating(true);
    setLastError(null);
    setRetryCount(0);

    try {
      // Obtener contexto adicional del contacto seleccionado
      let finalContext = context;
      if (selectedContact) {
        const contact = contacts.find(c => c.id === selectedContact);
        if (contact && contact.additionalContext) {
          finalContext = context ? `${context}\n\nContexto adicional del contacto: ${contact.additionalContext}` : `Contexto adicional del contacto: ${contact.additionalContext}`;
        }
      }

      // Obtener la API key personalizada del usuario si está configurada
      const userApiKey = localStorage.getItem('gemini_api_key');
      
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "x-user-email": user?.email || "",
      };
      
      // Agregar la API key personalizada si está disponible
      if (userApiKey) {
        headers["x-api-key"] = userApiKey;
      }

      const response = await fetch("/api/generate-email", {
        method: "POST",
        headers,
        body: JSON.stringify({
          recipient,
          subject,
          purpose,
          context: finalContext,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al generar el email");
      }

      const data = await response.json();
      setGeneratedEmail(data.email);
    } catch (error) {
      console.error("Error generating email:", error);
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
    if (!generatedEmail || !recipient) {
      alert("No hay email generado o destinatario especificado");
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": user?.email || "",
        },
        body: JSON.stringify({
          to: recipient,
          subject: subject,
          content: generatedEmail,
        }),
      });

      if (response.ok) {
        alert("Email enviado exitosamente");
        // Limpiar formulario
        setRecipient("");
        setSubject("");
        setPurpose("");
        setContext("");
        setGeneratedEmail("");
      } else {
        const errorData = await response.json();
        alert(`Error al enviar email: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Error al enviar email");
    } finally {
      setIsSending(false);
    }
  };

  // Funciones para plantillas
  const loadTemplates = async () => {
    if (authLoading) {
      console.log('Auth still loading, skipping template load');
      return;
    }
    if (!user?.email) {
      console.warn('User email not available for loading templates');
      return;
    }
    console.log('Loading templates for user:', user.email);
    setLoading(true);
    try {
      const url = `${window.location.origin}/api/templates`;
      console.log('Fetching from URL:', url);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email
        }
      });
      console.log('Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Templates loaded successfully:', data.templates?.length || 0);
        setTemplates(data.templates || []);
      } else {
        const errorText = await response.text();
        console.error('Failed to load templates:', response.status, response.statusText, errorText);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      });
      // Set empty templates array on error to prevent UI issues
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = async () => {
    if (!newTemplate.name || !newTemplate.subject || !newTemplate.content) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      const templateData = {
        ...newTemplate,
        id: editingTemplate ? editingTemplate.id : `tpl_${user?.email}_${Date.now()}`,
        variables: extractVariables(newTemplate.content),
        createdAt: editingTemplate ? editingTemplate.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        timesUsed: editingTemplate ? editingTemplate.timesUsed : 0
      };

      const response = await fetch(`${window.location.origin}/api/templates`, {
        method: editingTemplate ? 'PUT' : 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-email': user?.email || ''
        },
        body: JSON.stringify(templateData)
      });

      if (response.ok) {
        setShowCreateTemplateModal(false);
        setEditingTemplate(null);
        setNewTemplate({ name: '', subject: '', content: '', category: 'general' });
        await loadTemplates();
        alert(editingTemplate ? 'Plantilla actualizada' : 'Plantilla creada exitosamente');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Error al guardar plantilla');
    }
  };

  const deleteTemplate = async (templateId: string) => {
    if (!confirm('Estas seguro de que quieres eliminar esta plantilla?')) return;

    try {
      const response = await fetch(`${window.location.origin}/api/templates`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-email': user?.email || ''
        },
        body: JSON.stringify({ id: templateId })
      });

      if (response.ok) {
        await loadTemplates();
        alert('Plantilla eliminada');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Error al eliminar plantilla');
    }
  };

  const extractVariables = (content: string): string[] => {
    const matches = content.match(/\{\{([^}]+)\}\}/g);
    return matches ? matches.map(match => match.slice(2, -2).trim()) : [];
  };

  const replaceVariables = (text: string, contact: any): string => {
    return text.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
      const key = variable.trim();
      return contact[key] || match;
    });
  };

  const sendTemplateEmails = async () => {
    if (!selectedTemplate || selectedContacts.length === 0) return;
    
    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) return;
    
    try {
      for (const contactId of selectedContacts) {
        const contact = contacts.find(c => c.id === contactId);
        if (!contact) continue;
        
        const personalizedSubject = replaceVariables(template.subject, contact);
        const personalizedContent = replaceVariables(template.content, contact);
        
        await fetch(`${window.location.origin}/api/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: contact.email,
            subject: personalizedSubject,
            text: personalizedContent,
            isPromotional: true,
            gmailUser: userData?.gmailUser,
            gmailPassword: userData?.gmailPassword,
            templateId: template.id
          })
        });
      }
      
      // Actualizar contador de uso
      await fetch(`${window.location.origin}/api/templates`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-email': user?.email || ''
        },
        body: JSON.stringify({
          ...template,
          timesUsed: template.timesUsed + selectedContacts.length
        })
      });
      
      setShowSendTemplateModal(false);
      setSelectedContacts([]);
      setSelectedTemplate("");
      await loadTemplates();
      
      alert(`Emails enviados exitosamente a ${selectedContacts.length} contactos`);
    } catch (error) {
      console.error('Error sending emails:', error);
      alert('Error al enviar emails');
    }
  };

  const openEditTemplate = (template: any) => {
    setEditingTemplate(template);
    setNewTemplate({
      name: template.name,
      subject: template.subject,
      content: template.content,
      category: template.category
    });
    setShowCreateTemplateModal(true);
  };

  const openSendTemplate = (template: any) => {
    setSelectedTemplate(template);
    setShowSendTemplateModal(true);
  };

  const handleImportContacts = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      let contacts: any[] = [];

      if (file.name.endsWith('.csv')) {
        // Procesar CSV
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          const contact: any = {};
          
          headers.forEach((header, index) => {
            if (header.includes('nombre') || header.includes('name')) {
              contact.name = values[index] || '';
            } else if (header.includes('email') || header.includes('correo')) {
              contact.email = values[index] || '';
            } else if (header.includes('tag') || header.includes('etiqueta')) {
              const tagValue = values[index] || '';
              contact.tags = tagValue ? tagValue.split(',').map(tag => tag.trim()) : [];
            } else if (header.includes('source') || header.includes('fuente')) {
              contact.source = values[index] || '';
            }
          });
          
          if (contact.name && contact.email) {
            contacts.push({
              ...contact,
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              tags: Array.isArray(contact.tags) ? contact.tags : (contact.tags ? [contact.tags] : ['importado']),
              source: contact.source || 'csv-import',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          }
        }
      }

      // Guardar contactos importados
      if (contacts.length > 0) {
        for (const contact of contacts) {
          await fetch(`${window.location.origin}/api/contacts`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-user-email': user?.email || ''
            },
            body: JSON.stringify(contact)
          });
        }
        
        await loadContacts();
        alert(`Se importaron ${contacts.length} contactos exitosamente`);
      } else {
        alert('No se encontraron contactos validos en el archivo');
      }
    } catch (error) {
      console.error('Error importing contacts:', error);
      alert('Error al importar contactos. Verifica el formato del archivo.');
    }
    
    // Limpiar el input
    event.target.value = '';
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

            {/* Navigation Tabs */}
            <div className="border-b bg-background">
              <div className="container max-w-screen-2xl">
                <nav className="flex space-x-8" aria-label="Tabs">
                  <button
                    onClick={() => setActiveTab("generator")}
                    className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
                      activeTab === "generator"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:border-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Generador IA
                  </button>
                  <button
                    onClick={() => setActiveTab("contacts")}
                    className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
                      activeTab === "contacts"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:border-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Contactos
                  </button>
                  {user && (
                    <>
                      <button
                        onClick={() => setActiveTab("pages")}
                        className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
                          activeTab === "pages"
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:border-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Paginas de Captura
                      </button>
                      <button
                        onClick={() => setActiveTab("templates")}
                        className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
                          activeTab === "templates"
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:border-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Plantillas
                      </button>
                    </>
                  )}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <main className="container max-w-screen-2xl py-6">
              {/* Generator Tab */}
              {activeTab === "generator" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Form Section */}
                  <div className="space-y-6">
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                      <div className="p-6">
                        <h2 className="text-2xl font-semibold leading-none tracking-tight mb-6">
                          Generar Email con IA
                        </h2>
                        
                        <div className="space-y-4">
                          {/* Template Selection */}
                          <div>
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              Plantilla (Opcional)
                            </label>
                            <MobileOptimizedSelect
                              value={selectedTemplate}
                              onChange={(value) => {
                                setSelectedTemplate(value);
                                if (value) {
                                  const template = templates.find(t => t.id === value);
                                  if (template) {
                                    setSubject(template.subject);
                                    setPurpose(template.category);
                                  }
                                }
                              }}
                              options={[
                                { value: '', label: 'Elegir plantilla predefinida...' },
                                ...templates.map(template => ({
                                  value: template.id,
                                  label: `${template.name} (${template.category})`
                                }))
                              ]}
                              placeholder="Elegir plantilla predefinida..."
                            />
                          </div>

                          {/* Contact Selection */}
                          <div>
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              Contacto
                            </label>
                            <MobileOptimizedSelect
                              value={selectedContact}
                              onChange={(value) => {
                                setSelectedContact(value);
                                if (value) {
                                  const contact = contacts.find(c => c.id === value);
                                  if (contact) {
                                    setRecipient(contact.email);
                                  }
                                }
                              }}
                              options={[
                                { value: '', label: 'Elegir de mis contactos...' },
                                ...contacts.map(contact => ({
                                  value: contact.id,
                                  label: `${contact.name} • ${contact.email}`
                                }))
                              ]}
                              placeholder="Elegir de mis contactos..."
                            />
                          </div>

                          {/* Recipient */}
                          <div>
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              Destinatario *
                            </label>
                            <MobileOptimizedInput
                              type="email"
                              value={recipient}
                              onChange={(e) => setRecipient(e.target.value)}
                              placeholder="correo@ejemplo.com"
                              required
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
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              Contexto Adicional
                            </label>
                            <MobileOptimizedTextarea
                              value={context}
                              onChange={(e) => setContext(e.target.value)}
                              placeholder="Informacion adicional que ayude a personalizar el email..."
                              rows={3}
                            />
                          </div>

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
              )}

              {/* Contacts Tab */}
              {activeTab === "contacts" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold leading-none tracking-tight">Contactos</h2>
                    <div className="flex space-x-3">
                      <label className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2 cursor-pointer">
                        Importar CSV
                        <input
                          type="file"
                          accept=".csv,.xlsx,.xls"
                          onChange={handleImportContacts}
                          className="hidden"
                        />
                      </label>
                      <button
                        onClick={() => {
                          setEditingContact(null);
                          setShowContactModal(true);
                        }}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                      >
                        Nuevo Contacto
                      </button>
                    </div>
                  </div>

                  {loading ? (
                    <div className="text-muted-foreground">Cargando contactos...</div>
                  ) : contacts.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-muted-foreground mb-4">No tienes contactos creados</div>
                      <button
                        onClick={() => {
                          setEditingContact(null);
                          setShowContactModal(true);
                        }}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-md"
                      >
                        Crear tu primer contacto
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {contacts.map((contact) => (
                        <div key={contact.id} className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold">{contact.name}</h3>
                            <button
                              onClick={() => {
                                setEditingContact(contact);
                                setShowContactModal(true);
                              }}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              Editar
                            </button>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{contact.email}</p>
                          {contact.tags && Array.isArray(contact.tags) && contact.tags.length > 0 && (
                            <p className="text-xs text-muted-foreground mb-1">
                              {contact.tags.join(', ')}
                            </p>
                          )}
                          {contact.source && (
                            <p className="text-xs text-muted-foreground mb-1">
                              {contact.source}
                            </p>
                          )}
                          {contact.additionalContext && (
                            <p className="text-xs text-muted-foreground">
                              {contact.additionalContext.length > 100 ? contact.additionalContext.substring(0, 100) + '...' : contact.additionalContext}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Email Pages Tab */}
              {activeTab === "pages" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold leading-none tracking-tight">Paginas de Captura</h2>
                    <button
                      onClick={() => {
                        setEditingPage(null);
                        setShowPageModal(true);
                      }}
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                    >
                      + Nueva Pagina
                    </button>
                  </div>

                  {loading ? (
                    <div className="text-muted-foreground">Cargando paginas...</div>
                  ) : emailPages.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-muted-foreground mb-4">No tienes paginas de captura creadas</div>
                      <button
                        onClick={() => {
                          setEditingPage(null);
                          setShowPageModal(true);
                        }}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-md"
                      >
                        Crear tu primera pagina
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {emailPages.map((page) => (
                        <div key={page.id} className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold">{page.title}</h3>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setEditingPage(page);
                                  setShowPageModal(true);
                                }}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                Editar
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{page.description}</p>
                          <div className="text-xs text-muted-foreground mb-2">
                            Pagina de captura activa
                          </div>
                          <a
                            href={`/collect/${page.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline"
                          >
                            Ver pagina
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Templates Tab */}
              {activeTab === "templates" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold leading-none tracking-tight">Plantillas de Email</h2>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setEditingTemplate(null);
                          setNewTemplate({ name: '', subject: '', content: '', category: 'general' });
                          setShowCreateTemplateModal(true);
                        }}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                      >
                        Nueva Plantilla
                      </button>
                      {templates.length > 0 && (
                        <button
                          onClick={() => setShowSendTemplateModal(true)}
                          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2"
                        >
                          Enviar Plantilla
                        </button>
                      )}
                    </div>
                  </div>

                  {loading ? (
                    <div className="text-muted-foreground">Cargando plantillas...</div>
                  ) : templates.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-muted-foreground mb-4">No tienes plantillas creadas</div>
                      <button
                        onClick={() => {
                          setEditingTemplate(null);
                          setNewTemplate({ name: '', subject: '', content: '', category: 'general' });
                          setShowCreateTemplateModal(true);
                        }}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-md"
                      >
                        Crear tu primera plantilla
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {templates.map((template) => (
                        <div key={template.id} className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold">{template.name}</h3>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => openEditTemplate(template)}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => openSendTemplate(template)}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                Enviar
                              </button>
                              <button
                                onClick={() => deleteTemplate(template.id)}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                Eliminar
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{template.subject}</p>
                          <p className="text-xs text-muted-foreground mb-2">{template.category}</p>
                          <p className="text-xs text-muted-foreground mb-2">
                            Usado {template.timesUsed || 0} veces
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {template.content.length > 100 ? template.content.substring(0, 100) + '...' : template.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </main>
          </div>
        </MobileContainer>
      </MobileLayout>

      {/* Create/Edit Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  {editingContact ? 'Editar Contacto' : 'Nuevo Contacto'}
                </h2>
                <button
                  onClick={() => {
                    setShowContactModal(false);
                    setEditingContact(null);
                  }}
                  className="text-zinc-400 hover:text-white"
                >
                  X
                </button>
              </div>
              
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  const contactData = {
                    id: editingContact?.id || Date.now().toString(),
                    name: formData.get('name') as string,
                    email: formData.get('email') as string,
                    tags: (formData.get('tags') as string).split(',').map(tag => tag.trim()).filter(tag => tag),
                    source: formData.get('source') as string || 'manual',
                    additionalContext: formData.get('additionalContext') as string || '',
                    createdAt: editingContact?.createdAt || new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  };
                  
                  try {
                    const response = await fetch(`${window.location.origin}/api/contacts`, {
                      method: editingContact ? 'PUT' : 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'x-user-email': user?.email || ''
                      },
                      body: JSON.stringify(contactData)
                    });
                    
                    if (response.ok) {
                      setShowContactModal(false);
                      setEditingContact(null);
                      await loadContacts();
                    }
                  } catch (error) {
                    console.error('Error saving contact:', error);
                  }
                }}
                className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Nombre *</label>
                  <input
                    name="name"
                    type="text"
                    defaultValue={editingContact?.name || ''}
                    required
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nombre del contacto"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Email *</label>
                  <input
                    name="email"
                    type="email"
                    defaultValue={editingContact?.email || ''}
                    required
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="email@ejemplo.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Tags</label>
                  <input
                    name="tags"
                    type="text"
                    defaultValue={editingContact?.tags?.join(', ') || ''}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Fuente</label>
                  <input
                    name="source"
                    type="text"
                    defaultValue={editingContact?.source || ''}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Origen del contacto"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Contexto Adicional</label>
                  <textarea
                    name="additionalContext"
                    defaultValue={editingContact?.additionalContext || ''}
                    rows={3}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Información adicional sobre el contacto que ayude a personalizar los correos..."
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    {editingContact ? 'Actualizar' : 'Crear'} Contacto
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowContactModal(false);
                      setEditingContact(null);
                    }}
                    className="px-4 py-2 border border-zinc-600 text-zinc-300 rounded-md hover:bg-zinc-800 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Template Modal */}
      {showCreateTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  {editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateTemplateModal(false);
                    setEditingTemplate(null);
                    setNewTemplate({ name: '', subject: '', content: '', category: 'general' });
                  }}
                  className="text-zinc-400 hover:text-white"
                >
                  X
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">Nombre</label>
                    <input
                      type="text"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Nombre de la plantilla"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">Categoria</label>
                    <select
                      value={newTemplate.category}
                      onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="general">General</option>
                      <option value="prospeccion">Prospeccion</option>
                      <option value="seguimiento">Seguimiento</option>
                      <option value="promocional">Promocional</option>
                      <option value="informativo">Informativo</option>
                      <option value="agradecimiento">Agradecimiento</option>
                      <option value="recordatorio">Recordatorio</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Asunto</label>
                  <input
                    type="text"
                    value={newTemplate.subject}
                    onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Asunto del email"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Contenido</label>
                  <textarea
                    value={newTemplate.content}
                    onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                    rows={10}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Contenido del email...\n\nPuedes usar variables como {{nombre}}, {{email}}, {{empresa}}, etc."
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowCreateTemplateModal(false);
                      setEditingTemplate(null);
                      setNewTemplate({ name: '', subject: '', content: '', category: 'general' });
                    }}
                    className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={saveTemplate}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    {editingTemplate ? 'Actualizar' : 'Crear'} Plantilla
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Template Modal */}
      {showSendTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  Enviar Plantilla: {templates.find(t => t.id === selectedTemplate)?.name || 'Template'}
                </h2>
                <button
                  onClick={() => {
                    setShowSendTemplateModal(false);
                    setSelectedTemplate("");
                    setSelectedContacts([]);
                  }}
                  className="text-zinc-400 hover:text-white"
                >
                  X
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Seleccionar Contactos</label>
                  <div className="max-h-60 overflow-y-auto border border-zinc-700 rounded-lg">
                    {contacts.map((contact) => (
                      <label key={contact.id} className="flex items-center p-3 hover:bg-zinc-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedContacts.includes(contact.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedContacts([...selectedContacts, contact.id]);
                            } else {
                              setSelectedContacts(selectedContacts.filter(id => id !== contact.id));
                            }
                          }}
                          className="mr-3"
                        />
                        <div>
                          <div className="text-white font-medium">{contact.name}</div>
                          <div className="text-zinc-400 text-sm">{contact.email}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowSendTemplateModal(false);
                      setSelectedTemplate("");
                      setSelectedContacts([]);
                    }}
                    className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={sendTemplateEmails}
                    disabled={selectedContacts.length === 0}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-zinc-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    Enviar a {selectedContacts.length} contacto{selectedContacts.length !== 1 ? 's' : ''}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}

export default CorreosIAPage;
