"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, Save, Undo2, Redo2, Moon, Sun, Bold, Italic, List, Loader2, X, Check, AlertCircle } from 'lucide-react';
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { toast } from "sonner";

export default function EscritorIAPage() {
  const { isAuthenticated } = useKindeBrowserClient();

  const [content, setContent] = useState('');
  const [savedContent, setSavedContent] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoImprove, setAutoImprove] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimer = useRef<NodeJS.Timeout | null>(null);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  // Load content from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('doc-content');
    const savedTime = localStorage.getItem('doc-saved-time');
    const theme = localStorage.getItem('doc-theme');

    if (saved) {
      setContent(saved);
      setSavedContent(saved);
      setHistory([saved]);
      setHistoryIndex(0);
    }
    if (savedTime) setLastSaved(new Date(savedTime));
    if (theme) setDarkMode(theme === 'dark');
  }, []);

  // Auto-save every 30 seconds
  useEffect(() => {
    autoSaveTimer.current = setInterval(() => {
      if (content !== savedContent) {
        saveContent();
      }
    }, 30000);

    return () => {
      if (autoSaveTimer.current) clearInterval(autoSaveTimer.current);
    };
  }, [content, savedContent]);

  // Save content
  const saveContent = useCallback(() => {
    localStorage.setItem('doc-content', content);
    const now = new Date();
    localStorage.setItem('doc-saved-time', now.toISOString());
    setSavedContent(content);
    setLastSaved(now);
    toast.success("Documento guardado");
  }, [content]);

  // Add to history
  const addToHistory = useCallback((text: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(text);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // Undo/Redo
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setContent(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setContent(history[historyIndex + 1]);
    }
  };

  // Improve text with AI - Using internal API
  const improveText = async (text: string) => {
    if (!text.trim() || text.length < 10) return null;

    setIsProcessing(true);
    setError(null);

    try {
      // Use OpenRouter API with new API key
      const response = await fetch('/api/improve-text-openrouter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: text,
          creativity: 0.3,
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al procesar el texto');
      }

      const data = await response.json();
      const improvedText = data.improvedContent?.trim();

      if (!improvedText) {
        throw new Error('No se recibió texto mejorado');
      }

      // Remove quotes if present (extra safety)
      const cleanedText = improvedText.replace(/^["']|["']$/g, '');

      setIsProcessing(false);
      return cleanedText;
    } catch (err) {
      console.error('Error improving text:', err);
      setError('No se pudo mejorar el texto. Por favor, intenta de nuevo.');
      setIsProcessing(false);
      return null;
    }
  };

  // Handle text change
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setContent(newText);

    // Clear existing timer
    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
    }

    // Set new timer for auto-improve
    if (autoImprove && newText.length > 20 && isAuthenticated) {
      typingTimer.current = setTimeout(async () => {
        const improved = await improveText(newText);
        if (improved && improved !== newText) {
          setSuggestion(improved);
          setShowSuggestion(true);
        }
      }, 2000);
    }
  };

  // Manual improve
  const handleManualImprove = async () => {
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para usar esta función");
      return;
    }

    if (content.trim()) {
      const improved = await improveText(content);
      if (improved && improved !== content) {
        setSuggestion(improved);
        setShowSuggestion(true);
      }
    }
  };

  // Accept suggestion
  const acceptSuggestion = () => {
    if (suggestion) {
      addToHistory(suggestion);
      setContent(suggestion);
      setShowSuggestion(false);
      setSuggestion(null);
      toast.success("✨ Texto mejorado aplicado");
    }
  };

  // Reject suggestion
  const rejectSuggestion = () => {
    setShowSuggestion(false);
    setSuggestion(null);
  };

  // Format text
  const formatText = (type: 'bold' | 'italic' | 'list') => {
    const textarea = textAreaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    if (!selectedText) return;

    let newText = content;
    let formatted = selectedText;

    switch (type) {
      case 'bold':
        formatted = `**${selectedText}**`;
        break;
      case 'italic':
        formatted = `*${selectedText}*`;
        break;
      case 'list':
        formatted = selectedText.split('\n').map(line => `- ${line}`).join('\n');
        break;
    }

    newText = content.substring(0, start) + formatted + content.substring(end);
    setContent(newText);
    addToHistory(newText);
  };

  // Toggle theme
  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('doc-theme', newMode ? 'dark' : 'light');
  };

  const bgClass = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const cardClass = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white';
  const textClass = darkMode ? 'text-gray-100' : 'text-gray-900';
  const mutedClass = darkMode ? 'text-gray-400' : 'text-gray-600';
  const borderClass = darkMode ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className={`min-h-screen ${bgClass} ${textClass} p-4 transition-colors duration-200`}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">Escritor IA Avanzado</h1>
            <p className={`text-sm ${mutedClass}`}>
              {lastSaved
                ? `Guardado: ${lastSaved.toLocaleTimeString()}`
                : 'Sin guardar'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className={darkMode ? 'border-gray-600 hover:bg-gray-700' : ''}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={saveContent}
              className={darkMode ? 'border-gray-600 hover:bg-gray-700' : ''}
            >
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <Card className={`${cardClass} p-3 mb-4`}>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('bold')}
                disabled={isProcessing}
                className={darkMode ? 'hover:bg-gray-700' : ''}
              >
                <Bold className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('italic')}
                disabled={isProcessing}
                className={darkMode ? 'hover:bg-gray-700' : ''}
              >
                <Italic className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('list')}
                disabled={isProcessing}
                className={darkMode ? 'hover:bg-gray-700' : ''}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            <div className={`h-6 w-px ${borderClass}`}></div>

            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={undo}
                disabled={historyIndex <= 0 || isProcessing}
                className={darkMode ? 'hover:bg-gray-700' : ''}
              >
                <Undo2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={redo}
                disabled={historyIndex >= history.length - 1 || isProcessing}
                className={darkMode ? 'hover:bg-gray-700' : ''}
              >
                <Redo2 className="w-4 h-4" />
              </Button>
            </div>

            <div className={`h-6 w-px ${borderClass}`}></div>

            <Button
              variant="default"
              size="sm"
              onClick={handleManualImprove}
              disabled={isProcessing || !content.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Mejorar texto
                </>
              )}
            </Button>

            <label className="flex items-center gap-2 ml-auto">
              <input
                type="checkbox"
                checked={autoImprove}
                onChange={(e) => setAutoImprove(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Mejora automática</span>
            </label>
          </div>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-4 border-red-600 bg-red-50 dark:bg-red-900/20">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-600 dark:text-red-400">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Auth Warning */}
        {!isAuthenticated && (
          <Alert className="mb-4 border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <AlertDescription className="text-yellow-600 dark:text-yellow-400">
              Debes iniciar sesión para usar las funciones de mejora con IA
            </AlertDescription>
          </Alert>
        )}

        {/* Suggestion Box */}
        {showSuggestion && suggestion && (
          <Card className={`${cardClass} p-4 mb-4 border-2 border-blue-500`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold">Sugerencia de mejora</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={rejectSuggestion}
                className={darkMode ? 'hover:bg-gray-700' : ''}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className={`p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} mb-3`}>
              <p className="text-sm whitespace-pre-wrap">{suggestion}</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={acceptSuggestion}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Aceptar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={rejectSuggestion}
                className={darkMode ? 'border-gray-600 hover:bg-gray-700' : ''}
              >
                Rechazar
              </Button>
            </div>
          </Card>
        )}

        {/* Editor */}
        <Card className={`${cardClass} p-0`}>
          <textarea
            ref={textAreaRef}
            value={content}
            onChange={handleTextChange}
            placeholder="Comienza a escribir tu documento aquí..."
            className={`w-full h-[500px] p-6 rounded-lg resize-none focus:outline-none ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
              } font-mono text-base leading-relaxed`}
            disabled={isProcessing}
          />
        </Card>

        {/* Stats */}
        <div className={`mt-4 flex gap-6 text-sm ${mutedClass}`}>
          <span>Palabras: {content.split(/\s+/).filter(Boolean).length}</span>
          <span>Caracteres: {content.length}</span>
          <span>Líneas: {content.split('\n').length}</span>
        </div>
      </div>
    </div>
  );
}
