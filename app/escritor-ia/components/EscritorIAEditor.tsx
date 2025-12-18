"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useViewport } from '../../hooks/useViewport';
import { MobileOptimizedTextarea } from '../../components/MobileFormOptimizations';
import { MobileOptimizedLoader, MobileErrorState } from '../../components/MobileLoadingStates';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
// Using custom modal implementation since Dialog component doesn't exist
import { RefreshCw, Settings, Save, FileText, X } from 'lucide-react';
import AIConfigurationPanel from '../../components/AIConfigurationPanel';
import AIModelSelector from '../../components/AIModelSelector';
import { useAISettings } from '../../hooks/useAISettings';

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
  onAISettingsChange?: (settings: any) => void;
  onGenerateVersion?: (direction: 'up' | 'down') => void;
  onShowVideoModal?: () => void;
  isPremium?: boolean;
  className?: string;
}

export default function EscritorIAEditor({
  pages,
  currentPageIndex,
  isImproving,
  onContentChange,
  onImproveContent,
  onSaveDocument,
  onAISettingsChange,
  onGenerateVersion,
  onShowVideoModal,
  isPremium = false,
  className = ''
}: EscritorIAEditorProps) {
  const { isMobile, isTablet } = useViewport();
  const [mounted, setMounted] = useState(false);
  const [localContent, setLocalContent] = useState('');
  const [showAIConfig, setShowAIConfig] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // AI Settings integration
  const {
    settings: aiSettings,
    updateSettings: updateAISettings,
    isLoading: aiSettingsLoading
  } = useAISettings();

  // Handle AI settings changes
  const handleAISettingsChange = useCallback((newSettings: any) => {
    updateAISettings(newSettings);
    if (onAISettingsChange) {
      onAISettingsChange(newSettings);
    }
  }, [updateAISettings, onAISettingsChange]);

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
            ${isMobile ? 'space-y-3' : 'space-y-2'}
          `}>
            {/* Stats Row */}
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

            {/* AI Model Display */}
            {!aiSettingsLoading && aiSettings && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Modelo IA:</span>
                <span className="font-medium text-foreground">
                  {aiSettings.aiModel.split('/').pop()?.replace('-', ' ').toUpperCase() || 'GPT-4O'}
                </span>
                <span>•</span>
                <span>Tono: {aiSettings.aiTone}</span>
                <span>•</span>
                <span>Estilo: {aiSettings.aiStyle}</span>
              </div>
            )}
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
            flex gap-3 flex-wrap
            ${isMobile ? 'flex-col' : 'flex-row justify-between'}
          `}>

            {/* Version Generation Buttons (Mejorar/Simplificar) */}
            {onGenerateVersion && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => onGenerateVersion('up')}
                  disabled={isImproving || !localContent.trim()}
                  className={`
                    flex items-center gap-2
                    ${isPremium ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-emerald-500/25 text-white border-0' : 'bg-green-600 hover:bg-green-700 text-white'}
                    ${isMobile ? 'flex-1' : ''}
                  `}
                  title="Mejorar texto (↑)"
                >
                  <span className="text-lg">↑</span>
                  <span className="hidden sm:inline">Mejorar{isPremium ? ' ✨' : ''}</span>
                </Button>

                <Button
                  type="button"
                  onClick={() => onGenerateVersion('down')}
                  disabled={isImproving || !localContent.trim()}
                  variant={isPremium ? "default" : "secondary"}
                  className={`
                    flex items-center gap-2
                    ${isPremium ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25 text-white border-0' : ''}
                    ${isMobile ? 'flex-1' : ''}
                  `}
                  title="Simplificar texto (↓)"
                >
                  <span className="text-lg">↓</span>
                  <span className="hidden sm:inline">Simplificar{isPremium ? ' ✨' : ''}</span>
                </Button>
              </div>
            )}

            {/* Standard Improve Button */}
            <Button
              type="button"
              onClick={onImproveContent}
              disabled={isImproving || !localContent.trim()}
              className={`
                flex items-center gap-2 font-medium
                ${isMobile ? 'w-full py-3' : 'px-6 py-2'}
                ${isPremium ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-500/25 text-white border-0' : ''}
              `}
            >
              {isImproving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {isImproving ? 'Mejorando...' : `Mejorar con IA${isPremium ? ' ✨' : ''}`}
            </Button>

            <div className="flex gap-2">
              {/* Tutorial Button */}
              {onShowVideoModal && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onShowVideoModal}
                  className={`
                    flex items-center gap-2
                    ${isMobile ? 'flex-1' : ''}
                  `}
                  title="Ver tutorial"
                >
                  <span className="text-lg">📺</span>
                  <span className="hidden sm:inline">Tutorial</span>
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAIConfig(true)}
                className={`
                  flex items-center gap-2
                  ${isMobile ? 'flex-1' : ''}
                `}
              >
                <Settings className="w-4 h-4" />
                {isMobile ? 'Config' : 'Configurar'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Configuration Modal */}
      {showAIConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAIConfig(false)}
          />

          {/* Modal Content */}
          <div className={`
            relative bg-background border border-border rounded-lg shadow-lg
            ${isMobile
              ? 'w-[95vw] h-[90vh] max-w-[95vw] max-h-[90vh]'
              : 'w-full max-w-4xl max-h-[80vh]'
            }
            overflow-hidden flex flex-col
          `}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuración de IA
              </h2>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAIConfig(false)}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4">
              {aiSettingsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <MobileOptimizedLoader size="md" text="Cargando configuración..." />
                </div>
              ) : (
                <AIConfigurationPanel
                  onSettingsChange={handleAISettingsChange}
                  className="border-0 bg-transparent"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}