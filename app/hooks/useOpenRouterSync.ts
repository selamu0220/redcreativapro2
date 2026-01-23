import { useEffect, useState, useCallback } from 'react';
import { useSafeAuth } from './useSafeAuth';

/**
 * Hook personalizado para sincronizar la configuración de IA entre páginas y dispositivos
 * Ahora usa localStorage como almacenamiento principal
 */
export function useOpenRouterSync() {
  const { user, isLoading } = useSafeAuth();
  const [openRouterApiKey, setOpenRouterApiKey] = useState<string>('');
  const [openRouterModel, setOpenRouterModel] = useState<string>('openai/gpt-4o-mini');
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');
  const [isClient, setIsClient] = useState(false);

  // Cargar configuración desde localStorage
  const loadFromStorage = useCallback(() => {
    if (typeof window === 'undefined') return;

    const savedOpenRouterKey = localStorage.getItem('openrouter_api_key') || '';
    const savedGeminiKey = localStorage.getItem('gemini_api_key') || '';
    const savedModel = localStorage.getItem('openrouter_model') || 'openai/gpt-4o-mini';

    setOpenRouterApiKey(savedOpenRouterKey);
    setGeminiApiKey(savedGeminiKey);
    setOpenRouterModel(savedModel);
  }, []);

  // Función para guardar configuración en localStorage
  const saveConfig = async (config: { openRouterKey?: string, geminiKey?: string, model?: string }) => {
    if (typeof window === 'undefined') return;

    try {
      if (config.openRouterKey !== undefined) {
        setOpenRouterApiKey(config.openRouterKey);
        localStorage.setItem('openrouter_api_key', config.openRouterKey);
      }
      if (config.geminiKey !== undefined) {
        setGeminiApiKey(config.geminiKey);
        localStorage.setItem('gemini_api_key', config.geminiKey);
      }
      if (config.model !== undefined) {
        setOpenRouterModel(config.model);
        localStorage.setItem('openrouter_model', config.model);
      }

      window.dispatchEvent(new CustomEvent('ai-config-updated', { detail: config }));
    } catch (error) {
      console.error('Error saving config to localStorage:', error);
    }
  };

  const saveOpenRouterConfig = (apiKey: string, model: string) => {
    saveConfig({ openRouterKey: apiKey, model });
  };

  const saveGeminiConfig = (apiKey: string) => {
    saveConfig({ geminiKey: apiKey });
  };

  const clearOpenRouterConfig = async () => {
    await saveConfig({ openRouterKey: '', model: 'openai/gpt-4o-mini' });
  };

  const clearGeminiConfig = async () => {
    await saveConfig({ geminiKey: '' });
  };

  useEffect(() => {
    setIsClient(true);
    loadFromStorage();
  }, [loadFromStorage]);

  return {
    openRouterApiKey,
    openRouterModel,
    geminiApiKey,
    isClient,
    saveOpenRouterConfig,
    saveGeminiConfig,
    clearOpenRouterConfig,
    clearGeminiConfig,
    refreshConfig: loadFromStorage
  };
}

/**
 * Hook simplificado para escuchar cambios (mantenido por compatibilidad)
 */
export function useOpenRouterConfigListener() {
  const { openRouterApiKey, openRouterModel, geminiApiKey, isClient } = useOpenRouterSync();
  return { config: { apiKey: openRouterApiKey, model: openRouterModel, geminiKey: geminiApiKey }, isClient };
}
