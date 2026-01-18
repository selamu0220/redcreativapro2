"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  Sparkles, Save, Undo2, Redo2, Bold, Italic, Underline, Strikethrough,
  List, ListOrdered, Quote, Loader2, X, Check, Copy, Trash2, Download,
  Clock, FileText, Type, Home, LayoutDashboard, User, Languages, Moon, Sun,
  FileDown, FileType, File as FileIcon, Menu, Plus, FilePenLine, ChevronRight, Settings, FileUp,
  ChevronUp, ChevronDown, History, Minimize2, Maximize2
} from 'lucide-react';
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { toast } from "sonner";
import Link from 'next/link';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import TiptapEditor from '@/components/TiptapEditor';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StealthWritePanel, Issue } from '@/components/stealth-write/StealthWritePanel';
import { StealthWriteIndicator, StealthWriteBadge } from '@/components/stealth-write/StealthWriteIndicator';
import { SEOScorePanel, SEOCheck } from '@/components/seo/SEOScorePanel';
import { DraggablePromptList } from '@/components/DraggablePromptList';
import { promptPages } from '@/lib/prompts-data';
import { Prompt } from '@/app/types/prompts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GeoOptimizerPanel from '@/components/geo/GeoOptimizerPanel'; // NEW IMPORT

// Translations
const TRANSLATIONS = {
  es: {
    title: 'Escritor IA',
    notSaved: 'Sin guardar',
    saved: 'Guardado',
    saving: 'Guardando...',
    saveDraft: 'Guardar',
    mode: 'Modo',
    autoImprove: 'Auto-mejora',
    improveText: 'Mejorar texto',
    improving: 'Mejorando...',
    close: 'Cerrar',
    suggestionTitle: 'Sugerencia de mejora',
    accept: 'Aceptar',
    reject: 'Rechazar',
    placeholder: 'Comienza a escribir aquí...',
    words: 'palabras',
    chars: 'caracteres',
    readTime: 'min lectura',
    loginWarning: 'Inicia sesión para usar las funciones de mejora con IA',
    footer: '© 2024 Red Creativa Pro. Todos los derechos reservados.',
    login: 'Iniciar sesión',
    dashboard: 'Dashboard',
    exportLabel: 'Exportar',
    myDocuments: 'Mis Documentos',
    newDocument: 'Nuevo Documento',
    untitled: 'Documento sin título',
    docTitlePlaceholder: 'Título del documento',
    deleteConfirm: '¿Eliminar este documento?',
    exportOptions: {
      md: 'Markdown (.md)',
      pdf: 'Documento PDF (.pdf)',
      docx: 'Word (.docx)'
    },
    tooltips: {
      bold: 'Negrita (Ctrl+B)',
      italic: 'Cursiva (Ctrl+I)',
      underline: 'Subrayado (Ctrl+U)',
      strikethrough: 'Tachado',
      list: 'Lista',
      orderedList: 'Lista numerada',
      quote: 'Cita',
      undo: 'Deshacer (Ctrl+Z)',
      redo: 'Rehacer (Ctrl+Y)',
      copy: 'Copiar',
      export: 'Exportar',
      clear: 'Limpiar',
      menu: 'Menú de documentos',
      new: 'Crear nuevo'
    },
    toasts: {
      saved: 'Guardado en la nube',
      saveError: 'Error al guardar',
      nothingToCopy: 'No hay texto para copiar',
      copied: 'Copiado al portapapeles',
      nothingToExport: 'No hay texto para exportar',
      exported: 'Archivo descargado',
      cleared: 'Contenido eliminado',
      confirmClear: '¿Borrar todo el contenido?',
      suggestionApplied: '✨ Texto mejorado aplicado',
      loginRequired: 'Inicia sesión para usar esta función',
      alreadyOptimized: 'El texto ya está optimizado',
      deleted: 'Documento eliminado',
      deleteError: 'Error al eliminar'
    },
    modes: {
      professional: { label: 'Profesional', desc: 'Formal y corporativo' },
      journalistic: { label: 'Periodístico', desc: 'Claro y objetivo' },
      academic: { label: 'Académico', desc: 'Riguroso y formal' },
      creative: { label: 'Creativo', desc: 'Expresivo y original' },
      casual: { label: 'Casual', desc: 'Natural y correcto' }
    },
    // Templates
    templates: 'Plantillas',
    saveAsTemplate: 'Guardar como plantilla',
    templateName: 'Nombre de la plantilla',
    noTemplates: 'No hay plantillas guardadas',
    templateSaved: 'Plantilla guardada',
    templateLoaded: 'Plantilla cargada',
    templateDeleted: 'Plantilla eliminada',
    // Expansion Level
    expansionLevel: 'Nivel de Expansión',
    expansionLabels: {
      veryShort: 'Muy corto',
      shorter: 'Más corto',
      similar: 'Similar',
      longer: 'Más largo',
      veryLong: 'Muy extenso'
    },
    // Version History
    versionHistory: 'Historial',
    version: 'Versión',
    noVersions: 'Sin versiones anteriores',
    previousVersion: 'Versión anterior (Ctrl+↑)',
    nextVersion: 'Versión siguiente (Ctrl+↓)',
    improveShortcut: 'Ctrl+Enter para mejorar',
    // Speed Control
    speedLevel: 'Prioridad de Velocidad',
    speedLabels: {
      quality: 'Calidad (Lento)',
      balanced: 'Equilibrado',
      fast: 'Rápido',
      flash: 'Ultra Veloz'
    }
  },
  en: {
    title: 'AI Writer',
    notSaved: 'Unsaved',
    saved: 'Saved',
    saving: 'Saving...',
    saveDraft: 'Save',
    mode: 'Mode',
    autoImprove: 'Auto-improve',
    improveText: 'Improve text',
    improving: 'Improving...',
    close: 'Close',
    suggestionTitle: 'Improvement suggestion',
    accept: 'Accept',
    reject: 'Reject',
    placeholder: 'Start writing here...',
    words: 'words',
    chars: 'chars',
    readTime: 'min read',
    loginWarning: 'Log in to use AI improvement features',
    footer: '© 2024 Red Creativa Pro. All rights reserved.',
    login: 'Log in',
    dashboard: 'Dashboard',
    exportLabel: 'Export',
    myDocuments: 'My Documents',
    newDocument: 'New Document',
    untitled: 'Untitled Document',
    docTitlePlaceholder: 'Document title',
    deleteConfirm: 'Delete this document?',
    exportOptions: {
      md: 'Markdown (.md)',
      pdf: 'PDF Document (.pdf)',
      docx: 'Word (.docx)'
    },
    tooltips: {
      bold: 'Bold (Ctrl+B)',
      italic: 'Italic (Ctrl+I)',
      underline: 'Underline (Ctrl+U)',
      strikethrough: 'Strikethrough',
      list: 'List',
      orderedList: 'Ordered list',
      quote: 'Quote',
      undo: 'Undo (Ctrl+Z)',
      redo: 'Redo (Ctrl+Y)',
      copy: 'Copy',
      export: 'Export',
      clear: 'Clear',
      menu: 'Documents menu',
      new: 'Create new'
    },
    toasts: {
      saved: 'Saved to cloud',
      saveError: 'Error saving',
      nothingToCopy: 'No text to copy',
      copied: 'Copied to clipboard',
      nothingToExport: 'No text to export',
      exported: 'File downloaded',
      cleared: 'Content cleared',
      confirmClear: 'Clear all content?',
      suggestionApplied: '✨ Improved text applied',
      loginRequired: 'Log in to use this feature',
      alreadyOptimized: 'Text is already optimized',
      deleted: 'Document deleted',
      deleteError: 'Error deleting'
    },
    modes: {
      professional: { label: 'Professional', desc: 'Formal and corporate' },
      journalistic: { label: 'Journalistic', desc: 'Clear and objective' },
      academic: { label: 'Academic', desc: 'Rigorous and formal' },
      creative: { label: 'Creative', desc: 'Expressive and original' },
      casual: { label: 'Casual', desc: 'Natural and correct' }
    },
    // Templates
    templates: 'Templates',
    saveAsTemplate: 'Save as template',
    templateName: 'Template name',
    noTemplates: 'No saved templates',
    templateSaved: 'Template saved',
    templateLoaded: 'Template loaded',
    templateDeleted: 'Template deleted',
    // Expansion Level
    expansionLevel: 'Expansion Level',
    expansionLabels: {
      veryShort: 'Very short',
      shorter: 'Shorter',
      similar: 'Similar',
      longer: 'Longer',
      veryLong: 'Very long'
    },
    // Version History
    versionHistory: 'History',
    version: 'Version',
    noVersions: 'No previous versions',
    previousVersion: 'Previous version (Ctrl+↑)',
    nextVersion: 'Next version (Ctrl+↓)',
    improveShortcut: 'Ctrl+Enter to improve',
    // Speed Control
    speedLevel: 'Speed Priority',
    speedLabels: {
      quality: 'Quality (Slow)',
      balanced: 'Balanced',
      fast: 'Fast',
      flash: 'Ultra Fast'
    }
  }

};

const WRITING_MODES = {
  professional: {
    prompt: `Eres un editor profesional especializado en comunicación corporativa.
MISIÓN: Transformar el texto en comunicación empresarial clara, formal y profesional.
REGLAS:
- Usa vocabulario formal y preciso
- Elimina coloquialismos y jerga informal
- Mantén un tono respetuoso y directo
- Corrige gramática y ortografía impecablemente
- Devuelve SOLO el texto mejorado, sin explicaciones`
  },
  journalistic: {
    prompt: `Eres un editor de un medio de comunicación de prestigio.
MISIÓN: Transformar el texto en prosa periodística clara, objetiva y concisa.
REGLAS:
- Usa la pirámide invertida: lo más importante primero
- Frases cortas y directas
- Elimina adjetivos innecesarios
- Datos antes que opiniones
- Devuelve SOLO el texto mejorado, sin explicaciones`
  },
  academic: {
    prompt: `Eres un editor académico especializado en publicaciones científicas.
MISIÓN: Transformar el texto en prosa académica rigurosa y formal.
REGLAS:
- Usa vocabulario técnico apropiado
- Mantén objetividad y precisión
- Estructura lógica y coherente
- Evita primera persona cuando sea posible
- Devuelve SOLO el texto mejorado, sin explicaciones`
  },
  creative: {
    prompt: `Eres un editor literario con experiencia en escritura creativa.
MISIÓN: Mejorar el texto manteniendo su voz única y añadiendo fuerza expresiva.
REGLAS:
- Potencia las metáforas y el lenguaje figurativo
- Mantén la voz del autor
- Mejora el ritmo y la musicalidad
- Corrige errores sin perder personalidad
- Devuelve SOLO el texto mejorado, sin explicaciones`
  },
  casual: {
    prompt: `Eres un corrector que mantiene el tono informal.
MISIÓN: Corregir errores manteniendo un tono natural y cercano.
REGLAS:
- Mantén el tono conversacional
- Corrige ortografía y gramática básica
- No formalices en exceso
- Preserva expresiones coloquiales aceptables
- Devuelve SOLO el texto mejorado, sin explicaciones`
  }
};

type WritingMode = keyof typeof WRITING_MODES;
type Language = 'es' | 'en';

interface DocMetadata {
  $id: string;
  title: string;
  $updatedAt: string;
  language: string;
  mode: string;
}

interface WriterTemplate {
  id: string;
  name: string;
  mode: WritingMode;
  prePrompt: string;
  expansionLevel: number; // -2 to +2
  createdAt: string;
}

const EXPANSION_LABELS = {
  es: ['Muy corto', 'Más corto', 'Similar', 'Más largo', 'Muy extenso'],
  en: ['Very short', 'Shorter', 'Similar', 'Longer', 'Very long']
};

const getExpansionInstruction = (level: number): string => {
  switch (level) {
    case -2: return '\nIMPORTANTE: Reduce drásticamente el texto. Solo mantén las ideas absolutamente esenciales. Máximo 30% del texto original.';
    case -1: return '\nIMPORTANTE: Resume el texto de forma concisa. Mantén aproximadamente 50-70% del texto original.';
    case 0: return '';
    case 1: return '\nIMPORTANTE: Expande el texto añadiendo detalles, ejemplos y explicaciones. Aumenta aproximadamente 30-50%.';
    case 2: return '\nIMPORTANTE: Expande significativamente el texto con ejemplos detallados, contexto adicional y explicaciones profundas. Duplica o triplica la longitud.';
    default: return '';
  }
};

function NavigationHeader({ currentLang, onToggleLanguage }: { currentLang: Language, onToggleLanguage: () => void }) {
  const { isAuthenticated, user } = useKindeBrowserClient();
  const [isDark, setIsDark] = useState(false);
  const t = TRANSLATIONS[currentLang];

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">RC</span>
          </div>
          <span className="font-bold text-lg hidden sm:block">Red Creativa Pro</span>
        </Link>
        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard" className="flex items-center gap-1">
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">{t.dashboard}</span>
              </Link>
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onToggleLanguage} title={currentLang === 'es' ? 'Switch to English' : 'Cambiar a Español'}>
            <span className="text-sm font-medium">{currentLang === 'es' ? '🇪🇸' : '🇺🇸'}</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          {isAuthenticated && user && (
            <div className="flex items-center gap-2 ml-2 pl-2 border-l">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                {user.picture ? (
                  <img src={user.picture} alt="" className="w-8 h-8 rounded-full" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>
              <span className="text-sm hidden md:block">{user.given_name || 'Usuario'}</span>
            </div>
          )}
          {!isAuthenticated && (
            <Button variant="default" size="sm" asChild>
              <Link href="/api/auth/login">{t.login}</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

function DocumentSidebar({
  open,
  setOpen,
  documents,
  currentId,
  onSelect,
  onDelete,
  onCreate,
  loading
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  documents: DocMetadata[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  loading: boolean;
}) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden" onClick={() => setOpen(false)} />
      <div className="fixed left-0 top-14 bottom-0 z-40 w-72 border-r bg-background flex flex-col transition-transform duration-300 md:relative md:top-0 md:h-[calc(100vh-3.5rem)]">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">{loading ? 'Cargando...' : 'Mis Documentos'}</h2>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4">
          <Button className="w-full justify-start gap-2" onClick={() => { onCreate(); setOpen(false); }}>
            <Plus className="w-4 h-4" />
            Nuevo Documento
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-2">
          {loading ? (
            <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : documents.length === 0 ? (
            <div className="text-center p-4 text-sm text-muted-foreground">No hay documentos guardados.</div>
          ) : (
            <div className="space-y-1">
              {documents.map((doc) => (
                <div key={doc.$id}
                  className={`group flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer transition-colors ${currentId === doc.$id ? 'bg-muted font-medium' : 'text-muted-foreground'}`}
                  onClick={() => { onSelect(doc.$id); setOpen(false); }}
                >
                  <div className="overflow-hidden flex-1 px-1">
                    <div className="truncate text-sm">{doc.title || 'Sin título'}</div>
                    <div className="text-xs opacity-70">{new Date(doc.$updatedAt).toLocaleDateString()}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => { e.stopPropagation(); onDelete(doc.$id); }}
                  >
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function EscritorIAPage() {
  const { isAuthenticated } = useKindeBrowserClient();

  // Navigation
  // Use state to detect mobile/desktop for initial open state could be good, but simple is fine
  const [sidebarOpen, setSidebarOpen] = useState(false); // Closed by default mobile
  const [documents, setDocuments] = useState<DocMetadata[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);

  // Editor state
  const [content, setContent] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [savedContent, setSavedContent] = useState('');
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Advanced Context State
  const [prePrompt, setPrePrompt] = useState('');
  const [context, setContext] = useState('');
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [autoImprove, setAutoImprove] = useState(false);
  const [writingMode, setWritingMode] = useState<WritingMode>('professional');
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // StealthWrite State
  const [humanityScore, setHumanityScore] = useState(0);
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high' | null>(null);
  const [stealthIssues, setStealthIssues] = useState<Issue[]>([]);
  const [stealthRecommendations, setStealthRecommendations] = useState<string[]>([]);
  const [isAnalyzingStealth, setIsAnalyzingStealth] = useState(false);
  const [isHumanizing, setIsHumanizing] = useState(false);
  const [showStealthPanel, setShowStealthPanel] = useState(true);

  // SEO State
  const [showSEOPanel, setShowSEOPanel] = useState(false);
  const [focusKeyword, setFocusKeyword] = useState('');
  const [seoScore, setSeoScore] = useState(0);
  const [seoChecks, setSeoChecks] = useState<SEOCheck[]>([]);
  const [isAnalyzingSEO, setIsAnalyzingSEO] = useState(false);

  // GEO Optimization State
  const [geoScore, setGeoScore] = useState(0);
  const [geoVerdict, setGeoVerdict] = useState('');
  const [geoStrengths, setGeoStrengths] = useState<string[]>([]);
  const [geoSuggestions, setGeoSuggestions] = useState<string[]>([]);
  const [isAnalyzingGeo, setIsAnalyzingGeo] = useState(false);

  // Prompt Picker State
  const [showPromptPicker, setShowPromptPicker] = useState(false);
  const [availablePrompts, setAvailablePrompts] = useState<Prompt[]>([]);

  useEffect(() => {
    // Convert promptPages to Prompt objects
    const mapped = promptPages.map((p, i) => ({
      id: p.slug,
      name: p.title, // For compatibility with types/prompts.ts
      title: p.title,
      description: p.excerpt,
      content: p.excerpt + " (Prompt real pendiente de implementación)", // Placeholder
      category: 'general' as const,
      tags: p.tags,
      variables: [],
      isPublic: true,
      isFavorite: false,
      createdAt: p.publishedAt,
      updatedAt: p.publishedAt,
      userId: 'system'
    }));
    setAvailablePrompts(mapped);
  }, []);

  // Version History State
  const [versionHistory, setVersionHistory] = useState<string[]>([]);
  const [currentVersionIndex, setCurrentVersionIndex] = useState(-1); // -1 = current (newest), 0+ = historical

  // Templates & Expansion Level State
  const [templates, setTemplates] = useState<WriterTemplate[]>([]);
  const [expansionLevel, setExpansionLevel] = useState(0); // -2 to +2
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [speed, setSpeed] = useState(1); // 0=Quality, 1=Balanced, 2=Fast


  // UI state
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>('es');

  const t = TRANSLATIONS[currentLang];

  const typingTimer = useRef<NodeJS.Timeout | null>(null);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  // Stats
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const charCount = content.length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem('simple-language') as Language;
    if (savedLang === 'es' || savedLang === 'en') {
      setCurrentLang(savedLang);
    }
    // Load templates from localStorage
    const savedTemplates = localStorage.getItem('writer-templates');
    if (savedTemplates) {
      try {
        setTemplates(JSON.parse(savedTemplates));
      } catch (e) {
        console.error('Failed to parse templates', e);
      }
    }
    // Load expansion level
    const savedExpansion = localStorage.getItem('writer-expansion-level');
    if (savedExpansion) {
      setExpansionLevel(parseInt(savedExpansion, 10));
    }
  }, []);

  // Template management functions
  const saveAsTemplate = useCallback(() => {
    if (!newTemplateName.trim()) {
      toast.error(currentLang === 'es' ? 'Escribe un nombre para la plantilla' : 'Enter a template name');
      return;
    }
    const newTemplate: WriterTemplate = {
      id: Date.now().toString(),
      name: newTemplateName.trim(),
      mode: writingMode,
      prePrompt,
      expansionLevel,
      createdAt: new Date().toISOString()
    };
    const updatedTemplates = [...templates, newTemplate];
    setTemplates(updatedTemplates);
    localStorage.setItem('writer-templates', JSON.stringify(updatedTemplates));
    setNewTemplateName('');
    setShowTemplateDialog(false);
    toast.success(t.templateSaved);
  }, [newTemplateName, writingMode, prePrompt, expansionLevel, templates, t.templateSaved, currentLang]);

  const loadTemplate = useCallback((id: string) => {
    const template = templates.find(tpl => tpl.id === id);
    if (template) {
      setWritingMode(template.mode);
      setPrePrompt(template.prePrompt);
      setExpansionLevel(template.expansionLevel);
      localStorage.setItem('writer-expansion-level', template.expansionLevel.toString());
      toast.success(t.templateLoaded);
    }
  }, [templates, t.templateLoaded]);

  const deleteTemplate = useCallback((id: string) => {
    const updatedTemplates = templates.filter(tpl => tpl.id !== id);
    setTemplates(updatedTemplates);
    localStorage.setItem('writer-templates', JSON.stringify(updatedTemplates));
    toast.success(t.templateDeleted);
  }, [templates, t.templateDeleted]);

  // Save expansion level to localStorage when it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('writer-expansion-level', expansionLevel.toString());
    }
  }, [expansionLevel, mounted]);

  const toggleLanguage = () => {
    const newLang = currentLang === 'es' ? 'en' : 'es';
    localStorage.setItem('simple-language', newLang);
    setCurrentLang(newLang);
  };

  const loadDocuments = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingDocs(true);
    try {
      const res = await fetch('/api/documents/list');
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents);
      }
    } catch (e) {
      console.error("Failed to load docs", e);
    } finally {
      setIsLoadingDocs(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Auto-open sidebar on desktop if auth
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      setSidebarOpen(true);
    }
    if (isAuthenticated) loadDocuments();
  }, [isAuthenticated, loadDocuments]);

  const loadDocument = async (id: string) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/documents/${id}`);
      if (res.ok) {
        const { document } = await res.json();
        setDocumentId(document.$id);
        setContent(document.content || '');
        setDocTitle(document.title || '');
        setWritingMode(document.mode || 'professional');
        setSavedContent(document.content || '');
        setLastSaved(new Date(document.$updatedAt));
        setPrePrompt(document.pre_prompt || '');
        setContext(document.context || '');
      }
    } catch (e) {
      toast.error("Error al cargar documento");
    } finally {
      setIsSaving(false);
    }
  };

  const createNewDocument = () => {
    setDocumentId(null);
    setContent('');
    setDocTitle('');
    setSavedContent('');
    setLastSaved(null);
    setPrePrompt('');
    setContext('');
    localStorage.removeItem('escritor-content');
    toast.success(t.toasts.cleared);
  };

  useEffect(() => {
    if (!mounted) return;
    autoSaveTimer.current = setInterval(() => {
      if (content !== savedContent && content.trim()) {
        saveContent(true);
      }
    }, 30000);
    return () => {
      if (autoSaveTimer.current) clearInterval(autoSaveTimer.current);
    };
  }, [content, savedContent, mounted]);





  const saveContent = useCallback(async (silent = false) => {
    if (!content.trim() && !docTitle.trim()) return;

    if (!silent) setIsSaving(true);

    const titleToSave = docTitle.trim() || t.untitled;

    localStorage.setItem('escritor-content', content);

    if (isAuthenticated) {
      try {
        const response = await fetch('/api/documents/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: titleToSave,
            content,
            mode: writingMode,
            language: currentLang,
            documentId,
            pre_prompt: prePrompt,
            context
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.documentId) {
            setDocumentId(data.documentId);
            setDocTitle(titleToSave);
            // Only reload list if it's a new document
            if (!documentId) loadDocuments();
          }
          setSavedContent(content);
          setLastSaved(new Date());
          if (!silent) toast.success(t.toasts.saved);
        } else {
          const errorData = await response.json();
          if (!silent) toast.error(errorData.details || errorData.error || t.toasts.saveError);
        }
      } catch (e) {
        if (!silent) toast.error(t.toasts.saveError);
      }
    } else {
      setSavedContent(content);
      setLastSaved(new Date());
      if (!silent) toast.success(t.toasts.saved);
    }
    if (!silent) setIsSaving(false);
  }, [content, docTitle, writingMode, t, isAuthenticated, currentLang, documentId, loadDocuments]);

  const improveText = async (text: string) => {
    if (!text.trim() || text.length < 10) return null;
    setIsProcessing(true);
    setError(null);
    try {
      const response = await fetch('/api/improve-text-openrouter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: text,
          customPrompt: WRITING_MODES[writingMode].prompt + getExpansionInstruction(expansionLevel),
          prePrompt,
          context,
          speed
        })

      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al procesar el texto');
      }
      const data = await response.json();
      const improvedText = data.improvedContent?.trim();
      if (!improvedText) throw new Error('No se recibió texto mejorado');
      setIsProcessing(false);
      return improvedText;
    } catch (err) {
      console.error('Error improving text:', err);
      setError('No se pudo mejorar el texto. Por favor, intenta de nuevo.');
      setIsProcessing(false);
      return null;
    }
  };

  const handleTextChange = (newText: string) => {
    setContent(newText);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    // Simple length check on HTML string for now, roughly accurate
    if (autoImprove && newText.length > 20 && isAuthenticated) {
      typingTimer.current = setTimeout(async () => {
        // We might want to strip HTML for AI processing or ensure AI handles HTML
        // For now pass as is, modern LLMs handle HTML reasonably well or we can strip later
        const improved = await improveText(newText);
        if (improved && improved !== newText) {
          setSuggestion(improved);
          setShowSuggestion(true);
        }
      }, 2500);
    }
  };

  const handleManualImprove = async () => {
    if (!isAuthenticated) {
      toast.error(t.toasts.loginRequired);
      return;
    }
    if (content.trim()) {
      const improved = await improveText(content);
      if (improved && improved !== content) {
        setSuggestion(improved);
        setShowSuggestion(true);
      } else if (improved === content) {
        toast.info(t.toasts.alreadyOptimized);
      }
    }
  };



  const analyzeStealth = useCallback(async (text: string) => {
    if (!text || text.length < 50) return;

    setIsAnalyzingStealth(true);
    try {
      const response = await fetch('/api/stealth-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error('Analysis failed');

      const data = await response.json();

      setHumanityScore(data.humanityScore);
      setRiskLevel(data.riskLevel);
      setStealthIssues(data.issues || []);
      setStealthRecommendations(data.recommendations || []);

    } catch (e) {
      console.error("Error analyzing stealth:", e);
    } finally {
      setIsAnalyzingStealth(false);
    }
  }, []);

  const analyzeSEO = useCallback(async (text: string, keyword: string) => {
    if (!text) return;
    setIsAnalyzingSEO(true);
    try {
      const response = await fetch('/api/seo-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, keyword })
      });
      if (response.ok) {
        const data = await response.json();
        setSeoScore(data.score);
        setSeoChecks(data.checks);
      }
    } catch (e) {
      console.error("SEO check failed", e);
    } finally {
      setIsAnalyzingSEO(false);
    }
  }, []);

  const analyzeGeo = useCallback(async (text: string) => {
    if (!text || text.length < 50) return;
    setIsAnalyzingGeo(true);
    try {
      const response = await fetch('/api/geo-optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error('GEO Analysis failed');

      const data = await response.json();

      setGeoScore(data.geoScore);
      setGeoVerdict(data.verdict);
      setGeoStrengths(data.strengths || []);
      setGeoSuggestions(data.suggestions || []);

    } catch (e) {
      console.error("Error analyzing GEO:", e);
    } finally {
      setIsAnalyzingGeo(false);
    }
  }, []);

  // Trigger analysis when content changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content.trim().length > 50) {
        analyzeStealth(content);
        analyzeSEO(content, focusKeyword);
        analyzeGeo(content);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [content, focusKeyword, analyzeStealth, analyzeSEO, analyzeGeo]);

  const handleHumanize = async () => {
    if (!content.trim() || !isAuthenticated) {
      if (!isAuthenticated) toast.error(t.toasts.loginRequired);
      return;
    }

    setIsHumanizing(true);
    try {
      const response = await fetch('/api/stealth-humanize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: content,
          issues: stealthIssues
        })
      });

      if (!response.ok) throw new Error('Humanization failed');

      const data = await response.json();

      if (data.humanizedText) {
        // Save version before changing
        setVersionHistory(prev => [...prev, content]);
        setContent(data.humanizedText);
        toast.success("Texto humanizado con éxito");

        // Re-analyze immediately
        analyzeStealth(data.humanizedText);
      }
    } catch (e) {
      console.error(e);
      toast.error("Error al humanizar el texto");
    } finally {
      setIsHumanizing(false);
    }
  };

  // Handler for floating menu AI actions (expand, summarize, rephrase, improve)
  const handleAIAction = useCallback(async (action: string, selectedText: string): Promise<string | null> => {
    if (!isAuthenticated) {
      toast.error(t.toasts.loginRequired);
      return null;
    }

    const actionPrompts: Record<string, string> = {
      expand: `Expande el siguiente texto añadiendo más detalles, ejemplos y explicaciones. Mantén el estilo original.\n\nTexto: "${selectedText}"\n\nTexto expandido:`,
      summarize: `Resume el siguiente texto de forma concisa, manteniendo las ideas principales.\n\nTexto: "${selectedText}"\n\nResumen:`,
      rephrase: `Reformula el siguiente texto usando diferentes palabras pero manteniendo el mismo significado y tono.\n\nTexto: "${selectedText}"\n\nTexto reformulado:`,
      improve: WRITING_MODES[writingMode].prompt + getExpansionInstruction(expansionLevel) + `\n\nTexto a mejorar: "${selectedText}"\n\nTexto mejorado:`
    };

    setIsProcessing(true);
    try {
      const response = await fetch('/api/improve-text-openrouter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: selectedText,
          customPrompt: actionPrompts[action] || actionPrompts.improve,
          prePrompt,
          context,
          speed
        })

      });

      if (!response.ok) throw new Error('Error al procesar');

      const data = await response.json();
      const result = data.improvedContent?.trim();

      if (result) {
        // Save to version history
        setVersionHistory(prev => [...prev, content]);
        toast.success(`✨ ${action === 'expand' ? 'Expandido' : action === 'summarize' ? 'Resumido' : action === 'rephrase' ? 'Reformulado' : 'Mejorado'}`);
        return result;
      }
      return null;
    } catch (err) {
      toast.error('Error al procesar el texto');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [isAuthenticated, t.toasts.loginRequired, writingMode, prePrompt, context, content]);

  const acceptSuggestion = () => {
    if (suggestion) {
      // Save current content to history before replacing
      setVersionHistory(prev => [...prev, content]);
      setCurrentVersionIndex(-1); // Reset to newest
      setContent(suggestion);
      setShowSuggestion(false);
      setSuggestion(null);
      toast.success(t.toasts.suggestionApplied);
    }
  };

  const rejectSuggestion = () => {
    setShowSuggestion(false);
    setSuggestion(null);
  };

  // Version Navigation Functions
  const goToPreviousVersion = useCallback(() => {
    if (versionHistory.length === 0) return;

    if (currentVersionIndex === -1) {
      // First time going back - save current as "future" reference
      const newIndex = versionHistory.length - 1;
      setCurrentVersionIndex(newIndex);
      setContent(versionHistory[newIndex]);
    } else if (currentVersionIndex > 0) {
      const newIndex = currentVersionIndex - 1;
      setCurrentVersionIndex(newIndex);
      setContent(versionHistory[newIndex]);
    }
    toast.info(`${t.version} ${currentVersionIndex === -1 ? versionHistory.length : currentVersionIndex} / ${versionHistory.length}`);
  }, [versionHistory, currentVersionIndex, t.version]);

  const goToNextVersion = useCallback(() => {
    if (currentVersionIndex === -1 || versionHistory.length === 0) return;

    if (currentVersionIndex < versionHistory.length - 1) {
      const newIndex = currentVersionIndex + 1;
      setCurrentVersionIndex(newIndex);
      setContent(versionHistory[newIndex]);
      toast.info(`${t.version} ${newIndex + 1} / ${versionHistory.length}`);
    } else {
      // Go back to current (newest)
      setCurrentVersionIndex(-1);
      toast.info(t.version + ' (actual)');
    }
  }, [versionHistory, currentVersionIndex, t.version]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;

      // Cmd/Ctrl + Enter = Improve text
      if (isMod && e.key === 'Enter') {
        e.preventDefault();
        handleManualImprove();
      }

      // Cmd/Ctrl + ↑ = Previous version
      if (isMod && e.key === 'ArrowUp' && versionHistory.length > 0) {
        e.preventDefault();
        goToPreviousVersion();
      }

      // Cmd/Ctrl + ↓ = Next version
      if (isMod && e.key === 'ArrowDown' && currentVersionIndex !== -1) {
        e.preventDefault();
        goToNextVersion();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleManualImprove, goToPreviousVersion, goToNextVersion, versionHistory.length, currentVersionIndex]);



  const copyToClipboard = async () => {
    if (!content.trim()) {
      toast.error(t.toasts.nothingToCopy);
      return;
    }
    await navigator.clipboard.writeText(content);
    toast.success(t.toasts.copied);
  };

  const getFilename = (ext: string) => {
    const safeTitle = (docTitle || 'documento-ia').replace(/[^a-z0-9]/gi, '-').toLowerCase();
    return `${safeTitle}.${ext}`;
  };

  const exportAsMd = () => {
    if (!content.trim()) {
      toast.error(t.toasts.nothingToExport);
      return;
    }
    const blob = new Blob([content], { type: 'text/markdown' });
    saveAs(blob, getFilename('md'));
    toast.success(t.toasts.exported);
  };

  const exportAsPdf = () => {
    if (!content.trim()) {
      toast.error(t.toasts.nothingToExport);
      return;
    }
    const doc = new jsPDF();
    const splitText = doc.splitTextToSize(content, 180);
    doc.setFont("helvetica");
    doc.setFontSize(12);
    doc.text(splitText, 15, 15);
    doc.save(getFilename('pdf'));
    toast.success(t.toasts.exported);
  };

  const exportAsDocx = async () => {
    if (!content.trim()) {
      toast.error(t.toasts.nothingToExport);
      return;
    }
    const paragraphs = content.split('\n').map(line =>
      new Paragraph({
        children: [new TextRun(line)],
        spacing: { after: 120 }
      })
    );
    const doc = new Document({
      sections: [{ properties: {}, children: paragraphs }],
    });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, getFilename('docx'));
    toast.success(t.toasts.exported);
  };

  const clearContent = () => {
    if (!content.trim()) return;
    if (confirm(t.toasts.confirmClear)) {
      setContent('');
      toast.success(t.toasts.cleared);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Por favor, sube un archivo PDF válido');
      return;
    }

    setIsExtractingPdf(true);
    try {
      // Dynamic import to avoid SSR issues
      const pdfjsLib = await import('pdfjs-dist');
      const pdfVersion = pdfjsLib.version;
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfVersion}/build/pdf.worker.min.mjs`;

      const buffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      let extractedText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        extractedText += pageText + '\n\n';
      }

      setContext(prev => (prev + '\n\n' + extractedText).trim());
      toast.success('Contenido del PDF extraído y añadido al contexto');
    } catch (err) {
      console.error('Error extracting PDF:', err);
      toast.error('Error al leer el PDF');
    } finally {
      setIsExtractingPdf(false);
      // Reset input
      e.target.value = '';
    }
  };

  const deleteDocument = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const id = deleteId;
    try {
      const res = await fetch('/api/documents/delete', {
        method: 'DELETE',
        body: JSON.stringify({ documentId: id })
      });
      if (res.ok) {
        toast.success(t.toasts.deleted);
        loadDocuments();
        if (documentId === id) createNewDocument();
      } else {
        toast.error(t.toasts.deleteError);
      }
    } catch {
      toast.error(t.toasts.deleteError);
    } finally {
      setDeleteId(null);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <NavigationHeader currentLang={currentLang} onToggleLanguage={toggleLanguage} />

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Desktop */}
          <div className={`hidden md:block border-r bg-muted/10 transition-all duration-300 ${sidebarOpen ? 'w-72' : 'w-0 overflow-hidden'}`}>
            {sidebarOpen && (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b flex items-center justify-between">
                  <h2 className="font-semibold text-sm">{t.myDocuments}</h2>
                  <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="p-4">
                  <Button className="w-full justify-start gap-2" size="sm" onClick={createNewDocument}>
                    <Plus className="w-4 h-4" />
                    {t.newDocument}
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto px-2">
                  {isLoadingDocs ? (
                    <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
                  ) : (
                    <div className="space-y-1">
                      {documents.map((doc) => (
                        <div key={doc.$id}
                          className={`group flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer text-sm ${documentId === doc.$id ? 'bg-muted font-medium' : 'text-muted-foreground'}`}
                          onClick={() => loadDocument(doc.$id)}
                        >
                          <div className="overflow-hidden truncate flex-1 px-1">
                            <div className="truncate mb-0.5">{doc.title || t.untitled}</div>
                            <div className="text-xs opacity-70">{new Date(doc.$updatedAt).toLocaleDateString()}</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => { e.stopPropagation(); deleteDocument(doc.$id); }}
                          >
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <DocumentSidebar
            open={sidebarOpen && window.innerWidth < 768}
            setOpen={setSidebarOpen}
            documents={documents}
            currentId={documentId}
            onSelect={loadDocument}
            onDelete={deleteDocument}
            onCreate={createNewDocument}
            loading={isLoadingDocs}
          />

          <main className="flex-1 flex overflow-hidden w-full">
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-4">

                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    <Menu className="w-5 h-5" />
                  </Button>
                  <div className="flex-1">
                    <Input
                      value={docTitle}
                      onChange={(e) => setDocTitle(e.target.value)}
                      placeholder={t.docTitlePlaceholder}
                      className="text-lg font-semibold border-transparent hover:border-border transition-colors h-10 px-2"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground hidden sm:flex">
                    {isSaving ? (
                      <span className="flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> {t.saving}</span>
                    ) : (
                      <span>{t.saved}</span>
                    )}
                  </div>
                  <Button variant="default" size="sm" onClick={() => saveContent(false)}>
                    <Save className="w-4 h-4 mr-2" />
                    {t.saveDraft}
                  </Button>
                  <Dialog open={showSettings} onOpenChange={setShowSettings}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon" className="h-9 w-9">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Configuración Avanzada & Contexto</DialogTitle>
                        <DialogDescription>
                          Personaliza cómo actúa la IA y añade información de referencia.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6 py-4">

                        {/* Pre Prompt Section */}
                        <div className="space-y-2">
                          <Label>Instrucciones Personalizadas (Pre-prompt)</Label>
                          <p className="text-xs text-muted-foreground">Define un rol o reglas específicas (ej. "Actúa como experto en SEO", "Usa tono sarcástico").</p>
                          <Textarea
                            value={prePrompt}
                            onChange={(e) => setPrePrompt(e.target.value)}
                            placeholder="Escribe tus instrucciones aquí..."
                            className="min-h-[100px]"
                          />
                        </div>

                        <Separator />

                        {/* Expansion Level Slider */}
                        <div className="space-y-4">
                          <Label>{t.expansionLevel}</Label>
                          <p className="text-xs text-muted-foreground">
                            {currentLang === 'es'
                              ? 'Controla cuánto expande o reduce el texto la IA'
                              : 'Control how much the AI expands or reduces text'}
                          </p>
                          <div className="flex items-center gap-4">
                            <Minimize2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <Slider
                              value={[expansionLevel]}
                              onValueChange={(v) => setExpansionLevel(v[0])}
                              min={-2}
                              max={2}
                              step={1}
                              className="flex-1"
                            />
                            <Maximize2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          </div>
                          <div className="text-center text-sm font-medium">
                            {EXPANSION_LABELS[currentLang][expansionLevel + 2]}
                          </div>
                        </div>


                        <Separator />

                        {/* Speed Slider */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label>{t.speedLevel}</Label>
                            <span className="text-xs font-medium px-2 py-0.5 rounded bg-muted">
                              {speed === 0 ? t.speedLabels.quality : speed === 1 ? t.speedLabels.balanced : t.speedLabels.flash}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {currentLang === 'es'
                              ? 'Elige entre mayor calidad de redacción o respuesta instantánea'
                              : 'Choose between higher writing quality or instant response'}
                          </p>
                          <div className="flex items-center gap-4">
                            <span className="text-xs text-muted-foreground">{t.speedLabels.quality}</span>
                            <Slider
                              value={[speed]}
                              onValueChange={(v) => setSpeed(v[0])}
                              min={0}
                              max={2}
                              step={1}
                              className="flex-1"
                            />
                            <span className="text-xs text-muted-foreground">{t.speedLabels.flash}</span>
                          </div>
                        </div>


                        <Separator />

                        {/* Prompt Library Button */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label>Librería de Prompts (SEO)</Label>
                            <Dialog open={showPromptPicker} onOpenChange={setShowPromptPicker}>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <Sparkles className="w-3 h-3 mr-1" /> Explorar Prompts
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Librería de Prompts SEO</DialogTitle>
                                  <DialogDescription>Selecciona un prompt para aplicarlo a tu contenido.</DialogDescription>
                                </DialogHeader>
                                <div className="py-4">
                                  <DraggablePromptList
                                    prompts={availablePrompts}
                                    onReorder={() => { }}
                                    onEdit={() => { }}
                                    onDelete={() => { }}
                                    onDuplicate={() => { }}
                                    onUse={(prompt) => {
                                      setContent(prev => prev + '\n\n' + prompt.content);
                                      setShowPromptPicker(false);
                                      toast.success("Prompt aplicado");
                                    }}
                                    enableDragAndDrop={false}
                                  />
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>

                        <Separator />

                        {/* Templates Section */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label>{t.templates}</Label>
                            <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <Plus className="w-3 h-3 mr-1" /> {t.saveAsTemplate}
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-sm">
                                <DialogHeader>
                                  <DialogTitle>{t.saveAsTemplate}</DialogTitle>
                                </DialogHeader>
                                <div className="py-4">
                                  <Input
                                    value={newTemplateName}
                                    onChange={(e) => setNewTemplateName(e.target.value)}
                                    placeholder={t.templateName}
                                    onKeyDown={(e) => e.key === 'Enter' && saveAsTemplate()}
                                  />
                                </div>
                                <DialogFooter>
                                  <Button onClick={saveAsTemplate}>
                                    <Save className="w-4 h-4 mr-2" /> {t.saveDraft}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                          {templates.length === 0 ? (
                            <p className="text-xs text-muted-foreground">{t.noTemplates}</p>
                          ) : (
                            <div className="space-y-2 max-h-[150px] overflow-y-auto">
                              {templates.map(tpl => (
                                <div key={tpl.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted">
                                  <div className="flex-1 min-w-0">
                                    <span className="text-sm truncate block">{tpl.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {(t.modes as Record<string, { label: string }>)[tpl.mode]?.label} • {EXPANSION_LABELS[currentLang][tpl.expansionLevel + 2]}
                                    </span>
                                  </div>
                                  <div className="flex gap-1 flex-shrink-0">
                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { loadTemplate(tpl.id); setShowSettings(false); }}>
                                      <FileUp className="w-3 h-3" />
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => deleteTemplate(tpl.id)}>
                                      <Trash2 className="w-3 h-3 text-destructive" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <Separator />

                        {/* PDF Upload Section */}
                        <div className="space-y-2">
                          <Label>Añadir Contexto (PDF)</Label>
                          <p className="text-xs text-muted-foreground">Sube un PDF para que la IA lo lea y lo use como referencia (NotebookLM style).</p>
                          <div className="flex gap-2">
                            <Input
                              type="file"
                              accept=".pdf"
                              onChange={handlePdfUpload}
                              disabled={isExtractingPdf}
                            />
                            {isExtractingPdf && <Loader2 className="animate-spin w-5 h-5 text-primary" />}
                          </div>
                        </div>

                        {/* Context Textarea Section */}
                        <div className="space-y-2">
                          <Label>Contexto Activo</Label>
                          <p className="text-xs text-muted-foreground">Este es el texto que la IA usará como base. Puedes editarlo o limpiar lo extraído.</p>
                          <Textarea
                            value={context}
                            onChange={(e) => setContext(e.target.value)}
                            placeholder="El contexto extraído de los PDFs aparecerá aquí..."
                            className="min-h-[200px] font-mono text-sm"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{context.length} caracteres</span>
                            <Button variant="ghost" size="sm" onClick={() => setContext('')} className="h-6 px-2 text-destructive hover:text-destructive">Borrar Contexto</Button>
                          </div>
                        </div>

                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <Card className="min-h-[500px] flex flex-col shadow-sm">
                  <CardContent className="p-0 flex-1 flex flex-col min-h-[500px]">
                    <TiptapEditor
                      content={content}
                      onChange={setContent}
                      onAIAction={handleAIAction}
                      isProcessing={isProcessing}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 flex flex-wrap gap-4 items-center">
                    {/* Writing Mode Selector */}
                    <div className="w-[180px]">
                      <Select value={writingMode} onValueChange={(v) => setWritingMode(v as WritingMode)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(t.modes).map(([key, mode]) => (
                            <SelectItem key={key} value={key}>{mode.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Auto-improve Toggle */}
                    <div className="flex items-center gap-2">
                      <Switch checked={autoImprove} onCheckedChange={setAutoImprove} id="auto" />
                      <Label htmlFor="auto">{t.autoImprove}</Label>
                    </div>

                    <Separator orientation="vertical" className="h-6 hidden sm:block" />

                    {/* SEO Toggle */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={showSEOPanel ? 'secondary' : 'ghost'}
                          size="sm"
                          className={cn("gap-2", showSEOPanel && "bg-muted")}
                          onClick={() => {
                            setShowSEOPanel(!showSEOPanel);
                            if (!showSEOPanel) setShowStealthPanel(false); // Close others
                          }}
                        >
                          <div className="flex items-center gap-1.5">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              seoScore >= 90 ? "bg-emerald-500" :
                                seoScore >= 70 ? "bg-emerald-400" :
                                  seoScore >= 50 ? "bg-amber-500" : "bg-red-500"
                            )} />
                            <span className="font-semibold text-xs">{seoScore}</span>
                          </div>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Análisis SEO (Puntuación: {seoScore}/100)</p>
                      </TooltipContent>
                    </Tooltip>

                    <StealthWriteIndicator
                      score={humanityScore}
                      riskLevel={riskLevel}
                      isAnalyzing={isAnalyzingStealth}
                      onClick={() => {
                        setShowStealthPanel(!showStealthPanel);
                        if (!showStealthPanel) setShowSEOPanel(false); // Close others
                      }}
                      className="mr-2"
                    />

                    <Separator orientation="vertical" className="h-6 hidden sm:block" />

                    {/* Version Navigation */}
                    <div className="flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={goToPreviousVersion}
                            disabled={versionHistory.length === 0 || currentVersionIndex === 0}
                          >
                            <ChevronUp className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t.previousVersion}</TooltipContent>
                      </Tooltip>

                      <div className="flex items-center gap-1 px-2 min-w-[60px] justify-center">
                        <History className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {versionHistory.length > 0
                            ? `${currentVersionIndex === -1 ? versionHistory.length + 1 : currentVersionIndex + 1}/${versionHistory.length + 1}`
                            : '-'
                          }
                        </span>
                      </div>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={goToNextVersion}
                            disabled={currentVersionIndex === -1}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t.nextVersion}</TooltipContent>
                      </Tooltip>
                    </div>

                    {/* IA Processing Indicator */}
                    {isProcessing && (
                      <div className="flex items-center gap-2 text-sm text-primary animate-pulse">
                        <Sparkles className="w-4 h-4 animate-spin" />
                        <span className="hidden sm:inline">{t.improving}</span>
                      </div>
                    )}

                    {/* Improve Button */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button className="ml-auto" onClick={handleManualImprove} disabled={isProcessing}>
                          {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                          {t.improveText}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{t.improveShortcut}</TooltipContent>
                    </Tooltip>
                  </CardContent>
                </Card>

                <div className="text-sm text-muted-foreground flex gap-4 justify-end">
                  <span>{wordCount} {t.words}</span>
                  <span>{charCount} {t.chars}</span>
                </div>

              </div>
            </div>
            {showStealthPanel && (
              <aside className="w-[380px] border-l bg-background hidden xl:flex flex-col h-full">
                <div className="p-4 flex items-center justify-between border-b bg-muted/30">
                  <h3 className="font-semibold text-sm">Asistente de Escritura</h3>
                  <Button variant="ghost" size="icon" onClick={() => setShowStealthPanel(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <Tabs defaultValue="stealth" className="flex-1 w-full flex flex-col overflow-hidden">
                  <div className="px-4 pt-4 pb-2">
                    <TabsList className="w-full grid grid-cols-3">
                      <TabsTrigger value="stealth">Humanizer</TabsTrigger>
                      <TabsTrigger value="seo">SEO</TabsTrigger>
                      <TabsTrigger value="geo">GEO (LLM)</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="stealth" className="flex-1 overflow-y-auto p-4 space-y-4 mt-0 border-0 h-full">
                    <StealthWritePanel
                      humanityScore={humanityScore}
                      riskLevel={riskLevel}
                      issues={stealthIssues}
                      recommendations={stealthRecommendations}
                      isAnalyzing={isAnalyzingStealth}
                      onHumanize={handleHumanize}
                      isHumanizing={isHumanizing}
                      className="border-none shadow-none rounded-none p-0"
                    />
                  </TabsContent>

                  <TabsContent value="seo" className="flex-1 overflow-y-auto p-4 space-y-6 mt-0 h-full">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">Palabra Clave Objetivo</Label>
                      <div className="flex gap-2">
                        <Input
                          value={focusKeyword}
                          onChange={(e) => setFocusKeyword(e.target.value)}
                          placeholder="Ej: marketing digital"
                          className="h-9"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="shrink-0"
                          onClick={() => analyzeSEO(content, focusKeyword)}
                          disabled={isAnalyzingSEO}
                        >
                          {isAnalyzingSEO ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Analizar'}
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <SEOScorePanel
                      score={seoScore}
                      checks={seoChecks}
                      keywords={focusKeyword ? [focusKeyword] : []}
                      isAnalyzing={isAnalyzingSEO}
                      className="border-none shadow-none p-0"
                    />
                  </TabsContent>

                  <TabsContent value="geo" className="flex-1 overflow-y-auto p-4 space-y-4 mt-0 border-0 h-full">
                    <GeoOptimizerPanel
                      geoScore={geoScore}
                      verdict={geoVerdict}
                      strengths={geoStrengths}
                      suggestions={geoSuggestions}
                      isAnalyzing={isAnalyzingGeo}
                      onReanalyze={() => analyzeGeo(content)}
                    />
                  </TabsContent>
                </Tabs>
              </aside>
            )}
          </main>
        </div>

        {
          showSuggestion && suggestion && (
            <div className="fixed bottom-6 right-6 z-50 w-full max-w-md">
              <Card className="border-2 border-primary shadow-xl">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">{t.suggestionTitle}</CardTitle>
                  <Button variant="ghost" size="icon" onClick={rejectSuggestion}><X className="w-4 h-4" /></Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg max-h-[300px] overflow-y-auto text-sm">
                    {suggestion}
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={rejectSuggestion}>{t.reject}</Button>
                    <Button onClick={acceptSuggestion}>{t.accept}</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        }

      </div >

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.deleteConfirm}</AlertDialogTitle>
            <AlertDialogDescription>
              {currentLang === 'es'
                ? 'Esta acción no se puede deshacer. El documento se eliminará permanentemente.'
                : 'This action cannot be undone. The document will be permanently deleted.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.close}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {currentLang === 'es' ? 'Eliminar' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </TooltipProvider >
  );
}
