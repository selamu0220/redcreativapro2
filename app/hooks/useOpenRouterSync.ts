import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';

/**
 * Hook personalizado para sincronizar la configuración de IA entre páginas y dispositivos usando Clerk
 */
export function useOpenRouterSync() {
  const { user, isLoaded } = useUser();
  const [openRouterApiKey, setOpenRouterApiKey] = useState<string>('');
  const [openRouterModel, setOpenRouterModel] = useState<string>('openai/gpt-4o-mini');
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');
  const [isClient, setIsClient] = useState(false);

  // Cargar configuración desde Clerk Metadata
  const loadFromClerk = useCallback(() => {
    if (!isLoaded || !user) return;
    
    const metadata = user.unsafeMetadata as any;
    const apiKeys = metadata.apiKeys || {};
    const settings = metadata.settings || {};

    const savedOpenRouterKey = apiKeys.openRouter || '';
    const savedGeminiKey = apiKeys.gemini || '';
    const savedModel = settings.openRouterModel || 'openai/gpt-4o-mini';

    setOpenRouterApiKey(savedOpenRouterKey);
    setGeminiApiKey(savedGeminiKey);
    setOpenRouterModel(savedModel);

    // Sync with localStorage for legacy compatibility
    localStorage.setItem('openrouter_api_key', savedOpenRouterKey);
    localStorage.setItem('openrouter_model', savedModel);
    localStorage.setItem('gemini_api_key', savedGeminiKey);
  }, [isLoaded, user]);

  // Función para guardar configuración en Clerk y localStorage
  const saveConfig = async (config: { openRouterKey?: string, geminiKey?: string, model?: string }) => {
    if (!user) return;

    const currentMetadata = user.unsafeMetadata as any;
    const newMetadata = {
      ...currentMetadata,
      apiKeys: {
        ...(currentMetadata.apiKeys || {}),
        ...(config.openRouterKey !== undefined ? { openRouter: config.openRouterKey } : {}),
        ...(config.geminiKey !== undefined ? { gemini: config.geminiKey } : {}),
      },
      settings: {
        ...(currentMetadata.settings || {}),
        ...(config.model !== undefined ? { openRouterModel: config.model } : {}),
      }
    };

    try {
      await user.update({ unsafeMetadata: newMetadata });
      
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
      console.error('Error saving metadata to Clerk:', error);
    }
  };

  const saveOpenRouterConfig = (apiKey: string, model: string) => {
    saveConfig({ openRouterKey: apiKey, model });
  };

  const saveGeminiConfig = (apiKey: string) => {
    saveConfig({ geminiKey: apiKey });
  };

  const clearOpenRouterConfig = async () => {
    if (!user) return;
    await saveConfig({ openRouterKey: '', model: 'openai/gpt-4o-mini' });
  };

  const clearGeminiConfig = async () => {
    if (!user) return;
    await saveConfig({ geminiKey: '' });
  };

  useEffect(() => {
    setIsClient(true);
    if (isLoaded && user) {
      loadFromClerk();
    }
  }, [isLoaded, user, loadFromClerk]);

  return {
    openRouterApiKey,
    openRouterModel,
    geminiApiKey,
    isClient,
    saveOpenRouterConfig,
    saveGeminiConfig,
    clearOpenRouterConfig,
    clearGeminiConfig,
    refreshConfig: loadFromClerk
  };
}

/**
 * Hook simplificado para escuchar cambios (mantenido por compatibilidad)
 */
export function useOpenRouterConfigListener() {
  const { openRouterApiKey, openRouterModel, geminiApiKey, isClient } = useOpenRouterSync();
  return { config: { apiKey: openRouterApiKey, model: openRouterModel, geminiKey: geminiApiKey }, isClient };
}