"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Sparkles, 
  Settings, 
  CheckCircle2,
  AlertCircle,
  Clock,
  Sliders,
  FileText
} from "lucide-react";
import WordToolbar, { type TextFormat } from "@/components/WordToolbar";
import { SmartAIWriter, TextVersionManager, type SmartWriterSettings } from "@/app/lib/smart-ai-writer";

// Dynamic import for DocumentManager to avoid SSR issues
import dynamic from 'next/dynamic';

const DocumentManager = dynamic(() => import("@/components/DocumentManager").then(mod => ({ default: mod.default })), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 h-32 rounded-md"></div>
});

interface SmartAIEditorProps {
  pageId: string;
  title: string;
  initialContent: string;
  onContentChange: (content: string) => void;
}

export default function SmartAIEditor({ 
  pageId, 
  title, 
  initialContent, 
  onContentChange 
}: SmartAIEditorProps) {
  const [text, setText] = useState(initialContent);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const versionManagerRef = useRef<TextVersionManager>(new TextVersionManager());
  
  const [settings, setSettings] = useState<SmartWriterSettings>({
    autoMode: false,
    inactivityDelay: 3000,
    creativity: 0.3,
    customPrompt: "Mejora este texto corrigiendo gramática, ortografía y fluidez. Mantén el idioma original y el tono."
  });

  const [textFormat, setTextFormat] = useState<TextFormat>({
    fontFamily: 'Georgia',
    fontSize: 14,
    bold: false,
    italic: false,
    underline: false,
    textAlign: 'left',
    textColor: '#000000',
    listType: 'none'
  });

  const [showSettings, setShowSettings] = useState(false);
  const [showDocumentManager, setShowDocumentManager] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle text changes
  const handleTextChange = useCallback((newText: string) => {
    setText(newText);
    onContentChange(newText);
    
    if (textareaRef.current) {
      setCursorPosition(textareaRef.current.selectionStart);
    }
  }, [onContentChange]);

  // Improve text function
  const handleImproveText = async () => {
    if (!text.trim() || isProcessing) return;

    setIsProcessing(true);
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch('/api/improve-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          creativity: settings.creativity,
          customPrompt: settings.customPrompt
        }),
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      const data = await response.json();
      const improvedText = data.improvedText;
      
      if (improvedText && improvedText !== text) {
        versionManagerRef.current.saveVersion(pageId, text, improvedText, cursorPosition);
        setText(improvedText);
        onContentChange(improvedText);
        setSuccess("Texto mejorado exitosamente");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError("No se pudieron generar mejoras para este texto");
      }
    } catch (error) {
      console.error("Error improving text:", error);
      setError(error instanceof Error ? error.message : "Error al mejorar el texto");
    } finally {
      setIsProcessing(false);
      setIsLoading(false);
    }
  };

  // Handle document import
  const handleDocumentImport = (importedText: string) => {
    if (text.trim()) {
      versionManagerRef.current.saveVersion(pageId, text, text, cursorPosition);
    }
    
    setText(importedText);
    onContentChange(importedText);
    setSuccess("Documento importado exitosamente");
    setTimeout(() => setSuccess(""), 3000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDocumentManager(!showDocumentManager)}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Documentos
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sliders className="h-4 w-4" />
              Configuración del Editor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="creativity" className="text-sm font-medium">Creatividad (0-1)</label>
                <input
                  id="creativity"
                  type="number"
                  value={settings.creativity}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    creativity: parseFloat(e.target.value) || 0.3 
                  }))}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  min="0"
                  max="1"
                  step="0.1"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="custom-prompt" className="text-sm font-medium">Prompt personalizado</label>
              <textarea
                id="custom-prompt"
                value={settings.customPrompt}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  customPrompt: e.target.value 
                }))}
                className="w-full mt-1 px-3 py-2 border rounded-md"
                rows={3}
                placeholder="Instrucciones para mejorar el texto..."
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document Manager */}
      {showDocumentManager && (
        <DocumentManager
          text={text}
          onTextImport={handleDocumentImport}
          title={title.toLowerCase().replace(/\s+/g, '-')}
        />
      )}

      {/* Word Toolbar */}
      <WordToolbar
        format={textFormat}
        onFormatChange={(format) => setTextFormat(prev => ({ ...prev, ...format }))}
        disabled={isLoading}
      />

      {/* Status Messages */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-700">
          <CheckCircle2 className="h-4 w-4" />
          {success}
        </div>
      )}

      {/* Main Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Editor de Texto
          </CardTitle>
          <CardDescription>
            Haz clic en 'Mejorar Texto' para optimizar tu contenido
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            className={`w-full min-h-[300px] p-4 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              textFormat.bold ? 'font-bold' : ''
            } ${
              textFormat.italic ? 'italic' : ''
            } ${
              textFormat.underline ? 'underline' : ''
            }`}
            style={{
              fontFamily: textFormat.fontFamily,
              fontSize: `${textFormat.fontSize}px`,
              textAlign: textFormat.textAlign,
              color: textFormat.textColor
            }}
            placeholder="Escribe tu texto aquí..."
            disabled={isLoading}
          />

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                onClick={handleImproveText}
                disabled={isLoading || !text.trim() || isProcessing}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <Clock className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {isLoading ? "Mejorando..." : "Mejorar Texto"}
              </Button>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{text.length} caracteres</span>
              <span>•</span>
              <span>{text.split(/\s+/).filter(word => word.length > 0).length} palabras</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}