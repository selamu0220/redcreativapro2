"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useViewport } from '../../hooks/useViewport';
import { MobileOptimizedTextarea } from '../../components/MobileFormOptimizations';
import { MobileOptimizedLoader, MobileErrorState } from '../../components/MobileLoadingStates';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { RefreshCw, Settings, Save, FileText } from 'lucide-react';

interface DocumentPage {
  id: string;
  content: string;
  title: string;
}

interface EscritorIAEditorProps {
  pages: DocumentPage[];
  currentPageIndex: number;
  isImproving: boolean;
  onContentChange: (content: string) => void;
  onImproveContent: () => void;
  onSaveDocument: () => void;
  className?: string;
}

export default function EscritorIAEditor({
  pages,
  currentPageIndex,
  isImproving,
  onContentChange,
  onImproveContent,
  onSaveDocument,
  className = ''
}: EscritorIAEditorProps) {
  const { isMobile, isTablet } = useViewport();
  const [mounted, setMounted] = useState(false);
  const [localContent, setLocalContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle mounting to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync local content with props
  useEffect(() => {
    if (mounted && pages[currentPageIndex]) {
      setLocalContent(pages[currentPageIndex].content);
    }
  }, [mounted, pages, currentPageIndex]);

  // Handle content changes with debouncing
  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setLocalContent(newContent);
    
    // Debounce the callback to parent
    const timeoutId = setTimeout(() => {
      onContentChange(newContent);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [onContentChange]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(200, textarea.scrollHeight)}px`;
    }
  }, [localContent]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <MobileOptimizedLoader size="md" text="Inicializando editor..." />
      </div>
    );
  }

  const currentPage = pages[currentPageIndex];
  if (!currentPage) {
    return (
      <MobileErrorState
        title="Página no encontrada"
        description="No se pudo cargar la página del documento."
        onRetry={() => window.location.reload()}
      />
    );
  }

  const wordCount = localContent.trim() ? localContent.trim().split(/\s+/).length : 0;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <div className={`w-full space-y-4 ${className}`}>
      {/* Document Stats */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className={`
            flex items-center justify-between text-sm text-muted-foreground
            ${isMobile ? 'flex-col space-y-2' : 'flex-row'}
          `}>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                {wordCount} palabras
              </span>
              <span>{readingTime} min lectura</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onSaveDocument}
                className="flex items-center gap-1"
              >
                <Save className="w-4 h-4" />
                {isMobile ? '' : 'Guardar'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Editor */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">
            {currentPage.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Textarea */}
          <div className="relative">
            <MobileOptimizedTextarea
              ref={textareaRef}
              value={localContent}
              onChange={handleContentChange}
              placeholder="Escribe tu contenido aquí y usa la IA para mejorarlo..."
              className={`
                ai-writer-textarea w-full resize-none
                ${isMobile ? 'min-h-[300px] text-base' : 'min-h-[400px] text-sm'}
                border-border/50 focus:border-primary/50
                transition-all duration-200
              `}
              disabled={isImproving}
              rows={isMobile ? 12 : 16}
              autoResize={true}
            />
            
            {/* Loading overlay */}
            {isImproving && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-md">
                <MobileOptimizedLoader 
                  size="md" 
                  text="Mejorando contenido con IA..." 
                  variant="spinner"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className={`
            flex gap-3
            ${isMobile ? 'flex-col' : 'flex-row justify-between'}
          `}>
            <Button
              type="button"
              onClick={onImproveContent}
              disabled={isImproving || !localContent.trim()}
              className={`
                flex items-center gap-2 font-medium
                ${isMobile ? 'w-full py-3' : 'px-6 py-2'}
              `}
            >
              {isImproving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {isImproving ? 'Mejorando...' : 'Mejorar con IA'}
            </Button>

            <Button
              type="button"
              variant="outline"
              className={`
                flex items-center gap-2
                ${isMobile ? 'w-full py-3' : 'px-4 py-2'}
              `}
            >
              <Settings className="w-4 h-4" />
              {isMobile ? 'Configuración de IA' : 'Configurar'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}