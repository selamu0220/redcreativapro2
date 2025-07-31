"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ProtectedRoute from "../components/ProtectedRoute";
import GuestTrialInterface from "../components/GuestTrialInterface";
import { TypewriterText } from "../components/TypewriterText";
import { useAuth } from "../hooks/useAuth";
import { useSubscription } from "../hooks/useSubscription";
import { useDocuments, DocumentData } from "../hooks/useDocuments";
import { useGuestTrial } from "../hooks/useGuestTrial";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface DocumentPage {
  id: string;
  content: string;
  title: string;
}

function EscritorIAPage() {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const { documents, folders, saveDocument: saveDocumentToHook, loadDocument, createDocument, deleteDocument } = useDocuments();
  
  // Estados principales
  const [pages, setPages] = useState<DocumentPage[]>([{ id: '1', content: '', title: 'Página 1' }]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isImproving, setIsImproving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [documentTitle, setDocumentTitle] = useState('');
  const [saveAsNew, setSaveAsNew] = useState(false);
  const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(null);
  const [showDocumentManager, setShowDocumentManager] = useState(false);
  const [showAIConfig, setShowAIConfig] = useState(false);
  
  // Estados para configuración de IA
  const [aiModel, setAiModel] = useState('gemini-2.0-flash-exp');
  const [aiTone, setAiTone] = useState('profesional');
  const [aiStyle, setAiStyle] = useState('claro');
  const [aiCreativity, setAiCreativity] = useState(50);
  
  // Estados para auto-mejora avanzada
  const [autoImproveEnabled, setAutoImproveEnabled] = useState(false);
  const [autoImproveDelay, setAutoImproveDelay] = useState(3000);
  const [autoImproveMinWords, setAutoImproveMinWords] = useState(10);
  const [lastTypingTime, setLastTypingTime] = useState(0);
  
  // Estados para versionado automático
  const [contentVersions, setContentVersions] = useState<string[]>([]);
  const [currentVersionIndex, setCurrentVersionIndex] = useState(0);
  const [isShowingVersions, setIsShowingVersions] = useState(false);
  const [changesCount, setChangesCount] = useState(0);
  
  // Estados para sistema de colores alternativo
  const [useAlternateColors, setUseAlternateColors] = useState(false);
  const [colorScheme, setColorScheme] = useState('default');
  
  // Estados para líneas mejoradas
  const [showImprovedLines, setShowImprovedLines] = useState(true);
  const [improvedSentences, setImprovedSentences] = useState<{[key: number]: string[]}>({});
  
  // Estados para controles de mejora
  const [changeIntensity, setChangeIntensity] = useState(50);
  const [textExpansion, setTextExpansion] = useState(50);
  const [preserveFormatting, setPreserveFormatting] = useState(true);
  
  // Estados para nuevas funcionalidades
  const [isTextChanging, setIsTextChanging] = useState(false);
  const [changedSentences, setChangedSentences] = useState<{[key: number]: boolean}>({});
  const [showVersionTooltip, setShowVersionTooltip] = useState<number | null>(null);
  const [lastUnchangedText, setLastUnchangedText] = useState('');
  
  // Estados para formato avanzado
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState('Inter');
  const [textColor, setTextColor] = useState('#ffffff');
  const [backgroundColor, setBackgroundColor] = useState('#18181b');
  const [lineHeight, setLineHeight] = useState(1.6);
  const [textAlign, setTextAlign] = useState('left');
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [wordSpacing, setWordSpacing] = useState(0);
  const [textIndent, setTextIndent] = useState(0);
  
  // Modelos disponibles
  const availableModels = [
    { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash-Lite (E)', description: 'Modelo experimental ultra-rápido y ligero' },
    { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.5 Flash', description: 'Último modelo experimental (más rápido)' },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Rápido y eficiente (recomendado)' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Avanzado con mayor capacidad' },
    { id: 'gemini-pro', name: 'Gemini Pro', description: 'Modelo principal de Google' },
    { id: 'gemini-pro-vision', name: 'Gemini Pro Vision', description: 'Con capacidades de visión' }
  ];
  
  // Estados para velocidad de navegación
  const [navigationSpeed, setNavigationSpeed] = useState(200); // 0.2 segundos por defecto
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Estados para modo agente (chat)
  const [agentMode, setAgentMode] = useState(false);
  const [chatHistory, setChatHistory] = useState<{type: 'user' | 'agent', content: string, timestamp: number, action?: string, actionData?: any}[]>([]);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  
  // Estados para funcionalidades avanzadas del agente
  const [agentPersonality, setAgentPersonality] = useState('profesional');
  const [agentIndustry, setAgentIndustry] = useState('general');
  const [documentContext, setDocumentContext] = useState('');
  const [showAgentSettings, setShowAgentSettings] = useState(false);
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
        {id: 'copywriting', name: 'Copy persuasivo', description: 'Crea texto de ventas convincente'},
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
  
  const [preserveCursor, setPreserveCursor] = useState(true);
  
  // Cargar documentos al inicializar
  useEffect(() => {
    if (documents.length > 0) {
      const firstDoc = documents[0];
      if (firstDoc.pages && firstDoc.pages.length > 0) {
        setPages(firstDoc.pages);
        setDocumentTitle(firstDoc.title);
        setCurrentDocumentId(firstDoc.id);
      }
    }
  }, [documents]);
  
  // Cargar configuración desde localStorage al inicializar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedModel = localStorage.getItem('gemini_model');
      if (savedModel) {
        setAiModel(savedModel);
      }
      
      const savedNavigationSpeed = localStorage.getItem('navigationSpeed');
      if (savedNavigationSpeed) {
        setNavigationSpeed(parseInt(savedNavigationSpeed));
      }
      
      const savedChangeIntensity = localStorage.getItem('changeIntensity');
      if (savedChangeIntensity) {
        setChangeIntensity(parseInt(savedChangeIntensity));
      }
      
      const savedTextExpansion = localStorage.getItem('textExpansion');
      if (savedTextExpansion) {
        setTextExpansion(parseInt(savedTextExpansion));
      }
      
      const savedPreserveCursor = localStorage.getItem('preserveCursor');
      if (savedPreserveCursor) {
        setPreserveCursor(savedPreserveCursor === 'true');
      }
    }
  }, []);
  
  // Guardar configuración en localStorage cuando cambie
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gemini_model', aiModel);
    }
  }, [aiModel]);
  
  // Guardar velocidad de navegación en localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('navigationSpeed', navigationSpeed.toString());
    }
  }, [navigationSpeed]);
  
  // Guardar configuraciones de mejora en localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('changeIntensity', changeIntensity.toString());
    }
  }, [changeIntensity]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('textExpansion', textExpansion.toString());
    }
  }, [textExpansion]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('preserveCursor', preserveCursor.toString());
    }
  }, [preserveCursor]);
  
  const currentPage = pages[currentPageIndex];
  const content = currentPage?.content || "";
  const whitespacePattern = /\s+/;
  const wordCount = content.trim() ? content.trim().split(whitespacePattern).length : 0;
  const readingTime = Math.ceil(wordCount / 200);
  
  // Función para actualizar el contenido de la página
  const updatePageContent = (newContent: string) => {
    const updatedPages = [...pages];
    updatedPages[currentPageIndex] = {
      ...updatedPages[currentPageIndex],
      content: newContent
    };
    setPages(updatedPages);
    
    // Detectar cambios y versiones
    if (lastUnchangedText && lastUnchangedText !== newContent) {
      const changes = countChanges(lastUnchangedText, newContent);
      setChangesCount(changes);
      
      // Agregar a versiones si hay cambios significativos
      if (changes > 0) {
        setContentVersions(prev => {
          const newVersions = [...prev, newContent];
          return newVersions.slice(-10); // Mantener solo las últimas 10 versiones
        });
        setCurrentVersionIndex(contentVersions.length);
      }
    }
  };
  
  // Función para renderizar contenido con números de versión
  const renderContentWithVersionNumbers = (content: string) => {
    const sentencePattern = /([.!?]+)/;
    const sentences = content.split(sentencePattern).filter(s => s.trim());
    const result: JSX.Element[] = [];
    let sentenceIndex = 0;
    
    for (let i = 0; i < sentences.length; i += 2) {
      const sentence = sentences[i];
      const punctuation = sentences[i + 1] || '';
      
      if (sentence && sentence.trim()) {
        const hasVersions = changedSentences[sentenceIndex];
        
        result.push(
          <span key={`sentence-${sentenceIndex}`} className="relative">
            {hasVersions && (
              <span
                className="inline-block w-4 h-4 text-xs bg-blue-500 text-white rounded-full text-center leading-4 cursor-pointer hover:bg-blue-600 mr-1 align-top"
                style={{ fontSize: '10px', marginTop: '2px' }}
                onClick={() => setShowVersionTooltip(showVersionTooltip === sentenceIndex ? null : sentenceIndex)}
                title="Ver versiones de esta oración"
              >
                {sentenceIndex + 1}
              </span>
            )}
            {sentence}{punctuation}
            
            {/* Tooltip de versiones */}
            {showVersionTooltip === sentenceIndex && hasVersions && (
              <div className="absolute top-6 left-0 bg-zinc-800 border border-zinc-600 rounded-lg p-3 shadow-xl z-50 min-w-64 max-w-96">
                <div className="text-sm text-zinc-300 mb-2">Versiones disponibles:</div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {improvedSentences[sentenceIndex]?.map((version, vIndex) => (
                    <div
                      key={vIndex}
                      className="text-sm p-2 bg-zinc-700 rounded cursor-pointer hover:bg-zinc-600 transition-colors"
                      onClick={() => {
                        // Aplicar versión seleccionada
                        const newContent = content.replace(sentence, version);
                        updatePageContent(newContent);
                        setShowVersionTooltip(null);
                      }}
                    >
                      {version}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setShowVersionTooltip(null)}
                  className="mt-2 text-xs text-zinc-400 hover:text-white"
                >
                  Cerrar
                </button>
              </div>
            )}
          </span>
        );
        sentenceIndex++;
      } else if (sentence) {
        result.push(
          <span key={`text-${i}`}>{sentence}{punctuation}</span>
        );
      }
    }
    
    return result;
  };
  
  // Función para manejar navegación con teclado mejorada
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isShowingVersions && contentVersions.length > 0) {
      if (e.key === 'ArrowLeft' && currentVersionIndex > 0) {
        e.preventDefault();
        setIsNavigating(true);
        setTimeout(() => {
          setCurrentVersionIndex(currentVersionIndex - 1);
          updatePageContent(contentVersions[currentVersionIndex - 1]);
          setIsNavigating(false);
        }, navigationSpeed);
      } else if (e.key === 'ArrowRight' && currentVersionIndex < contentVersions.length - 1) {
        e.preventDefault();
        setIsNavigating(true);
        setTimeout(() => {
          setCurrentVersionIndex(currentVersionIndex + 1);
          updatePageContent(contentVersions[currentVersionIndex + 1]);
          setIsNavigating(false);
        }, navigationSpeed);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        // Aceptar versión actual
        setIsShowingVersions(false);
        setLastUnchangedText(content);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        // Cancelar y volver a la versión original
        if (contentVersions.length > 0) {
          updatePageContent(contentVersions[0]);
          setCurrentVersionIndex(0);
        }
        setIsShowingVersions(false);
      } else if (e.key === 'PageUp' && currentVersionIndex > 0) {
        e.preventDefault();
        setCurrentVersionIndex(0);
        updatePageContent(contentVersions[0]);
      } else if (e.key === 'PageDown' && currentVersionIndex < contentVersions.length - 1) {
        e.preventDefault();
        const lastIndex = contentVersions.length - 1;
        setCurrentVersionIndex(lastIndex);
        updatePageContent(contentVersions[lastIndex]);
      }
    }
  };
  
  // Función principal para mejorar contenido con IA
  const improveContent = async (prompt: string = '', isAutoImprove: boolean = false) => {
    if (isImproving) return;
    
    const currentContent = content || '';
    if (!currentContent.trim()) {
      alert('Por favor, escribe algo de contenido primero.');
      return;
    }
    
    setIsImproving(true);
    setIsTextChanging(true);
    
    try {
      // Calcular palabras dinámicamente para auto-mejora
      const currentWordCount = currentContent.trim().split(/\s+/).length;
      const shouldAutoImprove = isAutoImprove && currentWordCount >= autoImproveMinWords;
      
      if (isAutoImprove && !shouldAutoImprove) {
        setIsImproving(false);
        setIsTextChanging(false);
        return;
      }
      
      // Construir prompt dinámico basado en configuración
      let dynamicPrompt = prompt;
      if (!prompt) {
        dynamicPrompt = `Mejora este texto con las siguientes características:
        - Tono: ${aiTone}
        - Estilo: ${aiStyle}
        - Creatividad: ${aiCreativity}%
        - Intensidad de cambios: ${changeIntensity}%
        - Expansión de texto: ${textExpansion}%
        
        Texto a mejorar: ${currentContent}`;
      }
      
      const response = await fetch('/api/improve-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: currentContent,
          prompt: dynamicPrompt,
          model: aiModel,
          tone: aiTone,
          style: aiStyle,
          creativity: aiCreativity,
          changeIntensity,
          textExpansion,
          generateVersions: true,
          versionCount: 3
        }),
      });
      
      if (!response.ok) {
        throw new Error('Error al mejorar el contenido');
      }
      
      const data = await response.json();
      
      if (data.improvedContent) {
        // Guardar texto original antes de cambios
        if (!lastUnchangedText) {
          setLastUnchangedText(currentContent);
        }
        
        // Actualizar contenido principal
        updatePageContent(data.improvedContent);
        
        // Procesar versiones múltiples si están disponibles
        if (data.versions && data.versions.length > 0) {
          setContentVersions([currentContent, ...data.versions]);
          setCurrentVersionIndex(1); // Seleccionar la primera mejora
          setIsShowingVersions(true);
        }
        
        // Marcar oraciones cambiadas
        if (data.changedSentences) {
          setChangedSentences(data.changedSentences);
          setImprovedSentences(data.sentenceVersions || {});
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Hubo un error al mejorar el contenido. Por favor, inténtalo de nuevo.');
    } finally {
      setIsImproving(false);
      setIsTextChanging(false);
    }
  };
  
  // Función para manejar chat del agente
  const handleAgentChat = async (message: string, actionId?: string) => {
    if (isAgentTyping) return;
    
    // Agregar mensaje del usuario al historial
    const userMessage = {
      type: 'user' as const,
      content: message,
      timestamp: Date.now()
    };
    setChatHistory(prev => [...prev, userMessage]);
    
    setIsAgentTyping(true);
    
    try {
      const currentContent = content || '';
      
      // Construir prompt basado en contexto del documento
      let contextPrompt = `${agentPersonalities[agentPersonality as keyof typeof agentPersonalities]}\n\n`;
      
      if (currentContent.trim()) {
        contextPrompt += `Contenido actual del documento: "${currentContent}"\n\n`;
      }
      
      if (documentContext.trim()) {
        contextPrompt += `Contexto del documento: ${documentContext}\n\n`;
      }
      
      // Agregar historial de conversación
      if (chatHistory.length > 0) {
        contextPrompt += "Historial de conversación:\n";
        chatHistory.slice(-5).forEach(msg => {
          contextPrompt += `${msg.type === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content}\n`;
        });
        contextPrompt += "\n";
      }
      
      // Agregar información de industria y acción específica
      if (actionId && industryCategories[agentIndustry as keyof typeof industryCategories]) {
        const industry = industryCategories[agentIndustry as keyof typeof industryCategories];
        const action = industry.actions.find(a => a.id === actionId);
        if (action) {
          contextPrompt += `Acción solicitada: ${action.name} - ${action.description}\n\n`;
        }
      }
      
      contextPrompt += `Mensaje del usuario: ${message}`;
      
      const response = await fetch('/api/improve-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: currentContent,
          prompt: contextPrompt,
          model: aiModel,
          tone: aiTone,
          style: aiStyle,
          creativity: aiCreativity,
          isAgentMode: true,
          agentPersonality,
          agentIndustry,
          actionId
        }),
      });
      
      if (!response.ok) {
        throw new Error('Error en la comunicación con el agente');
      }
      
      const data = await response.json();
      
      // Agregar respuesta del agente al historial
      const agentMessage = {
        type: 'agent' as const,
        content: data.agentResponse || data.improvedContent || 'Lo siento, no pude procesar tu solicitud.',
        timestamp: Date.now(),
        action: actionId,
        actionData: data.actionData
      };
      
      setChatHistory(prev => [...prev, agentMessage]);
      
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        type: 'agent' as const,
        content: 'Lo siento, hubo un error al procesar tu solicitud. Por favor, inténtalo de nuevo.',
        timestamp: Date.now()
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsAgentTyping(false);
    }
  };
  
  // Función para aplicar cambios sugeridos por el agente
  const applyAgentChanges = (suggestedContent: string) => {
    updatePageContent(suggestedContent);
    const confirmMessage = {
      type: 'agent' as const,
      content: '✅ He aplicado los cambios al documento.',
      timestamp: Date.now()
    };
    setChatHistory(prev => [...prev, confirmMessage]);
  };
  
  // Función para ejecutar acciones rápidas del agente
  const executeAgentAction = async (actionId: string) => {
    const currentContent = content || '';
    if (!currentContent.trim()) {
      const errorEntry = {
        type: 'agent' as const,
        content: `❌ No hay contenido en el documento para procesar. Escribe algo primero.`,
        timestamp: Date.now()
      };
      setChatHistory(prev => [...prev, errorEntry]);
      return;
    }
    
    const action = industryCategories[agentIndustry as keyof typeof industryCategories]?.actions.find(a => a.id === actionId);
    if (!action) return;
    
    const actionMessage = `Ejecutar: ${action.name}`;
    await handleAgentChat(actionMessage, actionId);
  };
  
  // Función para contar cambios entre dos textos
  const countChanges = (original: string, modified: string) => {
    const originalWords = original.split(/\s+/);
    const modifiedWords = modified.split(/\s+/);
    let changes = 0;
    
    const maxLength = Math.max(originalWords.length, modifiedWords.length);
    for (let i = 0; i < maxLength; i++) {
      if (originalWords[i] !== modifiedWords[i]) {
        changes++;
      }
    }
    
    return changes;
  };
  
  // Función para mejorar texto seleccionado
  const improveSelectedText = async () => {
    const selection = window.getSelection();
    if (!selection || selection.toString().trim() === '') {
      alert('Por favor, selecciona el texto que quieres mejorar.');
      return;
    }
    
    const selectedText = selection.toString();
    setIsImproving(true);
    
    try {
      const response = await fetch('/api/improve-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: selectedText,
          prompt: `Mejora este texto seleccionado manteniendo el contexto y el flujo natural. Tono: ${aiTone}, Estilo: ${aiStyle}`,
          model: aiModel,
          tone: aiTone,
          style: aiStyle,
          creativity: aiCreativity,
          changeIntensity,
          textExpansion
        }),
      });
      
      if (!response.ok) {
        throw new Error('Error al mejorar el texto seleccionado');
      }
      
      const data = await response.json();
      
      if (data.improvedContent) {
        // Reemplazar el texto seleccionado con la versión mejorada
        const newContent = content.replace(selectedText, data.improvedContent);
        updatePageContent(newContent);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Hubo un error al mejorar el texto seleccionado.');
    } finally {
      setIsImproving(false);
    }
  };
  
  // Auto-mejora con debounce
  useEffect(() => {
    if (!autoImproveEnabled) return;
    
    const timer = setTimeout(() => {
      if (Date.now() - lastTypingTime > autoImproveDelay && content.trim()) {
        const wordCount = content.trim().split(/\s+/).length;
        if (wordCount >= autoImproveMinWords) {
          improveContent('', true);
        }
      }
    }, autoImproveDelay + 100);
    
    return () => clearTimeout(timer);
  }, [content, lastTypingTime, autoImproveEnabled, autoImproveDelay, autoImproveMinWords]);
  
  // Funciones de gestión de documentos
  const saveDocument = async () => {
    if (!documentTitle.trim()) {
      alert('Por favor, ingresa un título para el documento.');
      return;
    }
    
    try {
      const documentData: DocumentData = {
        id: saveAsNew ? Date.now().toString() : (currentDocumentId || Date.now().toString()),
        title: documentTitle,
        pages: pages,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await saveDocumentToHook(documentData);
      setCurrentDocumentId(documentData.id);
      setShowSaveDialog(false);
      setSaveAsNew(false);
      alert('Documento guardado exitosamente.');
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar el documento.');
    }
  };
  
  const loadDocumentById = async (docId: string) => {
    try {
      const doc = await loadDocument(docId);
      if (doc) {
        setPages(doc.pages || [{ id: '1', content: '', title: 'Página 1' }]);
        setDocumentTitle(doc.title);
        setCurrentDocumentId(doc.id);
        setCurrentPageIndex(0);
        setShowDocumentManager(false);
      }
    } catch (error) {
      console.error('Error al cargar documento:', error);
      alert('Error al cargar el documento.');
    }
  };
  
  const createNewDocument = () => {
    setPages([{ id: '1', content: '', title: 'Página 1' }]);
    setDocumentTitle('');
    setCurrentDocumentId(null);
    setCurrentPageIndex(0);
    setContentVersions([]);
    setCurrentVersionIndex(0);
    setIsShowingVersions(false);
    setChangedSentences({});
    setImprovedSentences({});
    setLastUnchangedText('');
    setChatHistory([]);
    setShowDocumentManager(false);
  };
  
  const saveAsNewDocument = () => {
    setSaveAsNew(true);
    setDocumentTitle(documentTitle + ' - Copia');
    setShowSaveDialog(true);
  };
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-zinc-900 text-white relative">
        {/* Header */}
        <div className="bg-zinc-800 border-b border-zinc-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-blue-400 hover:text-blue-300">
                ← Dashboard
              </Link>
              <h1 className="text-xl font-bold">✍️ Escritor IA</h1>
              {documentTitle && (
                <span className="text-zinc-400">- {documentTitle}</span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Botones de gestión de documentos */}
              <button
                onClick={() => setShowDocumentManager(true)}
                className="bg-zinc-700 hover:bg-zinc-600 text-white px-3 py-2 rounded text-sm transition-colors"
                title="Gestionar documentos"
              >
                📁 Documentos
              </button>
              
              <button
                onClick={createNewDocument}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm transition-colors"
                title="Nuevo documento"
              >
                📄 Nuevo
              </button>
              
              <button
                onClick={() => setShowSaveDialog(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors"
                title="Guardar documento"
              >
                💾 Guardar
              </button>
              
              <button
                onClick={saveAsNewDocument}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm transition-colors"
                title="Guardar como nuevo"
              >
                📋 Guardar como...
              </button>
            </div>
          </div>
        </div>
        
        {/* Área principal */}
        <div className="flex h-[calc(100vh-80px)]">
          {/* Editor principal */}
          <div className="flex-1 flex flex-col">
            {/* Barra de herramientas del editor */}
            <div className="bg-zinc-800 border-b border-zinc-700 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Navegación de páginas */}
                  {pages.length > 1 && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
                        disabled={currentPageIndex === 0}
                        className="bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-800 text-white px-2 py-1 rounded text-sm"
                      >
                        ←
                      </button>
                      <span className="text-sm text-zinc-300">
                        Página {currentPageIndex + 1} de {pages.length}
                      </span>
                      <button
                        onClick={() => setCurrentPageIndex(Math.min(pages.length - 1, currentPageIndex + 1))}
                        disabled={currentPageIndex === pages.length - 1}
                        className="bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-800 text-white px-2 py-1 rounded text-sm"
                      >
                        →
                      </button>
                    </div>
                  )}
                  
                  {/* Estadísticas del documento */}
                  <div className="flex items-center space-x-4 text-sm text-zinc-400">
                    <span>📄 Página {currentPageIndex + 1}</span>
                    <span>📝 {wordCount} palabras</span>
                    <span>🔤 {content.length} caracteres</span>
                    <span>⏱️ {readingTime} min lectura</span>
                  </div>
                </div>
                
                {/* Botones de acción rápida */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => improveContent()}
                    disabled={isImproving || !content.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-600 text-white px-3 py-2 rounded text-sm transition-colors"
                  >
                    {isImproving ? '⏳ Mejorando...' : '✨ Mejorar'}
                  </button>
                  
                  <button
                    onClick={() => setAgentMode(!agentMode)}
                    className={`px-3 py-2 rounded text-sm transition-colors ${
                      agentMode 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-zinc-700 hover:bg-zinc-600 text-white'
                    }`}
                  >
                    🤖 {agentMode ? 'Chat Activo' : 'Activar Chat'}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Área del editor */}
            <div className="flex-1 p-6 overflow-auto">
              <div className="max-w-4xl mx-auto">
                <textarea
                  value={content}
                  onChange={(e) => {
                    updatePageContent(e.target.value);
                    setLastTypingTime(Date.now());
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Comienza a escribir tu contenido aquí... El Escritor IA te ayudará a mejorarlo."
                  className="w-full h-[600px] bg-transparent text-white placeholder-zinc-500 border-none outline-none resize-none text-lg leading-relaxed"
                  style={{
                    fontFamily: fontFamily,
                    fontSize: `${fontSize}px`,
                    lineHeight: lineHeight,
                    textAlign: textAlign as any,
                    letterSpacing: `${letterSpacing}px`,
                    wordSpacing: `${wordSpacing}px`,
                    textIndent: `${textIndent}px`,
                    fontWeight: isBold ? 'bold' : 'normal',
                    fontStyle: isItalic ? 'italic' : 'normal',
                    textDecoration: isUnderline ? 'underline' : 'none',
                    color: textColor,
                    backgroundColor: backgroundColor
                  }}
                />
                
                {/* Indicador de cambios en tiempo real */}
                {isTextChanging && (
                  <div className="mt-4 p-3 bg-blue-900/30 border border-blue-600 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                      <span className="text-blue-300 text-sm">Procesando cambios con IA...</span>
                    </div>
                  </div>
                )}
                
                {/* Sistema de versiones */}
                {isShowingVersions && contentVersions.length > 0 && (
                  <div className="mt-4 p-4 bg-zinc-800 border border-zinc-600 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-zinc-300">
                          📋 Versión {currentVersionIndex + 1} de {contentVersions.length}
                        </span>
                        <span className="text-xs text-zinc-400 bg-zinc-700 px-2 py-1 rounded">
                          {changesCount} cambios detectados
                        </span>
                      </div>
                      <button
                        onClick={() => setIsShowingVersions(false)}
                        className="text-zinc-400 hover:text-white text-sm"
                      >
                        ✕ Cerrar
                      </button>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-3">
                      <button
                        onClick={() => {
                          if (currentVersionIndex > 0) {
                            const newIndex = currentVersionIndex - 1;
                            setCurrentVersionIndex(newIndex);
                            updatePageContent(contentVersions[newIndex]);
                          }
                        }}
                        disabled={currentVersionIndex === 0}
                        className="bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-800 text-white px-3 py-1 rounded text-sm"
                      >
                        ← Anterior
                      </button>
                      
                      <button
                        onClick={() => {
                          if (currentVersionIndex < contentVersions.length - 1) {
                            const newIndex = currentVersionIndex + 1;
                            setCurrentVersionIndex(newIndex);
                            updatePageContent(contentVersions[newIndex]);
                          }
                        }}
                        disabled={currentVersionIndex === contentVersions.length - 1}
                        className="bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-800 text-white px-3 py-1 rounded text-sm"
                      >
                        Siguiente →
                      </button>
                      
                      <button
                        onClick={() => {
                          setIsShowingVersions(false);
                          setLastUnchangedText(content);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                      >
                        ✓ Aceptar esta versión
                      </button>
                      
                      <button
                        onClick={() => {
                          if (contentVersions.length > 0) {
                            updatePageContent(contentVersions[0]);
                            setCurrentVersionIndex(0);
                          }
                          setIsShowingVersions(false);
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                      >
                        ↶ Restaurar original
                      </button>
                    </div>
                    
                    <div className="text-xs text-zinc-400">
                      💡 Usa las flechas ←→ del teclado para navegar, Enter para aceptar, Escape para cancelar
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Panel lateral del agente (chat) */}
          {agentMode && (
            <div className="w-80 bg-zinc-800 border-l border-zinc-700 flex flex-col">
              {/* Header del chat */}
              <div className="p-4 border-b border-zinc-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white">🤖 Asistente IA</h3>
                  <button
                    onClick={() => setShowAgentSettings(!showAgentSettings)}
                    className="text-zinc-400 hover:text-white"
                  >
                    ⚙️
                  </button>
                </div>
                
                {/* Configuración del agente */}
                {showAgentSettings && (
                  <div className="space-y-3 mb-4 p-3 bg-zinc-700 rounded-lg">
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Industria
                      </label>
                      <select
                        value={agentIndustry}
                        onChange={(e) => setAgentIndustry(e.target.value)}
                        className="w-full bg-zinc-600 border border-zinc-500 rounded px-2 py-1 text-white text-sm"
                      >
                        {Object.entries(industryCategories).map(([key, category]) => (
                          <option key={key} value={key}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Personalidad
                      </label>
                      <select
                        value={agentPersonality}
                        onChange={(e) => setAgentPersonality(e.target.value)}
                        className="w-full bg-zinc-600 border border-zinc-500 rounded px-2 py-1 text-white text-sm"
                      >
                        {Object.keys(agentPersonalities).map(personality => (
                          <option key={personality} value={personality}>
                            {personality.charAt(0).toUpperCase() + personality.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
                
                {/* Acciones rápidas por industria */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-zinc-300 mb-2">
                    Acciones rápidas - {industryCategories[agentIndustry as keyof typeof industryCategories]?.name}
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {industryCategories[agentIndustry as keyof typeof industryCategories]?.actions.map(action => (
                      <button
                        key={action.id}
                        onClick={() => executeAgentAction(action.id)}
                        className="bg-zinc-600 hover:bg-zinc-500 text-white px-2 py-1 rounded text-xs transition-colors"
                        title={action.description}
                      >
                        {action.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Historial del chat */}
              <div className="flex-1 overflow-auto p-4 space-y-3">
                {chatHistory.length === 0 && (
                  <div className="text-center text-zinc-400 text-sm mt-8">
                    <div className="mb-2">👋</div>
                    <p>¡Hola! Soy tu asistente de escritura IA.</p>
                    <p className="mt-2">Puedes preguntarme cualquier cosa sobre tu texto o usar las acciones rápidas.</p>
                  </div>
                )}
                
                {chatHistory.map((message, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white ml-4'
                        : 'bg-zinc-700 text-zinc-100 mr-4'
                    }`}
                  >
                    <div className="text-sm">
                      {message.type === 'agent' ? (
                        <TypewriterText text={message.content} speed={30} />
                      ) : (
                        message.content
                      )}
                    </div>
                    
                    {/* Botones de acción para respuestas del agente */}
                    {message.type === 'agent' && message.actionData && (
                      <div className="mt-2 space-x-2">
                        <button
                          onClick={() => applyAgentChanges(message.actionData.improvedContent)}
                          className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                        >
                          ✓ Aplicar cambios
                        </button>
                        <button
                          onClick={() => {
                            const rejectMessage = {
                              type: 'agent' as const,
                              content: '❌ Cambios rechazados. ¿Hay algo específico que te gustaría que mejore?',
                              timestamp: Date.now()
                            };
                            setChatHistory(prev => [...prev, rejectMessage]);
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                        >
                          ✗ Rechazar
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Indicador de escritura del agente */}
                {isAgentTyping && (
                  <div className="bg-zinc-700 text-zinc-100 mr-4 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className="text-sm text-zinc-400">El asistente está escribiendo...</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Input del chat */}
              <div className="p-4 border-t border-zinc-700">
                <div className="flex items-center space-x-2 mb-2">
                  <button
                    onClick={() => setChatHistory([])}
                    className="text-zinc-400 hover:text-white text-sm"
                    title="Limpiar chat"
                  >
                    🗑️
                  </button>
                  <div className="text-xs text-zinc-400">
                    {chatHistory.length} mensajes
                  </div>
                </div>
                
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);
                    const message = formData.get('message') as string;
                    if (message.trim()) {
                      handleAgentChat(message);
                      (e.target as HTMLFormElement).reset();
                    }
                  }}
                  className="flex space-x-2"
                >
                  <input
                    name="message"
                    type="text"
                    placeholder="Escribe tu mensaje..."
                    className="flex-1 bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isAgentTyping}
                  />
                  <button
                    type="submit"
                    disabled={isAgentTyping}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-600 text-white px-3 py-2 rounded text-sm transition-colors"
                  >
                    📤
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
        
        {/* Panel de configuración de IA */}
        <div className="fixed bottom-4 left-4 z-40">
          <button
            onClick={() => setShowAIConfig(!showAIConfig)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors"
            title="Configuración de IA"
          >
            ⚙️
          </button>
        </div>
        
        {showAIConfig && (
          <div className="fixed bottom-16 left-4 bg-zinc-800 border border-zinc-600 rounded-lg shadow-xl p-4 z-50 w-80">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">🤖 Configuración de IA</h3>
              <button
                onClick={() => setShowAIConfig(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Modelo de IA */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Modelo de IA
                </label>
                <select
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white"
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
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Tono
                </label>
                <select
                  value={aiTone}
                  onChange={(e) => setAiTone(e.target.value)}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white"
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
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Estilo
                </label>
                <select
                  value={aiStyle}
                  onChange={(e) => setAiStyle(e.target.value)}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white"
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
                <label className="block text-sm font-medium text-zinc-300 mb-2">
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
                 <label className="block text-sm font-medium text-zinc-300 mb-2">
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
                 <label className="block text-sm font-medium text-zinc-300 mb-2">
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
               
               {/* Auto-mejora */}
               <div className="flex items-center justify-between">
                 <label className="text-sm font-medium text-zinc-300">
                   Auto-mejora
                 </label>
                 <button
                   onClick={() => setAutoImproveEnabled(!autoImproveEnabled)}
                   className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                     autoImproveEnabled ? 'bg-green-600' : 'bg-zinc-600'
                   }`}
                 >
                   <span
                     className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                       autoImproveEnabled ? 'translate-x-6' : 'translate-x-1'
                     }`}
                   />
                 </button>
               </div>
               
               {/* Botones de acción */}
               <div className="flex space-x-2">
                 <button
                   onClick={() => improveContent()}
                   disabled={isImproving || !content.trim()}
                   className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-600 text-white px-3 py-2 rounded text-sm transition-colors"
                 >
                   {isImproving ? '⏳ Mejorando...' : '✨ Mejorar'}
                 </button>
                 
                 <button
                   onClick={improveSelectedText}
                   className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm transition-colors"
                 >
                   🎯 Selección
                 </button>
               </div>
             </div>
           </div>
         )}
         
         {/* Modales */}
         {/* Modal de gestión de documentos */}
         {showDocumentManager && (
           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
             <div className="bg-zinc-800 border border-zinc-600 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
               <div className="flex items-center justify-between p-4 border-b border-zinc-700">
                 <h2 className="text-lg font-semibold text-white">📂 Mis Documentos</h2>
                 <button
                   onClick={() => setShowDocumentManager(false)}
                   className="text-zinc-400 hover:text-white"
                 >
                   ✕
                 </button>
               </div>
               <div className="p-4 overflow-y-auto max-h-[60vh]">
                 {documents.length === 0 ? (
                   <div className="text-center py-8 text-zinc-400">
                     <p>No tienes documentos guardados aún.</p>
                     <p className="text-sm mt-2">Crea tu primer documento y guárdalo para verlo aquí.</p>
                   </div>
                 ) : (
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {documents.map((doc) => (
                       <div
                         key={doc.id}
                         className="border border-zinc-600 rounded-lg p-4 hover:bg-zinc-700 transition-colors cursor-pointer"
                         onClick={() => loadDocumentById(doc.id)}
                       >
                         <div className="flex items-start justify-between mb-2">
                           <h3 className="font-medium text-white truncate flex-1">{doc.title}</h3>
                           <button
                             onClick={(e) => {
                               e.stopPropagation();
                               if (confirm('¿Estás seguro de que quieres eliminar este documento?')) {
                                 deleteDocument(doc.id);
                               }
                             }}
                             className="text-red-400 hover:text-red-300 ml-2"
                           >
                             🗑️
                           </button>
                         </div>
                         <p className="text-sm text-zinc-400 mb-2 line-clamp-2">
                           {doc.pages?.[0]?.content?.substring(0, 100) || 'Sin contenido'}...
                         </p>
                         <div className="flex items-center justify-between text-xs text-zinc-500">
                           <span>{new Date(doc.updatedAt || doc.createdAt).toLocaleDateString()}</span>
                           <span>{doc.pages?.[0]?.content?.split(' ').length || 0} palabras</span>
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
             <div className="bg-zinc-800 border border-zinc-600 rounded-lg shadow-xl max-w-md w-full mx-4">
               <div className="flex items-center justify-between p-4 border-b border-zinc-700">
                 <h2 className="text-lg font-semibold text-white">
                   💾 {saveAsNew ? 'Guardar como nuevo documento' : 'Guardar documento'}
                 </h2>
                 <button
                   onClick={() => {
                     setShowSaveDialog(false);
                     setSaveAsNew(false);
                   }}
                   className="text-zinc-400 hover:text-white"
                 >
                   ✕
                 </button>
               </div>
               <div className="p-4">
                 <div className="mb-4">
                   <label className="block text-sm font-medium text-zinc-300 mb-2">
                     Título del documento
                   </label>
                   <input
                     type="text"
                     value={documentTitle}
                     onChange={(e) => setDocumentTitle(e.target.value)}
                     className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                     placeholder="Ingresa el título del documento"
                   />
                 </div>
                 <div className="flex items-center justify-end space-x-3">
                   <button
                     onClick={() => {
                       setShowSaveDialog(false);
                       setSaveAsNew(false);
                     }}
                     className="px-4 py-2 text-zinc-400 hover:text-white"
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
       <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
         <div className="text-center">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
           <p className="text-zinc-400">Iniciando prueba gratuita...</p>
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
     <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
       <div className="text-center">
         <h2 className="text-xl font-semibold mb-4 text-white">Tiempo de prueba agotado</h2>
         <p className="text-zinc-400 mb-4">
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
