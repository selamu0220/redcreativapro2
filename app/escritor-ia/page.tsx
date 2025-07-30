"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../hooks/useAuth";
import { useSubscription } from "../hooks/useSubscription";

interface DocumentPage {
  id: string;
  content: string;
  title: string;
}

function EscritorIAPage() {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const [pages, setPages] = useState<DocumentPage[]>([
    { id: "1", content: "", title: "Documento sin título" }
  ]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [documentTitle, setDocumentTitle] = useState("Documento sin título");
  const [fontSize, setFontSize] = useState(12);
  const [fontFamily, setFontFamily] = useState("Times New Roman");
  const [zoom, setZoom] = useState(100);
  const [showRuler, setShowRuler] = useState(true);
  const [isImproving, setIsImproving] = useState(false);
  const textareaRefs = useRef<(HTMLTextAreaElement | null)[]>([]);

  // Estados para configuración de IA
  const [showAIConfig, setShowAIConfig] = useState(false);
  const [aiTone, setAiTone] = useState('profesional');
  const [aiStyle, setAiStyle] = useState('formal');
  const [aiCreativity, setAiCreativity] = useState(50);
  const [autoImprove, setAutoImprove] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [savedPrompts, setSavedPrompts] = useState<string[]>([]);
  
  // Estados para mejora automática avanzada
  const [aiModel, setAiModel] = useState('gemini-pro');
  const [autoImproveDelay, setAutoImproveDelay] = useState(1000);
  const [minWordsForAutoImprove, setMinWordsForAutoImprove] = useState(5);
  const [isTyping, setIsTyping] = useState(false);
  const [lastTypingTime, setLastTypingTime] = useState(0);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoImproveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Estados para sistema de versiones automático
  const [contentVersions, setContentVersions] = useState<string[]>([]);
  const [currentVersionIndex, setCurrentVersionIndex] = useState(-1);
  const [isShowingVersions, setIsShowingVersions] = useState(false);
  const [versionHistory, setVersionHistory] = useState<string[]>([]);
  const [maxVersions, setMaxVersions] = useState(10);
  const [autoVersioning, setAutoVersioning] = useState(true);
  const [changesCount, setChangesCount] = useState(0);
  const [isGeneratingVersions, setIsGeneratingVersions] = useState(false);
  const [originalContent, setOriginalContent] = useState('');
  const [shouldCancelGeneration, setShouldCancelGeneration] = useState(false);
  
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

  // Modelos disponibles
  const availableModels = [
    { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.5 Flash', description: 'Último modelo experimental (más rápido)' },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Rápido y eficiente (recomendado)' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Avanzado con mayor capacidad' },
    { id: 'gemini-pro', name: 'Gemini Pro', description: 'Modelo principal de Google' },
    { id: 'gemini-pro-vision', name: 'Gemini Pro Vision', description: 'Con capacidades de visión' }
  ];

  // Estados para velocidad de navegación
  const [navigationSpeed, setNavigationSpeed] = useState(200); // 0.2 segundos por defecto
  const [isNavigating, setIsNavigating] = useState(false);

  // Cargar configuración desde localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedModel = localStorage.getItem('gemini_model');
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
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const readingTime = Math.ceil(wordCount / 200);

  const updatePageContent = (content: string) => {
    setPages(prev => prev.map((page, index) => 
      index === currentPageIndex ? { ...page, content } : page
    ));
    
    // Sistema automático de versiones
    if (autoVersioning && content.trim() !== '') {
      const currentContent = pages[currentPageIndex]?.content || '';
      
      // Solo crear nueva versión si hay cambios significativos
      if (content !== currentContent && content.length > currentContent.length + 5) {
        setVersionHistory(prev => {
          const newHistory = [content, ...prev];
          // Mantener solo las últimas versiones según maxVersions
          return newHistory.slice(0, maxVersions);
        });
        
        // Activar vista de versiones automáticamente
        if (!isShowingVersions && versionHistory.length === 0) {
          setIsShowingVersions(true);
          setContentVersions([content]);
          setCurrentVersionIndex(0);
        } else if (isShowingVersions) {
          setContentVersions(prev => [content, ...prev].slice(0, maxVersions));
          setCurrentVersionIndex(0);
        }
      }
    }
  };

  const addNewPage = () => {
    const newPage: DocumentPage = {
      id: Date.now().toString(),
      content: "",
      title: documentTitle
    };
    setPages(prev => [...prev, newPage]);
    setCurrentPageIndex(pages.length);
  };

  const deletePage = (pageIndex: number) => {
    if (pages.length > 1) {
      setPages(prev => prev.filter((_, index) => index !== pageIndex));
      if (currentPageIndex >= pageIndex && currentPageIndex > 0) {
        setCurrentPageIndex(currentPageIndex - 1);
      }
    }
  };

  const exportToPDF = () => {
    const printContent = pages.map(page => 
      `    <div class="page">
      <h2>${page.title}</h2>
<div>${page.content.replace(/\n/g, '<br>')}</div>
</div>`
    ).join('\n');

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${documentTitle}</title>
            <style>
              body { font-family: ${fontFamily}; font-size: ${fontSize}pt; line-height: 1.6; margin: 0; }
              .page { page-break-after: always; padding: 40px; min-height: 90vh; }
              .page:last-child { page-break-after: avoid; }
              h2 { margin-top: 0; }
            </style>
          </head>
          <body>
${printContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const exportToWord = () => {
    const wordContent = pages.map(page => 
      `<div style="page-break-after: always; font-family: ${fontFamily}; font-size: ${fontSize}pt; line-height: 1.6; margin: 40px;">
      <h2>${page.title}</h2>
<div>${page.content.replace(/\n/g, '<br>')}</div>
</div>`
    ).join('\n');

    const blob = new Blob([`
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
      <head><meta charset='utf-8'><title>${documentTitle}</title></head>
      <body>${wordContent}</body>
      </html>
    `], { type: 'application/msword' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentTitle}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Funciones del sistema de versiones
  // generateVersions función eliminada - no funcionaba correctamente

  // Función para contar cambios entre dos textos
  const countChanges = (text1: string, text2: string): number => {
    const words1 = text1.split(/\s+/);
    const words2 = text2.split(/\s+/);
    let changes = 0;
    
    const maxLength = Math.max(words1.length, words2.length);
    for (let i = 0; i < maxLength; i++) {
      if (words1[i] !== words2[i]) {
        changes++;
      }
    }
    
    return changes;
  };

  const navigateVersion = (direction: 'prev' | 'next') => {
    if (versionHistory.length === 0) return;
    
    let newIndex = currentVersionIndex;
    if (direction === 'prev') {
      newIndex = currentVersionIndex > 0 ? currentVersionIndex - 1 : versionHistory.length - 1;
    } else {
      newIndex = currentVersionIndex < versionHistory.length - 1 ? currentVersionIndex + 1 : 0;
    }
    
    setCurrentVersionIndex(newIndex);
    // Aplicar la versión seleccionada al contenido
    if (versionHistory[newIndex]) {
      setContent(versionHistory[newIndex]);
    }
  };
  
  const selectVersion = (index: number) => {
    if (index >= 0 && index < versionHistory.length) {
      setCurrentVersionIndex(index);
      // Aplicar la versión seleccionada al contenido
      if (versionHistory[index]) {
        setContent(versionHistory[index]);
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

  // Función para generar nueva versión con flechas
  const generateNewVersion = async (direction: 'up' | 'down') => {
    if (isGeneratingNewVersion || !content.trim()) return;
    
    setIsGeneratingNewVersion(true);
    
    try {
      const prompt = direction === 'up' ? 
        'Mejora este texto haciéndolo más profesional y detallado:' : 
        'Simplifica este texto haciéndolo más conciso y directo:';
      
      const response = await fetch('/api/improve-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, prompt, model: aiModel })
      });
      
      if (response.ok) {
        const data = await response.json();
        const newVersion = data.improvedContent;
        
        // Agregar nueva versión al array
        const updatedVersions = [...contentVersions, newVersion];
        setContentVersions(updatedVersions);
        
        // Navegar a la nueva versión
        const newIndex = updatedVersions.length - 1;
        setCurrentVersionIndex(newIndex);
        updatePageContent(newVersion);
        
        // Contar cambios
        const changes = countChanges(originalContent, newVersion);
        setChangesCount(changes);
        
        // Activar modo versión si no está activo
        if (!isShowingVersions) {
          setIsShowingVersions(true);
        }
      }
    } catch (error) {
      console.error('Error generando nueva versión:', error);
    } finally {
      setIsGeneratingNewVersion(false);
    }
  };

  const acceptVersion = () => {
    if (isShowingVersions && currentVersionIndex >= 0) {
      // Aplicar la versión seleccionada al texto
      updatePageContent(contentVersions[currentVersionIndex]);
      setIsShowingVersions(false);
      setContentVersions([]);
      setCurrentVersionIndex(-1);
      setOriginalContent('');
    }
  };

  const rejectVersions = () => {
    if (isShowingVersions) {
      // Volver al contenido original
      updatePageContent(versionHistory[versionHistory.length - 1] || content);
      setIsShowingVersions(false);
      setContentVersions([]);
      setCurrentVersionIndex(-1);
      setOriginalContent('');
    }
  };

  // Funciones de IA - predefinedPrompts eliminado

  // Event listeners para navegación de versiones automáticas
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+H para mostrar/ocultar historial de versiones
      if (e.ctrlKey && e.key === 'h') {
        e.preventDefault();
        if (versionHistory.length > 0) {
          setIsShowingVersions(!isShowingVersions);
        }
      }
      
      // Detener generación de versiones al presionar Enter
      if (e.key === 'Enter' && (isGeneratingVersions || isImproving)) {
        e.preventDefault();
        setShouldCancelGeneration(true);
        setIsGeneratingVersions(false);
        setIsImproving(false);
        console.log('🛑 Generación de versiones cancelada por el usuario');
        return;
      }
      
      // Aceptar cambios automáticamente al presionar espacio cuando hay texto subrayado
      if (e.key === ' ' && isShowingVersions) {
        e.preventDefault();
        acceptVersion();
        return;
      }
      
      // Navegación mejorada cuando el historial está visible
      if (isShowingVersions && versionHistory.length > 0) {
        // Flechas izquierda/derecha con Shift
        if (e.key === 'ArrowLeft' && e.shiftKey) {
          e.preventDefault();
          navigateVersion('prev');
        } else if (e.key === 'ArrowRight' && e.shiftKey) {
          e.preventDefault();
          navigateVersion('next');
        }
        // Flechas arriba/abajo (como solicitó el usuario)
        else if (e.key === 'ArrowUp') {
          e.preventDefault();
          navigateVersion('prev');
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          navigateVersion('next');
        }
        // PageUp/PageDown
        else if (e.key === 'PageUp') {
          e.preventDefault();
          navigateVersion('prev');
        } else if (e.key === 'PageDown') {
          e.preventDefault();
          navigateVersion('next');
        }
        // Escape para salir
        else if (e.key === 'Escape') {
          e.preventDefault();
          closeVersionMode();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isShowingVersions, versionHistory, currentVersionIndex, isGeneratingVersions, isImproving]);

  const improveContent = async (prompt: string = '', isAutoImprove: boolean = false) => {
    console.log('🔧 improveContent ejecutada:', { isAutoImprove, contentLength: content.length, prompt });
    
    if (!content.trim()) {
      console.log('❌ Contenido vacío');
      if (!isAutoImprove) {
        alert('Por favor, escribe algo de contenido antes de usar la IA.');
      }
      return;
    }
    
    // Calcular palabras dinámicamente para auto-mejora
    const currentWordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
    console.log('📊 Palabras actuales:', currentWordCount, 'Mínimo requerido:', minWordsForAutoImprove);
    
    if (isAutoImprove && currentWordCount < minWordsForAutoImprove) {
      console.log('❌ Insuficientes palabras para auto-mejora');
      return;
    }
    
    console.log('🚀 Iniciando mejora con IA...');
    // Resetear señal de cancelación
    setShouldCancelGeneration(false);
    
    // Solo bloquear la interfaz para mejoras manuales, no para auto-mejora
    if (!isAutoImprove) {
      setIsImproving(true);
    }
    
    // Guardar el contenido actual para comparar después
    const contentToImprove = content;
    
    // Para mejoras manuales, activar sistema de versiones
    if (!isAutoImprove) {
      setOriginalContent(content);
      setContentVersions([]);
      setCurrentVersionIndex(-1);
      setIsShowingVersions(false);
      setIsGeneratingVersions(true);
    }
    
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
      
      const basePrompt = prompt || `IMPORTANTE: ${intensityInstruction} ${expansionInstruction} Mejora el texto respetando su contexto, significado y propósito original con un tono ${aiTone} y estilo ${aiStyle}. NO cambies el tema ni el enfoque. NO inventes información nueva. NO añadas saludos, firmas o elementos externos. NO uses placeholders genéricos como Señor/Señora:, o/a, (nombre), (apellido), Sr./Sra., Estimado/a o similares. Creatividad: ${aiCreativity}%. Devuelve ÚNICAMENTE el texto mejorado.`;
      
      // Para mejoras manuales, generar múltiples versiones
      if (!isAutoImprove) {
        const versionPrompts = [
          basePrompt,
          `${basePrompt} - Enfoque en claridad y profesionalismo`,
          `${basePrompt} - Enfoque en concisión y directividad`
        ];
        
        const versions: string[] = [];
        
        for (let i = 0; i < versionPrompts.length; i++) {
          // Verificar si el usuario canceló la generación
          if (shouldCancelGeneration) {
            console.log('🛑 Generación cancelada por el usuario en versión', i + 1);
            break;
          }
          
          const response = await fetch('/api/improve-content', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-AI-Model': aiModel,
              'X-Temperature': (aiCreativity / 100).toString(),
            },
            body: JSON.stringify({
              content: contentToImprove,
              prompt: versionPrompts[i],
              model: aiModel
            }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.improvedContent) {
              versions.push(data.improvedContent);
            }
          }
          
          // Verificar nuevamente después de cada llamada
          if (shouldCancelGeneration) {
            console.log('🛑 Generación cancelada por el usuario después de versión', i + 1);
            break;
          }
        }
        
        if (versions.length > 0) {
          setContentVersions(versions);
          setCurrentVersionIndex(0);
          setIsShowingVersions(true);
          updatePageContent(versions[0]);
          
          // Contar cambios iniciales
          const initialChanges = countChanges(content, versions[0]);
          setChangesCount(initialChanges);
          
          // Forzar actualización del textarea
          setTimeout(() => {
            const textarea = textareaRefs.current[currentPageIndex];
            if (textarea) {
              textarea.value = versions[0];
            }
          }, 100);
        } else {
          alert('No se pudieron generar versiones. Inténtalo de nuevo.');
        }
      } else {
        // Para auto-mejora, usar el método original
        const response = await fetch('/api/improve-content', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-AI-Model': aiModel,
            'X-Temperature': (aiCreativity / 100).toString(),
          },
          body: JSON.stringify({
            content: contentToImprove,
            prompt: basePrompt,
            model: aiModel
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('📥 Respuesta de la API:', data);
          if (data.improvedContent) {
            console.log('✅ Contenido mejorado recibido:', data.improvedContent.substring(0, 100) + '...');
            
            // Solo aplicar la mejora si el contenido actual es igual al que se envió para mejorar
            if (content === contentToImprove) {
              console.log('🔄 Aplicando auto-mejora (usuario no ha seguido escribiendo)');
              updatePageContent(data.improvedContent);
              
              // Forzar actualización del textarea
              setTimeout(() => {
                const textarea = textareaRefs.current[currentPageIndex];
                if (textarea) {
                  textarea.value = data.improvedContent;
                  console.log('🎯 Textarea actualizado manualmente');
                }
              }, 100);
            } else {
              console.log('⏭️ Usuario siguió escribiendo, omitiendo auto-mejora');
            }
          } else {
            console.log('❌ No se recibió improvedContent en la respuesta');
          }
        } else {
          let errorData: any = {};
          let errorMessage = 'Error al mejorar el contenido';
          
          try {
            errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
            
            // Manejar modelo sobrecargado
            if (errorData.isOverloaded) {
              console.warn('🚨 Modelo sobrecargado detectado:', errorMessage);
              
              // Para auto-mejora, intentar de nuevo después del delay sugerido
              if (errorData.suggestedRetryDelay) {
                console.log(`⏰ Reintentando auto-mejora en ${errorData.suggestedRetryDelay}ms`);
                setTimeout(() => {
                  improveContent(prompt, true);
                }, errorData.suggestedRetryDelay);
              }
              return;
            }
            
          } catch (parseError) {
            console.warn('No se pudo parsear la respuesta de error como JSON:', parseError);
            errorMessage = `Error HTTP ${response.status}: ${response.statusText}`;
          }
        }
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      if (!isAutoImprove) {
        alert('Error de conexión. Verifica tu conexión a internet e inténtalo de nuevo.');
      }
    } finally {
      // Solo desactivar el estado de mejora para mejoras manuales
      if (!isAutoImprove) {
        setIsImproving(false);
        setIsGeneratingVersions(false);
      }
    }
  };

  const savePrompt = () => {
    if (customPrompt.trim() && !savedPrompts.includes(customPrompt.trim())) {
      setSavedPrompts(prev => [...prev, customPrompt.trim()]);
      setCustomPrompt('');
    }
  };

  const deletePrompt = (index: number) => {
    setSavedPrompts(prev => prev.filter((_, i) => i !== index));
  };

  const saveAIConfig = () => {
    const config = {
      tone: aiTone,
      style: aiStyle,
      creativity: aiCreativity,
      autoImprove,
      savedPrompts,
      model: aiModel,
      autoImproveDelay,
      minWordsForAutoImprove
    };
    localStorage.setItem('aiConfig', JSON.stringify(config));
    alert('Configuración guardada exitosamente');
  };

  // Cargar configuración guardada
  useEffect(() => {
    // Cargar configuración desde localStorage o usar valores por defecto
    const savedConfig = localStorage.getItem('aiConfig');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        setAiTone(config.tone || 'profesional');
        setAiStyle(config.style || 'formal');
        setAiCreativity(config.creativity || 50);
        setAutoImprove(config.autoImprove !== undefined ? config.autoImprove : true); // Activado por defecto
        setAiModel(config.model || 'gemini-pro');
        setAutoImproveDelay(config.autoImproveDelay || 3000); // 3 segundos por defecto
        setMinWordsForAutoImprove(config.minWordsForAutoImprove || 5); // 5 palabras por defecto
      } catch (error) {
        console.error('Error al cargar configuración:', error);
        // Usar valores por defecto si hay error
        setDefaultConfig();
      }
    } else {
      // Primera vez, establecer valores por defecto
      setDefaultConfig();
    }
  }, []);
  
  // Función para establecer configuración por defecto
  const setDefaultConfig = () => {
    setAiTone('profesional');
    setAiStyle('formal');
    setAiCreativity(50);
    setAutoImprove(true); // Activado por defecto
    setSavedPrompts([]);
    setAiModel('gemini-pro');
    setAutoImproveDelay(3000); // 3 segundos por defecto
    setMinWordsForAutoImprove(5); // 5 palabras por defecto
  };

  // Auto-mejora avanzada con detección de escritura
  useEffect(() => {
    console.log('🔄 useEffect auto-mejora:', { autoImprove, contentLength: content.length, autoImproveDelay, minWordsForAutoImprove });
    
    if (autoImprove && content.trim()) {
      console.log('✅ Condiciones cumplidas, configurando timeouts...');
      
      // Limpiar timeouts anteriores
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (autoImproveTimeoutRef.current) {
        clearTimeout(autoImproveTimeoutRef.current);
      }
      
      // Marcar que el usuario está escribiendo
      setIsTyping(true);
      setLastTypingTime(Date.now());
      
      // Timeout para detectar cuando deja de escribir
      typingTimeoutRef.current = setTimeout(() => {
        console.log('⏱️ Usuario dejó de escribir');
        setIsTyping(false);
        
        // Calcular palabras en el momento de la verificación
        const currentWordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
        console.log('📝 Verificando palabras:', currentWordCount, '>=', minWordsForAutoImprove);
        
        // Verificar si hay suficiente contenido y tiempo desde la última escritura
        if (currentWordCount >= minWordsForAutoImprove) {
          console.log('⏰ Programando auto-mejora en', autoImproveDelay, 'ms');
          autoImproveTimeoutRef.current = setTimeout(() => {
            console.log('🎯 Ejecutando auto-mejora automática');
            improveContent('', true);
          }, autoImproveDelay);
        } else {
          console.log('❌ No hay suficientes palabras para auto-mejora');
        }
      }, 1000); // 1 segundo para detectar que dejó de escribir
      
      return () => {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        if (autoImproveTimeoutRef.current) {
          clearTimeout(autoImproveTimeoutRef.current);
        }
      };
    }
  }, [content, autoImprove, autoImproveDelay, minWordsForAutoImprove]);
  
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

  const handleContentChange = (newContent: string) => {
    updatePageContent(newContent);
    
    // Detectar nuevos apartados y asignar colores alternos
    const sections = newContent.split(/\n\s*\n/).filter(section => section.trim());
    if (sections.length !== sectionColors.length) {
      const newColors = sections.map((_, index) => colorPalette[index % colorPalette.length]);
      setSectionColors(newColors);
    }
    
    // Auto-resize textarea
    const textarea = textareaRefs.current[currentPageIndex];
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  };

  // Función para manejar eventos de teclado
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Detener mejora con Enter
    if (e.key === 'Enter' && isImproving) {
      e.preventDefault();
      setShouldCancelGeneration(true);
      setIsImproving(false);
      setIsGeneratingVersions(false);
      return;
    }

    // Atajos simplificados
    if (e.ctrlKey && e.key === '1') {
      e.preventDefault();
      improveLastWritten();
      return;
    }
    
    if (e.ctrlKey && e.key === '2') {
      e.preventDefault();
      improveContent();
      return;
    }
    
    // Navegación con flechas arriba/abajo cuando hay versiones
    if (isShowingVersions && versionHistory.length > 0) {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        navigateVersion('prev');
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        navigateVersion('next');
        return;
      }
      if (e.key === 'PageUp') {
        e.preventDefault();
        navigateVersion('prev');
        return;
      }
      if (e.key === 'PageDown') {
        e.preventDefault();
        navigateVersion('next');
        return;
      }
    }
  };

  // Función para mejorar lo último escrito
  const improveLastWritten = () => {
    const textarea = textareaRefs.current[currentPageIndex];
    if (!textarea) return;

    const text = textarea.value;
    const cursorPosition = textarea.selectionStart;
    
    // Encontrar el último párrafo o oración
    const beforeCursor = text.substring(0, cursorPosition);
    const lastParagraphMatch = beforeCursor.match(/([^\n]*\n?[^\n]*)$/);
    
    if (lastParagraphMatch) {
      const lastText = lastParagraphMatch[1].trim();
      if (lastText.length > 10) {
        // Seleccionar el texto y mejorarlo
        const startPos = cursorPosition - lastText.length;
        textarea.setSelectionRange(startPos, cursorPosition);
        improveSelectedText();
      }
    }
  };

  // Función para mejorar texto seleccionado
  const improveSelectedText = async () => {
    const textarea = textareaRefs.current[currentPageIndex];
    if (!textarea) return;

    const selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
    if (!selectedText.trim()) return;

    setIsImproving(true);
    
    try {
      const response = await fetch('/api/improve-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-AI-Model': aiModel,
          'X-Temperature': (aiCreativity / 100).toString(),
        },
        body: JSON.stringify({
          content: selectedText,
          prompt: `IMPORTANTE: ${changeIntensity <= 25 ? 'CONSERVA EXACTAMENTE el significado y contexto original. Solo corrige errores ortográficos o gramaticales evidentes sin cambiar palabras.' : changeIntensity <= 50 ? 'Mantén el significado original. Mejora solo gramática y claridad básica sin cambiar el estilo o tono.' : changeIntensity <= 75 ? 'Respeta el contexto original. Mejora estructura y vocabulario manteniendo la esencia del texto.' : 'Puedes hacer cambios más amplios pero siempre respetando el mensaje y contexto original.'} ${textExpansion <= 25 ? 'NO agregues contenido nuevo. MANTÉN exactamente la misma longitud y cantidad de información.' : textExpansion <= 50 ? 'Mantén longitud muy similar. Solo pequeños ajustes de palabras si es absolutamente necesario.' : textExpansion <= 75 ? 'Puedes expandir ligeramente con detalles que complementen el contenido original.' : 'Puedes expandir con ejemplos y detalles relevantes al contexto original.'} Mejora el texto respetando su contexto, significado y propósito original con un tono ${aiTone} y estilo ${aiStyle}. NO cambies el tema ni el enfoque. NO inventes información nueva. NO uses placeholders genéricos como Señor/Señora:, o/a, (nombre), (apellido), Sr./Sra., Estimado/a o similares. Creatividad: ${aiCreativity}%. Devuelve ÚNICAMENTE el texto mejorado.`,
          model: aiModel
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.improvedContent) {
          // Reemplazar el texto seleccionado con el mejorado
          const beforeSelection = textarea.value.substring(0, textarea.selectionStart);
          const afterSelection = textarea.value.substring(textarea.selectionEnd);
          const newContent = beforeSelection + data.improvedContent + afterSelection;
          
          // Marcar las líneas mejoradas con colores
          const startLine = beforeSelection.split('\n').length - 1;
          const improvedTextLines = data.improvedContent.split('\n');
          const newImprovedLines = {...improvedLines};
          const newLineColors = {...lineColors};
          const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
          
          improvedTextLines.forEach((line, index) => {
            const lineNumber = startLine + index;
            newImprovedLines[lineNumber] = line;
            newLineColors[lineNumber] = color;
          });
          
          setImprovedLines(newImprovedLines);
          setLineColors(newLineColors);
          
          updatePageContent(newContent);
          
          // Actualizar textarea y manejar posición del cursor según configuración
          setTimeout(() => {
            if (textarea) {
              textarea.value = newContent;
              if (preserveCursor) {
                // Mantener cursor en la misma posición relativa
                const newCursorPos = beforeSelection.length + data.improvedContent.length;
                textarea.setSelectionRange(newCursorPos, newCursorPos);
              } else {
                // Mover cursor al final del texto mejorado
                const endPos = beforeSelection.length + data.improvedContent.length;
                textarea.setSelectionRange(endPos, endPos);
              }
            }
          }, 100);
        }
      }
    } catch (error) {
      console.error('Error al mejorar texto seleccionado:', error);
    } finally {
      setIsImproving(false);
    }
  };
  
  // Función para obtener el color del texto basado en la posición
  const getTextColorForPosition = (text: string, position: number): string => {
    const beforeText = text.substring(0, position);
    const sectionIndex = beforeText.split(/\n\s*\n/).length - 1;
    return colorPalette[sectionIndex % colorPalette.length];
  };
  
  // Función para renderizar texto con colores alternos
  const renderColoredText = (text: string): JSX.Element[] => {
    const sections = text.split(/\n\s*\n/);
    return sections.map((section, index) => {
      if (!section.trim()) return null;
      const color = colorPalette[index % colorPalette.length];
      return (
        <span key={index} style={{ color, textDecorationColor: color }}>
          {section}
          {index < sections.length - 1 && '\n\n'}
        </span>
      );
    }).filter(Boolean) as JSX.Element[];
  };

  const goToPreviousPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    } else {
      addNewPage();
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header tipo Word */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-6 py-3">
            {/* Título del documento */}
            <div className="flex items-center justify-between mb-4">
              <input
                type="text"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                className="text-xl font-semibold bg-transparent border-none outline-none focus:bg-gray-50 px-2 py-1 rounded"
                placeholder="Título del documento"
              />
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>👤 {user?.email}</span>
                <span className="text-gray-400">|</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  subscription?.plan === 'premium' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {subscription?.plan === 'premium' ? '⭐ Premium' : '🆓 Gratis'}
                </span>
              </div>
            </div>

            {/* Barra de herramientas */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                {/* Controles de fuente */}
                <div className="flex items-center space-x-2">
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Verdana">Verdana</option>
                  </select>
                  <input
                    type="number"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    min="8"
                    max="72"
                    className="border border-gray-300 rounded px-2 py-1 text-sm w-16"
                  />
                </div>

                {/* Controles de zoom */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setZoom(Math.max(50, zoom - 10))}
                    className="px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="text-sm font-medium">{zoom}%</span>
                  <button
                    onClick={() => setZoom(Math.min(200, zoom + 10))}
                    className="px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowRuler(!showRuler)}
                  className={`px-3 py-1 rounded text-sm ${
                    showRuler ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  📏 Regla
                </button>
                <button
                  onClick={() => setShowAIConfig(!showAIConfig)}
                  className={`px-3 py-1 rounded text-sm ${
                    showAIConfig ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  🤖 IA
                </button>
                <div className="relative group">
                  <button className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200">
                    ⌨️ Atajos
                  </button>
                  <div className="absolute right-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 p-3">
                    <h4 className="font-semibold text-gray-800 mb-2">Atajos de Teclado</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Parar mejora:</span>
                        <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Enter</kbd>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mejorar último texto:</span>
                        <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+1</kbd>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mejorar todo:</span>
                        <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+2</kbd>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mejorar selección:</span>
                        <span className="text-xs text-gray-500">Seleccionar texto</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Navegar versiones:</span>
                        <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">↑↓ RePag AvPag</kbd>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={exportToPDF}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  📄 PDF
                </button>
                <button
                  onClick={exportToWord}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  📝 Word
                </button>
                <div className="relative group">
                  <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-sm hover:bg-gray-200">
                    ⚙️ Más
                  </button>
                  <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    <Link href="/ajustes" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      ⚙️ Configuración
                    </Link>
                    <Link href="/prompts" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      💬 Prompts IA
                    </Link>
                    <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      📊 Estadísticas
                    </button>
                    <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      🔄 Historial
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel de configuración IA */}
        {showAIConfig && (
          <div className="bg-gray-50 border-t border-gray-200 p-4">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">🤖 Configuración de IA</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Configuraciones básicas */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">Configuración Básica</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Tono</label>
                    <select
                      value={aiTone}
                      onChange={(e) => setAiTone(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    >
                      <option value="profesional">Profesional</option>
                      <option value="casual">Casual</option>
                      <option value="académico">Académico</option>
                      <option value="creativo">Creativo</option>
                      <option value="técnico">Técnico</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Estilo</label>
                    <select
                      value={aiStyle}
                      onChange={(e) => setAiStyle(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    >
                      <option value="formal">Formal</option>
                      <option value="informal">Informal</option>
                      <option value="persuasivo">Persuasivo</option>
                      <option value="descriptivo">Descriptivo</option>
                      <option value="narrativo">Narrativo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
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

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
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
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Sutil</span>
                      <span>Moderado</span>
                      <span>Significativo</span>
                      <span>Extensivo</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
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
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Sin expandir</span>
                      <span>Poco</span>
                      <span>Moderado</span>
                      <span>Mucho</span>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="preserveCursor"
                      checked={preserveCursor}
                      onChange={(e) => setPreserveCursor(e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="preserveCursor" className="text-sm text-gray-600">
                      Mantener posición del cursor
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Modelo de IA</label>
                    <select
                      value={aiModel}
                      onChange={(e) => setAiModel(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    >
                      {availableModels.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name} - {model.description}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Gemini 1.5 Flash es más rápido, Gemini 1.5 Pro es más potente
                    </p>
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-600 mb-1">
                       Velocidad de navegación: {navigationSpeed <= 100 ? 'Instantánea' : `${navigationSpeed}ms`}
                     </label>
                     <input
                       type="range"
                       min="100"
                       max="1000"
                       step="50"
                       value={navigationSpeed}
                       onChange={(e) => setNavigationSpeed(Number(e.target.value))}
                       className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                     />
                     <div className="flex justify-between text-xs text-gray-500 mt-1">
                       <span>⚡ Instantánea</span>
                       <span>🐌 Lenta (1s)</span>
                     </div>
                     <div className="text-xs text-gray-400 mt-1">
                       {navigationSpeed <= 100 && '⚡ Navegación instantánea activada'}
                       {navigationSpeed > 100 && navigationSpeed <= 300 && '🚀 Navegación rápida'}
                       {navigationSpeed > 300 && navigationSpeed <= 600 && '⏱️ Navegación normal'}
                       {navigationSpeed > 600 && '🐌 Navegación lenta'}
                     </div>
                   </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="autoImprove"
                      checked={autoImprove}
                      onChange={(e) => setAutoImprove(e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="autoImprove" className="text-sm text-gray-600">
                      Mejora automática al escribir
                    </label>
                  </div>

                  {/* Configuración avanzada de auto-mejora */}
                  {autoImprove && (
                    <div className="bg-blue-50 p-3 rounded border space-y-3">
                      <h5 className="text-sm font-medium text-blue-800">⚙️ Configuración Avanzada</h5>
                      
                      <div>
                        <label className="block text-xs font-medium text-blue-700 mb-1">
                          Retraso para mejora: {autoImproveDelay / 1000}s
                        </label>
                        <input
                          type="range"
                          min="1000"
                          max="10000"
                          step="500"
                          value={autoImproveDelay}
                          onChange={(e) => setAutoImproveDelay(Number(e.target.value))}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-blue-600 mt-1">
                          <span>1s</span>
                          <span>10s</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-blue-700 mb-1">
                          Palabras mínimas: {minWordsForAutoImprove}
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="100"
                          step="1"
                          value={minWordsForAutoImprove}
                          onChange={(e) => setMinWordsForAutoImprove(Number(e.target.value))}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-blue-600 mt-1">
                          <span>1</span>
                          <span>100</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className={`px-2 py-1 rounded ${
                            isTyping ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {isTyping ? '✍️ Escribiendo...' : '⏳ Esperando...'}
                          </span>
                          <span className="text-blue-600">
                            Palabras actuales: {wordCount}
                          </span>
                        </div>
                        <div className="text-xs text-center p-2 bg-blue-50 rounded border">
                          <div className="font-medium text-blue-800">Estado de Auto-mejora</div>
                          <div className="text-blue-600">
                            Activada: {autoImprove ? '✅ Sí' : '❌ No'} | 
                            Retraso: {autoImproveDelay/1000}s | 
                            Mín. palabras: {minWordsForAutoImprove}
                          </div>
                          {autoImprove && wordCount >= minWordsForAutoImprove && (
                            <div className="text-green-600 font-medium mt-1">
                              🎯 Listo para auto-mejora
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={saveAIConfig}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    💾 Guardar Configuración
                  </button>
                </div>

                {/* Sección eliminada - Prompts predefinidos no funcionaban correctamente */}

                {/* Prompts personalizados */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">Prompts Personalizados</h4>
                  
                  <div>
                    <textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Escribe tu prompt personalizado..."
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm h-20 resize-none"
                    />
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={savePrompt}
                      disabled={!customPrompt.trim()}
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      💾 Guardar
                    </button>
                    <button
                      onClick={() => improveContent(customPrompt)}
                      disabled={isImproving || !content.trim() || !customPrompt.trim()}
                      className="flex-1 px-3 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ✨ Aplicar
                    </button>
                  </div>

                  {/* Prompts guardados */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-600 mb-2">Prompts Guardados</h5>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {savedPrompts.map((prompt, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded text-xs">
                          <span className="flex-1 truncate">{prompt}</span>
                          <div className="flex space-x-1 ml-2">
                            <button
                              onClick={() => improveContent(prompt)}
                              disabled={isImproving || !content.trim()}
                              className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:opacity-50"
                            >
                              ✨
                            </button>
                            <button
                              onClick={() => deletePrompt(index)}
                              className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Estadísticas del documento */}
        <div className="bg-white border-b border-gray-200 px-6 py-2">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-6">
              <span>Página {currentPageIndex + 1} de {pages.length}</span>
              <span>{wordCount.toLocaleString()} palabras</span>
              <span>{content.length.toLocaleString()} caracteres</span>
              <span>{readingTime} min lectura</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={goToPreviousPage}
                disabled={currentPageIndex === 0}
                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Anterior
              </button>
              <button
                onClick={goToNextPage}
                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
              >
                Siguiente →
              </button>
            </div>
          </div>
        </div>

        {/* Regla */}
        {showRuler && (
          <div className="bg-white border-b border-gray-200 px-6 py-1">
            <div className="h-4 bg-gradient-to-r from-gray-100 to-gray-200 relative">
              {Array.from({ length: 21 }, (_, i) => (
                <div
                  key={i}
                  className="absolute top-0 w-px bg-gray-400 h-full"
                  style={{ left: `${i * 5}%` }}
                >
                  {i % 5 === 0 && (
                    <span className="absolute -bottom-4 -left-2 text-xs text-gray-500">
                      {i * 5}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Área del documento */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div
              className="bg-white shadow-lg border border-gray-200 rounded-lg overflow-hidden"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
            >
              <div className="p-16">
                <div className="relative w-full min-h-[600px]">
                  {/* Capa de colores de fondo para apartados y líneas mejoradas */}
                  <div 
                    className="absolute inset-0 pointer-events-none z-0"
                    style={{
                      fontFamily,
                      fontSize: `${fontSize}pt`,
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                      padding: '0'
                    }}
                  >
                    {content && content.split('\n').map((line, lineIndex) => {
                      const isImproved = improvedLines[lineIndex];
                      const lineColor = lineColors[lineIndex];
                      const sectionIndex = Math.floor(lineIndex / 5); // Agrupar cada 5 líneas
                      const sectionColor = colorPalette[sectionIndex % colorPalette.length];
                      
                      return (
                        <div
                          key={lineIndex}
                          style={{
                            color: isImproved ? lineColor : (isShowingVersions ? sectionColor : 'transparent'),
                            backgroundColor: isImproved ? `${lineColor}15` : (isShowingVersions ? `${sectionColor}10` : 'transparent'),
                            textDecoration: isImproved ? `underline ${lineColor}` : 'none',
                            textDecorationThickness: isImproved ? '2px' : '1px',
                            textUnderlineOffset: '3px',
                            borderLeft: isImproved ? `3px solid ${lineColor}` : 'none',
                            paddingLeft: isImproved ? '8px' : '0',
                            marginLeft: isImproved ? '-8px' : '0',
                            borderRadius: isImproved ? '2px' : '0'
                          }}
                        >
                          {line}
                        </div>
                      );
                    })}
                  </div>
                  
                  <textarea
                    ref={(el) => (textareaRefs.current[currentPageIndex] = el)}
                    value={content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Comienza a escribir tu documento aquí..."
                    className={`relative z-10 w-full min-h-[600px] border-none outline-none resize-none leading-relaxed ${
                      isShowingVersions ? 'bg-transparent border-l-4 border-blue-400' : 'text-gray-800'
                    }`}
                    style={{
                      fontFamily,
                      fontSize: `${fontSize}pt`,
                      lineHeight: 1.6,
                      textDecorationLine: isShowingVersions ? 'underline' : 'none',
                      textDecorationStyle: 'solid',
                      textUnderlineOffset: '3px',
                      backgroundColor: 'transparent',
                      color: isShowingVersions ? 'transparent' : 'inherit'
                    }}
                    disabled={isImproving}
                  />
                </div>
              </div>
              
              <div className="absolute bottom-4 right-4 text-sm text-gray-500">
                Página {currentPageIndex + 1}
              </div>
            </div>
            
            {/* Indicador de estado de mejora */}
            {(isImproving || isGeneratingVersions) && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <div className="text-sm text-blue-700">
                    {isGeneratingVersions ? '🔄 Generando versiones mejoradas...' : '✨ Mejorando texto con IA...'}
                  </div>
                  <div className="text-xs text-blue-500">
                    Presiona Enter para cancelar
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Panel de navegación automática de versiones - Debajo del texto */}
        {isShowingVersions && (
          <div className="max-w-4xl mx-auto mt-4">
            <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-4">
              <div className="space-y-4">
                {/* Header con conteo de cambios */}
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-700">
                    📝 Historial automático de versiones
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-gray-500">
                      {versionHistory.length} versiones guardadas
                    </div>
                    <button
                      onClick={closeVersionMode}
                      className="text-gray-400 hover:text-gray-600 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                
                {/* Representación visual de versiones del historial */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-600 mb-2">Navega por tu historial de escritura:</div>
                  <div className="flex gap-2 flex-wrap max-h-32 overflow-y-auto">
                    {versionHistory.map((version, index) => {
                      const wordCount = version.trim().split(/\s+/).length;
                      const timeAgo = `Hace ${index === 0 ? 'unos segundos' : `${index + 1} cambios`}`;
                      return (
                        <button
                          key={index}
                          onClick={() => selectVersion(index)}
                          className={`px-3 py-2 rounded-lg border transition-all min-w-[100px] text-left ${
                            currentVersionIndex === index
                              ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="text-xs font-medium">Versión {versionHistory.length - index}</div>
                          <div className="text-xs text-gray-500">{wordCount} palabras</div>
                          <div className="text-xs text-gray-400">{timeAgo}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Vista previa del texto seleccionado */}
                {currentVersionIndex >= 0 && versionHistory[currentVersionIndex] && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-2">Vista previa de Versión {versionHistory.length - currentVersionIndex}:</div>
                    <div className="text-sm text-gray-700 max-h-24 overflow-y-auto">
                      {versionHistory[currentVersionIndex].substring(0, 150)}
                      {versionHistory[currentVersionIndex].length > 150 && '...'}
                    </div>
                  </div>
                )}
                
                {/* Controles de versionado automático */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="autoVersioning"
                      checked={autoVersioning}
                      onChange={(e) => setAutoVersioning(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="autoVersioning" className="text-sm text-gray-600">
                      Versionado automático
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={clearVersionHistory}
                      className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded transition-colors"
                    >
                      Limpiar historial
                    </button>
                  </div>
                </div>
                
                {/* Navegación entre versiones */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateVersion('prev')}
                    disabled={versionHistory.length === 0}
                    className="flex-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50 transition-colors"
                  >
                    ← Anterior
                  </button>
                  <button
                    onClick={() => navigateVersion('next')}
                    disabled={versionHistory.length === 0}
                    className="flex-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50 transition-colors"
                  >
                    Siguiente →
                  </button>
                </div>
                
                {/* Información del sistema */}
                <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
                  <div>Las versiones se crean automáticamente mientras escribes • Máximo {maxVersions} versiones</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

export default EscritorIAPage;
