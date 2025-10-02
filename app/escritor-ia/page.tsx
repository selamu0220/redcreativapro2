"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ProtectedRoute from "../components/ProtectedRoute";
import GuestTrialInterface from "../components/GuestTrialInterface";
import VideoModal from "../components/VideoModal";
import MobileLayout, { MobileContainer } from "../components/MobileLayout";
import ResponsiveGrid from "../components/ResponsiveGrid";
import { TypewriterText } from "../components/TypewriterText";
import { MobileOptimizedForm, MobileOptimizedInput, MobileOptimizedTextarea, MobileOptimizedSelect } from "../components/MobileFormOptimizations";
import { MobileOptimizedLoader, MobileErrorState, useLoadingState } from "../components/MobileLoadingStates";
import { useAuth } from '../hooks/useAuth';
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';
import { useSubscription, usePremiumAccess, usePremiumTheme } from "../hooks/useSubscription";
import { usePremiumAccess as useNewPremiumAccess } from "../hooks/usePremiumAccess";
import { useSubscriptionManagement } from "../hooks/useSubscriptionManagement";
import { useDocuments, DocumentData } from "../hooks/useDocuments";
import { useGuestTrial } from "../hooks/useGuestTrial";
import { useViewport } from "../hooks/useViewport";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import PremiumBadge, { PremiumCrownBadge, PremiumStarBadge } from "../components/PremiumBadge";
import PremiumGate, { PremiumFeatureGate } from "../components/PremiumGate";

interface DocumentPage {
  id: string;
  content: string;
  title: string;
}

function EscritorIAPage() {
  const { user } = useAuth();
  const { get, post, put, del } = useAuthenticatedFetch();
  const { subscriptionData } = useSubscription();
  const { hasAccess: hasPremiumAccess } = usePremiumAccess();
  const { isPremium, getThemeClasses } = usePremiumTheme();
  const { isTrialActive, canStartTrial, stopGuestTrial } = useGuestTrial();
  const {
    documents,
    folders,
    currentFolderId,
    loading: documentsLoading,
    error: documentsError,
    loadDocuments,
    loadFolders,
    createDocument,
    updateDocument,
    deleteDocument,
    createFolder,
    navigateToFolder
  } = useDocuments(user?.email || '');
  
  const [pages, setPages] = useState<DocumentPage[]>([
    { id: "1", content: "", title: "Documento sin título" }
  ]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [documentTitle, setDocumentTitle] = useState("Documento sin título");
  const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(null);
  const [showDocumentManager, setShowDocumentManager] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveAsNew, setSaveAsNew] = useState(false);
  const [fontSize, setFontSize] = useState(12);
  const [fontFamily, setFontFamily] = useState("Times New Roman");
  const [zoom, setZoom] = useState(100);
  const [showRuler, setShowRuler] = useState(true);
  const [isImproving, setIsImproving] = useState(false);
  const textareaRefs = useRef<(HTMLTextAreaElement | null)[]>([]);

  // Estados para manejo de errores
  const [lastError, setLastError] = useState<{
    message: string;
    type?: string;
    retryable?: boolean;
    timestamp: number;
  } | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Estados para configuración de IA
  const [showAIConfig, setShowAIConfig] = useState(false);
  const [aiTone, setAiTone] = useState('profesional');
  const [aiStyle, setAiStyle] = useState('formal');
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [aiCreativity, setAiCreativity] = useState(50);
  const [autoImprove, setAutoImprove] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [savedPrompts, setSavedPrompts] = useState<string[]>([]);
  
  // Estados para mejora automática avanzada
  const [aiModel, setAiModel] = useState('openai/gpt-4o');
  const [autoImproveDelay, setAutoImproveDelay] = useState(500); // 0.5 segundos
  const [minWordsForAutoImprove, setMinWordsForAutoImprove] = useState(5);
  const [isTyping, setIsTyping] = useState(false);
  const [lastTypingTime, setLastTypingTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [lastKeyPressed, setLastKeyPressed] = useState('');
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoImproveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const enhancedAutoImprove = useRef<boolean>(false);

  // Estados para sistema de versiones automático
  const [contentVersions, setContentVersions] = useState<string[]>([]);
  const [currentVersionIndex, setCurrentVersionIndex] = useState(-1);
  const [isShowingVersions, setIsShowingVersions] = useState(false);
  const [versionHistory, setVersionHistory] = useState<string[]>([]);
  const [maxVersions, setMaxVersions] = useState(10);
  const [autoVersioning, setAutoVersioning] = useState(false);
  const [changesCount, setChangesCount] = useState(0);
  const [isGeneratingVersions, setIsGeneratingVersions] = useState(false);
  const [originalContent, setOriginalContent] = useState('');
  const [shouldCancelGeneration, setShouldCancelGeneration] = useState(false);
  
  // Estados para modo agente
  const [agentMode, setAgentMode] = useState(false);
  const [showAgentSettings, setShowAgentSettings] = useState(false);
  const [agentPersonality, setAgentPersonality] = useState('profesional');
  const [agentIndustry, setAgentIndustry] = useState('general');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  
  // Estados para sistema de colores alternos
  const [sectionColors, setSectionColors] = useState<string[]>([]);
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const colorPalette = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#f97316', '#06b6d4', '#84cc16'];
  
  // Estados para líneas mejoradas
  const [improvedLines, setImprovedLines] = useState<{[key: number]: string}>({});
  const [lineColors, setLineColors] = useState<{[key: number]: string}>({});
  
  // Estados para controles de mejora
  const [changeIntensity, setChangeIntensity] = useState(20); // 0-100: intensidad de cambios (por defecto muy sutil)
  const [textExpansion, setTextExpansion] = useState(10); // 0-100: cuánto expandir el texto (por defecto mínimo)
  const [preserveCursor, setPreserveCursor] = useState(true); // mantener posición del cursor
  
  // Estados para nuevas funcionalidades
  const [isTextChanging, setIsTextChanging] = useState(false); // Para subrayado azul
  const [changeAllText, setChangeAllText] = useState(true); // Switch para cambiar todo o solo último
  const [changedSentences, setChangedSentences] = useState<{[key: number]: {original: string, versions: string[], currentVersion: number}}>({});
  const [sentenceVersions, setSentenceVersions] = useState<{[key: number]: string[]}>({});
  const [showVersionTooltip, setShowVersionTooltip] = useState<number | null>(null);
  const [lastUnchangedText, setLastUnchangedText] = useState('');

  // Estados para funcionalidades de formato avanzado
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [textColor, setTextColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [textAlign, setTextAlign] = useState('left');
  const [showFormatToolbar, setShowFormatToolbar] = useState(true);
  const [selectedFont, setSelectedFont] = useState('Arial');
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [selectedText, setSelectedText] = useState('');
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const [insertedImages, setInsertedImages] = useState<{[key: string]: string}>({});
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [lineHeight, setLineHeight] = useState(1.6);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [textIndent, setTextIndent] = useState(0);

  // Modelos disponibles
  const availableModels = [
    { id: 'openai/gpt-4o', name: 'GPT-4o', description: 'Modelo ultra-rápido y ligero (recomendado)' },
    { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', description: 'Modelo económico y eficiente' },
    { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Modelo avanzado para tareas complejas' },
    { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', description: 'Modelo de Google vía OpenRouter' },
    { id: 'meta-llama/llama-3.1-8b-instruct', name: 'Llama 3.1 8B', description: 'Modelo open source rápido' }
  ];

  // Estados para velocidad de navegación
  const [navigationSpeed, setNavigationSpeed] = useState(200); // 0.2 segundos por defecto
  const [isNavigating, setIsNavigating] = useState(false);

  // Estados adicionales para funcionalidades avanzadas
  const [documentContext, setDocumentContext] = useState('');
  const [agentActions, setAgentActions] = useState<Array<{id: string, name: string, description: string}>>([]);
  
  // Categorías y prompts por industria
  const industryCategories = {
    'general': {
      name: 'General',
      actions: [
        {id: 'improve', name: 'Mejorar texto', description: 'Mejora la calidad y claridad del texto'},
        {id: 'summarize', name: 'Resumir', description: 'Crea un resumen del contenido'},
        {id: 'expand', name: 'Expandir', description: 'Añade más detalles y contenido'},
        {id: 'tone', name: 'Cambiar tono', description: 'Modifica el tono del texto'}
      ]
    },
    'marketing': {
      name: 'Marketing',
      actions: [
        {id: 'copywriting', name: 'Copy profesional', description: 'Crea texto profesional convincente'},
        {id: 'email_campaign', name: 'Email marketing', description: 'Genera emails promocionales'},
        {id: 'social_media', name: 'Redes sociales', description: 'Crea contenido para RRSS'},
        {id: 'landing_page', name: 'Landing page', description: 'Texto para páginas de aterrizaje'}
      ]
    },
    'seo': {
      name: 'SEO y Contenido',
      actions: [
        {id: 'seo_article', name: 'Artículo SEO', description: 'Optimiza para motores de búsqueda'},
        {id: 'meta_description', name: 'Meta descripción', description: 'Crea meta descripciones optimizadas'},
        {id: 'keywords', name: 'Palabras clave', description: 'Integra keywords naturalmente'},
        {id: 'blog_post', name: 'Post de blog', description: 'Estructura para blog posts'}
      ]
    },
    'academic': {
      name: 'Académico',
      actions: [
        {id: 'research', name: 'Texto académico', description: 'Estilo formal y académico'},
        {id: 'citation', name: 'Citas y referencias', description: 'Formato de citas académicas'},
        {id: 'thesis', name: 'Tesis/ensayo', description: 'Estructura de ensayos académicos'},
        {id: 'abstract', name: 'Abstract', description: 'Resumen académico'}
      ]
    },
    'business': {
      name: 'Negocios',
      actions: [
        {id: 'proposal', name: 'Propuesta comercial', description: 'Documentos de propuestas'},
        {id: 'report', name: 'Informe ejecutivo', description: 'Reportes profesionales'},
        {id: 'presentation', name: 'Presentación', description: 'Contenido para presentaciones'},
        {id: 'memo', name: 'Memorándum', description: 'Comunicación interna'}
      ]
    }
  };
  
  // Personalidades del agente
  const agentPersonalities = {
    'profesional': 'Soy un asistente profesional y directo, enfocado en la eficiencia y claridad.',
    'creativo': 'Soy un asistente creativo e innovador, me encanta explorar ideas originales.',
    'amigable': 'Soy un asistente amigable y cercano, siempre dispuesto a ayudar con entusiasmo.',
    'academico': 'Soy un asistente académico riguroso, enfocado en precisión y metodología.',
    'casual': 'Soy un asistente relajado y casual, hablo de manera natural y sin formalismos.'
  };

  // Cargar documentos al inicializar
  useEffect(() => {
    if (user?.email) {
      loadDocuments();
      loadFolders();
    }
  }, [user?.email]);

  // Funciones para manejar documentos
  const saveDocument = async () => {
    if (!user?.email) return;
    
    const content = pages.map(page => page.content).join('\n\n--- Nueva Página ---\n\n');
    
    try {
      if (currentDocumentId && !saveAsNew) {
        // Actualizar documento existente
        await updateDocument(currentDocumentId, {
          title: documentTitle,
          content,
          category: currentFolderId
        });
        alert('Documento actualizado correctamente');
      } else {
        // Crear nuevo documento
        const newDoc = await createDocument({
          title: documentTitle,
          content,
          category: currentFolderId
        });
        setCurrentDocumentId(newDoc.id);
        setSaveAsNew(false);
        alert('Documento guardado correctamente');
      }
      setShowSaveDialog(false);
      loadDocuments(currentFolderId);
    } catch (error) {
      console.error('Error al guardar documento:', error);
      alert('Error al guardar el documento');
    }
  };

  const loadDocument = (doc: DocumentData) => {
    const content = doc.content;
    const pageContents = content.split('\n\n--- Nueva Página ---\n\n');
    
    const newPages: DocumentPage[] = pageContents.map((pageContent, index) => ({
      id: `${doc.id}-page-${index}`,
      content: pageContent,
      title: doc.title
    }));
    
    setPages(newPages);
    setCurrentPageIndex(0);
    setDocumentTitle(doc.title);
    setCurrentDocumentId(doc.id);
    setShowDocumentManager(false);
    
    // Limpiar historial de versiones al cargar nuevo documento
    setVersionHistory([]);
    setIsShowingVersions(false);
    setCurrentVersionIndex(-1);
  };

  const createNewDocument = () => {
    setPages([{ id: "1", content: "", title: "Documento sin título" }]);
    setCurrentPageIndex(0);
    setDocumentTitle("Documento sin título");
    setCurrentDocumentId(null);
    setSaveAsNew(false);
    
    // Limpiar historial de versiones
    setVersionHistory([]);
    setIsShowingVersions(false);
    setCurrentVersionIndex(-1);
  };

  const handleSaveAs = () => {
    setSaveAsNew(true);
    setShowSaveDialog(true);
  };

  // Estado para verificar si estamos en el cliente
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Cargar configuración desde localStorage
  useEffect(() => {
    if (!isClient) return;
    
    const savedModel = localStorage.getItem('openrouter_model');
    if (savedModel) {
      setAiModel(savedModel);
    }
    
    const savedNavigationSpeed = localStorage.getItem('navigationSpeed');
    if (savedNavigationSpeed) {
      setNavigationSpeed(Number(savedNavigationSpeed));
    }
    
    const savedChangeIntensity = localStorage.getItem('changeIntensity');
    if (savedChangeIntensity) {
      setChangeIntensity(Number(savedChangeIntensity));
    }
    
    const savedTextExpansion = localStorage.getItem('textExpansion');
    if (savedTextExpansion) {
      setTextExpansion(Number(savedTextExpansion));
    }
    
    const savedPreserveCursor = localStorage.getItem('preserveCursor');
    if (savedPreserveCursor) {
      setPreserveCursor(savedPreserveCursor === 'true');
    }
  }, [isClient]);

  // Guardar configuración en localStorage cuando cambie
  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem('openrouter_model', aiModel);
  }, [aiModel, isClient]);
  
  // Guardar velocidad de navegación en localStorage
  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem('navigationSpeed', navigationSpeed.toString());
  }, [navigationSpeed, isClient]);

  // Guardar configuraciones de mejora en localStorage
  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem('changeIntensity', changeIntensity.toString());
  }, [changeIntensity, isClient]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem('textExpansion', textExpansion.toString());
  }, [textExpansion, isClient]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem('preserveCursor', preserveCursor.toString());
  }, [preserveCursor, isClient]);

  const currentPage = pages[currentPageIndex];
  const content = currentPage?.content || "";
  const whitespacePattern = /\s+/;
  const wordCount = content.trim() ? content.trim().split(whitespacePattern).length : 0;
  const readingTime = Math.ceil(wordCount / 200);

  const updatePageContent = (content: string, isAIGenerated = false) => {
    setPages(prev => prev.map((page, index) => 
      index === currentPageIndex ? { ...page, content } : page
    ));
  };

  // Función para mejorar contenido
  const improveContent = async (customPromptText = '', isAutoImprove = false) => {
    if (isImproving) return;
    
    const currentContent = content;
    if (!currentContent.trim()) {
      alert('Por favor, escribe algo de texto antes de mejorarlo.');
      return;
    }
    
    setIsImproving(true);
    
    try {
      // Construir prompt dinámico basado en configuraciones
      let intensityInstruction = '';
      if (changeIntensity <= 25) {
        intensityInstruction = 'CONSERVA EXACTAMENTE el significado y contexto original. Solo corrige errores ortográficos o gramaticales evidentes sin cambiar palabras.';
      } else if (changeIntensity <= 50) {
        intensityInstruction = 'Mantén el significado original. Mejora solo gramática y claridad básica sin cambiar el estilo o tono.';
      } else if (changeIntensity <= 75) {
        intensityInstruction = 'Respeta el contexto original. Mejora estructura y vocabulario manteniendo la esencia del texto.';
      } else {
        intensityInstruction = 'Puedes hacer cambios más amplios pero siempre respetando el mensaje y contexto original.';
      }
      
      let expansionInstruction = '';
      if (textExpansion <= 25) {
        expansionInstruction = 'NO agregues contenido nuevo. MANTÉN exactamente la misma longitud y cantidad de información.';
      } else if (textExpansion <= 50) {
        expansionInstruction = 'Mantén longitud muy similar. Solo pequeños ajustes de palabras si es absolutamente necesario.';
      } else if (textExpansion <= 75) {
        expansionInstruction = 'Puedes expandir ligeramente con detalles que complementen el contenido original.';
      } else {
        expansionInstruction = 'Puedes expandir con ejemplos y detalles relevantes al contexto original.';
      }
      
      const prompt = customPromptText || customPrompt || `IMPORTANTE: ${intensityInstruction} ${expansionInstruction} Mejora el texto respetando su contexto, significado y propósito original con un tono ${aiTone} y estilo ${aiStyle}. NO cambies el tema ni el enfoque. NO inventes información nueva. NO añadas saludos, firmas o elementos externos. NO uses placeholders genéricos como Señor/Señora:, o/a, (nombre), (apellido), Sr./Sra., Estimado/a o similares. Creatividad: ${aiCreativity}%. Devuelve ÚNICAMENTE el texto mejorado.`;
      
      // Obtener API key personalizada del usuario si está disponible
      const userApiKey = typeof window !== 'undefined' ? localStorage.getItem('openrouter_api_key') : null;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Agregar API key personalizada si está disponible
      if (userApiKey) {
        headers['x-api-key'] = userApiKey;
      }
      
      const data = await post('/api/improve-content', {
        content: currentContent,
        prompt,
        model: aiModel,
        temperature: aiCreativity / 100,
        maxTokens: 2000
      });
      
      if (!data.success) {
        // Manejar diferentes tipos de errores
        let errorMessage = data.error || 'Error al mejorar el contenido';
        
        if (data.errorType === 'AUTHENTICATION') {
          errorMessage = `🔑 ${data.error}\n\nPasos para solucionarlo:\n1. Ve a https://openrouter.ai/keys\n2. Crea una nueva API key\n3. Ve a Ajustes y configura tu API key personal`;
        } else if (data.errorType === 'QUOTA_EXCEEDED') {
          errorMessage = `📊 ${data.error}\n\nEspera unos minutos antes de intentar de nuevo.`;
        } else if (data.retryable) {
          errorMessage = `⚠️ ${data.error}\n\nEste error es temporal. Intenta de nuevo en unos momentos.`;
        }
        
        throw new Error(errorMessage);
      }
      
      if (data.improvedContent) {
        updatePageContent(data.improvedContent, true);
        
        // Log de éxito con metadata
        if (data.metadata) {
          console.log('✅ Contenido mejorado exitosamente:', {
            model: data.metadata.model,
            responseTime: data.metadata.responseTime + 'ms',
            tokensUsed: data.metadata.tokensUsed
          });
        }
      } else {
        throw new Error('No se recibió contenido mejorado');
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      // Guardar el error para mostrar en el UI
      setLastError({
        message: errorMessage,
        type: 'UNKNOWN',
        retryable: false,
        timestamp: Date.now()
      });
      setShowErrorDialog(true);
      setRetryCount(prev => prev + 1);
    } finally {
      setIsImproving(false);
    }
  };

  // Función para manejar el cambio de contenido
  const handleContentChange = (newContent: string) => {
    updatePageContent(newContent);
    setLastTypingTime(Date.now());
    
    // Limpiar timeouts anteriores
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (autoImproveTimeoutRef.current) {
      clearTimeout(autoImproveTimeoutRef.current);
    }
    
    // Establecer nuevo timeout para detectar cuando para de escribir
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
    
    setIsTyping(true);
    
    // Si la mejora automática enhanced está activada y no está pausada
    if (enhancedAutoImprove.current && !isPaused && !isImproving) {
      const wordCount = newContent.trim().split(/\s+/).length;
      if (wordCount >= minWordsForAutoImprove) {
        // Programar mejora automática después del delay
        autoImproveTimeoutRef.current = setTimeout(() => {
          if (!isPaused && !isImproving && enhancedAutoImprove.current) {
            improveContent('', true);
          }
        }, autoImproveDelay);
      }
    }
  };

  // Función para navegar entre versiones
  const navigateVersion = (direction: 'prev' | 'next') => {
    if (versionHistory.length === 0) return;
    
    let newIndex = currentVersionIndex;
    if (direction === 'prev') {
      newIndex = currentVersionIndex > 0 ? currentVersionIndex - 1 : versionHistory.length - 1;
    } else {
      newIndex = currentVersionIndex < versionHistory.length - 1 ? currentVersionIndex + 1 : 0;
    }
    
    setCurrentVersionIndex(newIndex);
    if (versionHistory[newIndex]) {
      updatePageContent(versionHistory[newIndex]);
    }
  };
  
  // Función para seleccionar versión específica
  const selectVersion = (index: number) => {
    if (index >= 0 && index < versionHistory.length) {
      setCurrentVersionIndex(index);
      if (versionHistory[index]) {
        updatePageContent(versionHistory[index]);
      }
    }
  };

  // Función para cerrar el modo de versiones
  const closeVersionMode = () => {
    setIsShowingVersions(false);
    setCurrentVersionIndex(-1);
  };

  // Función para limpiar el historial de versiones
  const clearVersionHistory = () => {
    setVersionHistory([]);
    setCurrentVersionIndex(-1);
    if (isShowingVersions) {
      setIsShowingVersions(false);
    }
  };

  // Función para generar nueva versión con IA
  const generateNewVersion = async (direction: 'up' | 'down') => {
    if (isGeneratingVersions || !content.trim()) return;
    
    setIsGeneratingVersions(true);
    
    try {
      const prompt = direction === 'up' ? 
        'Mejora este texto haciéndolo más profesional y detallado:' : 
        'Simplifica este texto haciéndolo más conciso y directo:';
      
      const data = await post('/api/improve-content', { content, prompt, model: aiModel });
      
      if (data.success) {
        const newVersion = data.improvedContent;
        
        // Agregar nueva versión al historial
        const updatedVersions = [...versionHistory, newVersion];
        setVersionHistory(updatedVersions);
        
        // Navegar a la nueva versión
        const newIndex = updatedVersions.length - 1;
        setCurrentVersionIndex(newIndex);
        updatePageContent(newVersion);
        
        // Activar modo versión si no está activo
        if (!isShowingVersions) {
          setIsShowingVersions(true);
        }
      }
    } catch (error) {
      console.error('Error generando nueva versión:', error);
    } finally {
      setIsGeneratingVersions(false);
    }
  };

  // Función para mostrar/ocultar versiones
  const toggleVersions = () => {
    if (versionHistory.length > 0) {
      setIsShowingVersions(!isShowingVersions);
    }
  };

  // Limpiar timeouts al desmontar el componente
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (autoImproveTimeoutRef.current) {
        clearTimeout(autoImproveTimeoutRef.current);
      }
    };
  }, []);

  // Manejar teclas de navegación y mejora
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Solo procesar si el foco está en el editor
      const activeElement = document.activeElement;
      const isInEditor = activeElement?.getAttribute('contenteditable') === 'true' || activeElement?.tagName === 'TEXTAREA';
      
      if (!isInEditor) return;
      
      // Flechas arriba/abajo para generar versiones
      if (e.key === 'ArrowUp' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        generateNewVersion('up');
      } else if (e.key === 'ArrowDown' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        generateNewVersion('down');
      }
      
      // Navegación entre versiones con Shift + flechas
      if (isShowingVersions && versionHistory.length > 0) {
        if (e.key === 'ArrowLeft' && e.shiftKey) {
          e.preventDefault();
          navigateVersion('prev');
        } else if (e.key === 'ArrowRight' && e.shiftKey) {
          e.preventDefault();
          navigateVersion('next');
        }
      }
      
      // Escape para cerrar modo versiones
      if (e.key === 'Escape' && isShowingVersions) {
        closeVersionMode();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isShowingVersions, versionHistory, currentVersionIndex, isGeneratingVersions]);

  // Efecto para manejar la reanudación automática después de pausar
  useEffect(() => {
    let resumeTimeout: NodeJS.Timeout;
    
    if (isPaused && !isTyping) {
      resumeTimeout = setTimeout(() => {
        setIsPaused(false);
      }, 3000); // Reanudar después de 3 segundos de inactividad
    }
    
    return () => {
      if (resumeTimeout) {
        clearTimeout(resumeTimeout);
      }
    };
  }, [isPaused, isTyping]);

  return (
    <ProtectedRoute>
      <MobileLayout>
        <MobileContainer>
          <div className={getThemeClasses('min-h-screen bg-background', 'premium-bg-subtle')}>
            {/* Header - Compacto para móvil */}
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container mx-auto px-3 py-2 md:px-4 md:py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 md:space-x-4">
                    <Link href="/dashboard" className="flex items-center space-x-1 md:space-x-2 hover:opacity-80 transition-opacity">
                      <div className="w-6 h-6 md:w-8 md:h-8 bg-primary rounded-md flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-xs md:text-sm">✍️</span>
                      </div>
                      <span className="text-xs md:text-sm font-medium text-foreground hidden sm:inline">
                        Dashboard
                      </span>
                    </Link>
                    <div className="h-3 w-px bg-border hidden sm:block"></div>
                    <div className="flex items-center space-x-1 md:space-x-2">
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full"></div>
                      <h1 className={getThemeClasses('text-sm md:text-lg font-semibold text-foreground', 'premium-text')}>
                        Escritor IA
                      </h1>
                      {isPremium && <PremiumCrownBadge size="sm" />}
                      {documentTitle && (
                        <span className="text-muted-foreground text-xs md:text-sm hidden sm:inline">- {documentTitle}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 md:space-x-2">
                    <button
                      onClick={() => setShowVideoModal(true)}
                      className="inline-flex items-center justify-center rounded-md text-xs md:text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-7 px-2 md:h-9 md:px-3"
                      title="Ver tutorial"
                    >
                      <svg className="h-3 w-3 md:h-4 md:w-4 md:mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      <span className="hidden md:inline">Tutorial</span>
                    </button>
                  </div>
                </div>
              </div>
            </header>

            <div className="container mx-auto px-2 py-2 md:px-4 md:py-6 mobile-compact">


        {/* Panel de navegación entre versiones - Compacto para móvil */}
        {isShowingVersions && versionHistory.length > 0 && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 rounded-lg border bg-card text-card-foreground shadow-xl p-3 md:p-4 z-50 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center text-sm md:text-base">
                📚 Historial de Versiones ({versionHistory.length})
              </h3>
              <button
                onClick={() => setIsShowingVersions(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center text-sm md:text-base">
                📚 Historial de Versiones ({versionHistory.length})
              </h3>
              <button
                onClick={() => setIsShowingVersions(false)}
                className="text-gray-600 hover:text-black"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {versionHistory.map((version, index) => (
                <div
                  key={index}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    currentVersionIndex === versionHistory.length - 1 - index
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                  onClick={() => selectVersion(versionHistory.length - 1 - index)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">
                        Versión {versionHistory.length - index}
                      </span>
                      {currentVersionIndex === versionHistory.length - 1 - index && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                          Actual
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>📝 {version ? version.split(' ').length : 0} palabras</span>
                      <span>⏰ {new Date().toLocaleTimeString()}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {version ? version.substring(0, 150) : 'Sin contenido'}...
                  </p>
                  
                  {/* Botones de acción para cada versión */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2">
                      {currentVersionIndex === versionHistory.length - 1 - index ? (
                        <span className="text-xs text-green-600 font-medium">✓ Versión activa</span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            selectVersion(versionHistory.length - 1 - index);
                          }}
                          className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                        >
                          ✓ Aplicar
                        </button>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          generateNewVersion('up');
                        }}
                        disabled={isGeneratingVersions}
                        className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded hover:bg-green-200 transition-colors disabled:opacity-50"
                        title="Mejorar esta versión"
                      >
                        ↑ Mejorar
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          generateNewVersion('down');
                        }}
                        disabled={isGeneratingVersions}
                        className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 transition-colors disabled:opacity-50"
                        title="Simplificar esta versión"
                      >
                        ↓ Simplificar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Controles del panel */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <button
                  onClick={clearVersionHistory}
                  className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200 transition-colors"
                >
                  🗑️ Limpiar historial
                </button>
              </div>
              
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>Usa ↑↓ para mejorar/simplificar</span>
                <span>•</span>
                <span>Shift+←→ para navegar</span>
                <span>•</span>
                <span>Esc para cerrar</span>
              </div>
            </div>
          </div>
        )}

              {/* Toolbar compacto para móvil */}
              <div className="mb-4 md:mb-6">
                <div className="flex flex-wrap gap-2 md:gap-3">
                  <button
                    onClick={() => setShowDocumentManager(true)}
                    className="inline-flex items-center justify-center rounded-md text-xs md:text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-7 px-2 md:h-9 md:px-3"
                    title="Gestionar documentos"
                  >
                    <svg className="w-3 h-3 md:w-4 md:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0a2 2 0 01-2 2H10a2 2 0 01-2-2v0z" />
                    </svg>
                    <span className="hidden sm:inline">Documentos</span>
                    <span className="sm:hidden">Docs</span>
                  </button>
                  
                  <button
                    onClick={createNewDocument}
                    className="inline-flex items-center justify-center rounded-md text-xs md:text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-7 px-2 md:h-9 md:px-3"
                    title="Nuevo documento"
                  >
                    <svg className="w-3 h-3 md:w-4 md:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="hidden sm:inline">Nuevo</span>
                    <span className="sm:hidden">+</span>
                  </button>
                  
                  <button
                    onClick={() => setShowSaveDialog(true)}
                    className="inline-flex items-center justify-center rounded-md text-xs md:text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-7 px-2 md:h-9 md:px-3"
                    title="Guardar documento"
                  >
                    <svg className="w-3 h-3 md:w-4 md:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="hidden sm:inline">Guardar</span>
                    <span className="sm:hidden">💾</span>
                  </button>
                  
                  {versionHistory.length > 0 && (
                    <button
                      onClick={toggleVersions}
                      className={`inline-flex items-center justify-center rounded-md text-xs md:text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-7 px-2 md:h-9 md:px-3 ${
                        isShowingVersions 
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                          : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
                      }`}
                      title="Ver historial de versiones"
                    >
                      <svg className="w-3 h-3 md:w-4 md:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span className="hidden sm:inline">Versiones ({versionHistory.length})</span>
                      <span className="sm:hidden">V{versionHistory.length}</span>
                    </button>
                  )}
                </div>
              </div>
        
        {/* Área principal */}
        <div className="flex h-[calc(100vh-80px)]">
          {/* Editor principal */}
          <div className="flex-1 flex flex-col">
            {/* Barra de herramientas del editor */}
            <div className="bg-gray-100 border-b border-gray-300 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Estadísticas del documento */}
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>📄 Página {currentPageIndex + 1}</span>
                    <span>📝 {wordCount} palabras</span>
                    <span>🔤 {content.length} caracteres</span>
                    <span>⏱️ {readingTime} min lectura</span>
                  </div>
                </div>
                
                {/* Controles de IA y versiones */}
                <div className="flex items-center space-x-2">
                  {/* Botones de mejora con IA */}
                  <div className={getThemeClasses('flex items-center space-x-1 bg-white border rounded px-2 py-1 border-gray-300', 'premium-border premium-shadow')}>
                    <button
                      onClick={() => generateNewVersion('up')}
                      disabled={isGeneratingVersions || !content.trim()}
                      className={getThemeClasses('px-2 py-1 text-green-600 hover:bg-green-50 rounded text-sm transition-colors disabled:opacity-50', 'premium-button')}
                      title="Mejorar texto (↑)"
                    >
                      ↑ Mejorar
                      {isPremium && <span className="ml-1">✨</span>}
                    </button>
                    <div className="w-px h-4 bg-gray-300"></div>
                    <button
                      onClick={() => generateNewVersion('down')}
                      disabled={isGeneratingVersions || !content.trim()}
                      className={getThemeClasses('px-2 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm transition-colors disabled:opacity-50', 'premium-button')}
                      title="Simplificar texto (↓)"
                    >
                      ↓ Simplificar
                      {isPremium && <span className="ml-1">✨</span>}
                    </button>
                  </div>
                  
                  {/* Navegación entre versiones */}
                  {isShowingVersions && versionHistory.length > 0 && (
                    <div className="flex items-center space-x-1 bg-blue-50 border border-blue-200 rounded px-2 py-1">
                      <button
                        onClick={() => navigateVersion('prev')}
                        disabled={versionHistory.length === 0}
                        className="px-2 py-1 text-blue-600 hover:bg-blue-100 rounded text-sm transition-colors disabled:opacity-50"
                        title="Versión anterior (Shift+←)"
                      >
                        ← Anterior
                      </button>
                      <span className="text-xs text-blue-600 px-1">
                        {currentVersionIndex >= 0 ? versionHistory.length - currentVersionIndex : 0}/{versionHistory.length}
                      </span>
                      <button
                        onClick={() => navigateVersion('next')}
                        disabled={versionHistory.length === 0}
                        className="px-2 py-1 text-blue-600 hover:bg-blue-100 rounded text-sm transition-colors disabled:opacity-50"
                        title="Versión siguiente (Shift+→)"
                      >
                        Siguiente →
                      </button>
                    </div>
                  )}
                  
                  {/* Indicador de estado */}
                  {isGeneratingVersions && (
                    <div className="flex items-center space-x-1 text-sm text-orange-600">
                      <div className="animate-spin w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full"></div>
                      <span>Generando...</span>
                    </div>
                  )}
                </div>
                
                {/* Botones de acción rápida */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => improveContent()}
                    disabled={isImproving || !content.trim()}
                    className={`${isPremium ? 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 shadow-lg shadow-amber-500/25' : 'bg-blue-600 hover:bg-blue-700'} disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300`}
                  >
                    {isImproving ? '🔄 Mejorando...' : `${isPremium ? '✨' : '✨'} Mejorar Texto${isPremium ? ' ✨' : ''}`}
                  </button>
                  
                  {/* Indicador de mejora automática enhanced */}
                  {enhancedAutoImprove.current && (
                    <div className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                      <div className={`w-2 h-2 rounded-full ${
                        isImproving ? 'bg-green-500 animate-pulse' : 
                        isPaused ? 'bg-orange-500' : 
                        'bg-blue-500 animate-pulse'
                      }`}></div>
                      <span className="text-xs font-medium text-gray-700">
                        {isImproving ? '🔄 Mejorando' : 
                         isPaused ? '⏸️ Pausado' : 
                         '🚀 Auto-mejora 0.5s'}
                      </span>
                    </div>
                  )}
                  
                  <button
                    onClick={() => setShowAIConfig(!showAIConfig)}
                    className={`${isPremium ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/25' : 'bg-gray-600 hover:bg-gray-700'} text-white px-3 py-2 rounded text-sm transition-all duration-300 flex items-center space-x-1`}
                  >
                    <span>⚙️ Configurar</span>
                    {isPremium && <PremiumStarBadge />}
                  </button>
                </div>
              </div>
            </div>
            
              {/* Estadísticas compactas */}
              <div className="mb-4 md:mb-6">
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                  <div className="p-2 md:p-3">
                    <div className="flex flex-wrap gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Página {currentPageIndex + 1}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        {wordCount} palabras
                      </span>
                      <span className="flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {readingTime} min lectura
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controles de IA compactos */}
              {content.trim() && (
                <div className="mb-4 md:mb-6">
                  <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                    <div className="p-2 md:p-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => generateNewVersion('up')}
                          disabled={isGeneratingVersions || !content.trim()}
                          className={`inline-flex items-center justify-center rounded-md text-xs md:text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${isPremium ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-emerald-500/25' : 'bg-green-600 hover:bg-green-700'} text-white h-7 px-2 md:h-8 md:px-3`}
                          title="Mejorar texto (↑)"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                          <span className="hidden sm:inline">Mejorar{isPremium ? ' ✨' : ''}</span>
                          <span className="sm:hidden">↑</span>
                        </button>
                        
                        <button
                          onClick={() => generateNewVersion('down')}
                          disabled={isGeneratingVersions || !content.trim()}
                          className={`inline-flex items-center justify-center rounded-md text-xs md:text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${isPremium ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25' : 'bg-blue-600 hover:bg-blue-700'} text-white h-7 px-2 md:h-8 md:px-3`}
                          title="Simplificar texto (↓)"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                          <span className="hidden sm:inline">Simplificar{isPremium ? ' ✨' : ''}</span>
                          <span className="sm:hidden">↓</span>
                        </button>

                        <button
                          onClick={() => improveContent()}
                          disabled={isImproving || !content.trim()}
                          className={`inline-flex items-center justify-center rounded-md text-xs md:text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${isPremium ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-500/25' : 'bg-primary hover:bg-primary/90'} text-primary-foreground h-7 px-2 md:h-8 md:px-3`}
                          title="Mejorar con IA"
                        >
                          {isImproving ? (
                            <svg className="animate-spin w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          )}
                          <span className="hidden sm:inline">{isImproving ? 'Mejorando...' : `Mejorar IA${isPremium ? ' ✨' : ''}`}</span>
                          <span className="sm:hidden">{isImproving ? '...' : '⚡'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Editor de texto compacto */}
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-3 md:p-6">
                  <MobileOptimizedTextarea
                    value={content}
                    onChange={(e) => {
                      handleContentChange(e.target.value);
                    }}
                    onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                      setLastKeyPressed(e.key);
                      if (e.key === ' ') {
                        setIsPaused(true);
                        if (autoImproveTimeoutRef.current) {
                          clearTimeout(autoImproveTimeoutRef.current);
                        }
                        setTimeout(() => {
                          if (!isTyping) {
                            setIsPaused(false);
                          }
                        }, 2000);
                      } else if (e.key !== 'Shift' && e.key !== 'Control' && e.key !== 'Alt') {
                        setIsPaused(false);
                      }
                    }}
                    placeholder="Escribe aquí tu contenido..."
                    className="min-h-[300px] md:min-h-[500px] resize-none"
                    autoResize={false}
                    ref={(el: HTMLTextAreaElement | null) => {
                      if (el) textareaRefs.current[currentPageIndex] = el;
                    }}
                    style={{
                      fontFamily: fontFamily,
                      fontSize: `${fontSize}pt`,
                      lineHeight: lineHeight,
                      textAlign: textAlign as any,
                      letterSpacing: `${letterSpacing}px`,
                      textIndent: `${textIndent}px`,
                      fontWeight: isBold ? 'bold' : 'normal',
                      fontStyle: isItalic ? 'italic' : 'normal',
                      textDecoration: isUnderline ? 'underline' : 'none',
                      color: textColor,
                      backgroundColor: backgroundColor
                    }}
                  />
                </div>
              </div>
          </div>
        </div>
        
        {/* Panel de configuración de IA */}
        {showAIConfig && (
          <div className="fixed top-20 right-4 bg-white border border-gray-300 rounded-lg shadow-xl p-4 z-50 w-80">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-black font-semibold">🤖 Configuración de IA</h3>
              <button
                onClick={() => setShowAIConfig(false)}
                className="text-gray-600 hover:text-black"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
                {/* Mejora Automática Enhanced */}
                <PremiumGate
                  feature="enhanced_auto_improve"
                  fallback={
                    <div className="p-3 bg-gray-50 rounded border border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500">
                          🚀 Mejora Automática Enhanced
                        </span>
                        <PremiumStarBadge size="sm" />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Mejora automática ultra-rápida cada 0.5s
                      </p>
                    </div>
                  }
                >
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={enhancedAutoImprove.current}
                        onChange={(e) => {
                          enhancedAutoImprove.current = e.target.checked;
                          if (!e.target.checked) {
                            // Limpiar timeouts al desactivar
                            if (autoImproveTimeoutRef.current) {
                              clearTimeout(autoImproveTimeoutRef.current);
                            }
                            setIsPaused(false);
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        🚀 Mejora Automática Enhanced (0.5s)
                      </span>
                      <PremiumStarBadge size="sm" />
                    </label>
                    {enhancedAutoImprove.current && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                        ✨ Mejora automática cada 0.5s • Presiona ESPACIO para pausar
                        {isPaused && <span className="text-orange-600"> • ⏸️ PAUSADO</span>}
                        {isImproving && <span className="text-green-600"> • 🔄 MEJORANDO...</span>}
                      </div>
                    )}
                  </div>
                </PremiumGate>
                
                {/* Modelo de IA */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modelo de IA
                  </label>
                  <select
                    value={aiModel}
                    onChange={(e) => setAiModel(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-black"
                  >
                    {availableModels.map(model => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Tono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tono
                </label>
                <select
                  value={aiTone}
                  onChange={(e) => setAiTone(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-black"
                >
                  <option value="profesional">Profesional</option>
                  <option value="casual">Casual</option>
                  <option value="formal">Formal</option>
                  <option value="amigable">Amigable</option>
                  <option value="persuasivo">Persuasivo</option>
                </select>
              </div>
              
              {/* Estilo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estilo
                </label>
                <select
                  value={aiStyle}
                  onChange={(e) => setAiStyle(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-black"
                >
                  <option value="claro">Claro</option>
                  <option value="detallado">Detallado</option>
                  <option value="conciso">Conciso</option>
                  <option value="creativo">Creativo</option>
                  <option value="técnico">Técnico</option>
                </select>
              </div>
              
              {/* Creatividad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Creatividad: {aiCreativity}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={aiCreativity}
                  onChange={(e) => setAiCreativity(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              
              {/* Intensidad de cambios */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Intensidad de cambios: {changeIntensity}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={changeIntensity}
                  onChange={(e) => setChangeIntensity(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              
              {/* Expansión de texto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expansión de texto: {textExpansion}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={textExpansion}
                  onChange={(e) => setTextExpansion(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Modal de gestión de documentos */}
        {showDocumentManager && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white border border-gray-300 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-300">
                <h2 className="text-lg font-semibold text-black">📂 Mis Documentos</h2>
                <button
                  onClick={() => setShowDocumentManager(false)}
                  className="text-gray-600 hover:text-black"
                >
                  ✕
                </button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[60vh]">
                {documents.length === 0 ? (
                  <div className="text-center py-8 text-gray-600">
                    <p>No tienes documentos guardados aún.</p>
                    <p className="text-sm mt-2">Crea tu primer documento y guárdalo para verlo aquí.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="border border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => loadDocument(doc)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-black truncate flex-1">{doc.title}</h3>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('¿Estás seguro de que quieres eliminar este documento?')) {
                                // handleDeleteDocument(doc.id);
                              }
                            }}
                            className="text-red-600 hover:text-red-800 ml-2"
                          >
                            🗑️
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {doc.content?.substring(0, 100) || 'Sin contenido'}...
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{new Date(doc.updated_at || doc.created_at).toLocaleDateString()}</span>
                          <span>{doc.content?.split(' ').length || 0} palabras</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Modal de guardar documento */}
        {showSaveDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white border border-gray-300 rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="flex items-center justify-between p-4 border-b border-gray-300">
                <h2 className="text-lg font-semibold text-black">
                  💾 {saveAsNew ? 'Guardar como nuevo documento' : 'Guardar documento'}
                </h2>
                <button
                  onClick={() => {
                    setShowSaveDialog(false);
                    setSaveAsNew(false);
                  }}
                  className="text-gray-600 hover:text-black"
                >
                  ✕
                </button>
              </div>
              <div className="p-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título del documento
                  </label>
                  <input
                    type="text"
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ingresa el título del documento"
                  />
                </div>
                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowSaveDialog(false);
                      setSaveAsNew(false);
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-black"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={saveDocument}
                    disabled={!documentTitle.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
            </div>
        
            <VideoModal
              isOpen={showVideoModal}
              onClose={() => setShowVideoModal(false)}
              videoId="k5OYlxYdIuA"
              title="Introducción a Red Creativa Pro"
            />

            {/* Diálogo de error mejorado */}
            {showErrorDialog && lastError && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold text-red-600 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Error al mejorar contenido
                    </h3>
                    <button
                      onClick={() => setShowErrorDialog(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="p-4">
                    <div className="mb-4">
                      <p className="text-gray-700 whitespace-pre-line">
                        {lastError.message}
                      </p>
                    </div>
                    
                    {lastError.type === 'AUTHENTICATION' && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm text-blue-800">
                          💡 <strong>Consejo:</strong> Asegúrate de que tu API key sea válida y esté correctamente configurada en el archivo .env.local
                        </p>
                      </div>
                    )}
                    
                    {lastError.retryable && (
                      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-sm text-yellow-800">
                          ⚠️ Este error es temporal. Puedes intentar de nuevo.
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Intento #{retryCount} • {new Date(lastError.timestamp).toLocaleTimeString()}
                      </span>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setShowErrorDialog(false)}
                          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                        >
                          Cerrar
                        </button>
                        
                        {lastError.retryable && (
                          <button
                            onClick={() => {
                              setShowErrorDialog(false);
                              setLastError(null);
                              improveContent();
                            }}
                            className="px-4 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                          >
                            Reintentar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </MobileContainer>
      </MobileLayout>
    </ProtectedRoute>
  );
}

// Componente wrapper que maneja tanto usuarios registrados como invitados
function EscritorIAWrapper() {
  const { user } = useAuth();
  const { isTrialActive, canStartTrial, startGuestTrial } = useGuestTrial();
  const [isStartingTrial, setIsStartingTrial] = React.useState(false);

  // Efecto para iniciar la prueba automáticamente
  React.useEffect(() => {
    if (!user && !isTrialActive && canStartTrial && !isStartingTrial) {
      console.log('Auto-starting guest trial for Escritor IA');
      setIsStartingTrial(true);
      startGuestTrial();
      // Reset después de un breve delay
      setTimeout(() => setIsStartingTrial(false), 1000);
    }
  }, [user, isTrialActive, canStartTrial, startGuestTrial, isStartingTrial]);

  // Si hay usuario registrado, mostrar la versión protegida
  if (user) {
    return <EscritorIAPage />;
  }

  // Si está iniciando la prueba, mostrar loading
  if (isStartingTrial || (!isTrialActive && canStartTrial)) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Iniciando prueba gratuita...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario pero tiene prueba activa, mostrar en interfaz de invitado
  if (isTrialActive) {
    return (
      <GuestTrialInterface
        toolName="Escritor IA"
        onClose={() => window.location.href = '/'}
      >
        <div className="pb-16">
          <EscritorIAPage />
        </div>
      </GuestTrialInterface>
    );
  }

  // Si no hay usuario y no puede iniciar prueba (tiempo agotado), redirigir a home
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
  
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4 text-black">Tiempo de prueba agotado</h2>
        <p className="text-gray-600 mb-4">
          Tu tiempo de prueba gratuita ha terminado. Regístrate para continuar usando el Escritor IA.
        </p>
        <Link
          href="/"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

export default EscritorIAWrapper;
