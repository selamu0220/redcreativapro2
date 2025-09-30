import { useEffect, useState } from 'react';

/**
 * Hook personalizado para sincronizar la configuración de OpenRouter entre páginas
 * Escucha cambios en localStorage y actualiza automáticamente los estados
 */
export function useOpenRouterSync() {
  const [openRouterApiKey, setOpenRouterApiKey] = useState<string>('');
  const [openRouterModel, setOpenRouterModel] = useState<string>('openai/gpt-3.5-turbo');
  const [isClient, setIsClient] = useState(false);

  // Función para cargar configuración desde localStorage
  const loadOpenRouterConfig = () => {
    if (typeof window === 'undefined') return;
    
    const savedApiKey = localStorage.getItem('openrouter_api_key') || '';
    const savedModel = localStorage.getItem('openrouter_model') || 'openai/gpt-3.5-turbo';
    
    setOpenRouterApiKey(savedApiKey);
    setOpenRouterModel(savedModel);
  };

  // Función para guardar configuración en localStorage
  const saveOpenRouterConfig = (apiKey: string, model: string) => {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem('openrouter_api_key', apiKey);
    localStorage.setItem('openrouter_model', model);
    
    // Disparar evento personalizado para notificar a otras páginas
    window.dispatchEvent(new CustomEvent('openrouter-config-updated', {
      detail: { apiKey, model }
    }));
  };

  // Función para limpiar configuración
  const clearOpenRouterConfig = () => {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('openrouter_api_key');
    localStorage.removeItem('openrouter_model');
    
    setOpenRouterApiKey('');
    setOpenRouterModel('openai/gpt-3.5-turbo');
    
    // Disparar evento de limpieza
    window.dispatchEvent(new CustomEvent('openrouter-config-cleared'));
  };

  // Efecto para inicializar el cliente y cargar configuración
  useEffect(() => {
    setIsClient(true);
    loadOpenRouterConfig();
  }, []);

  // Efecto para escuchar cambios en localStorage desde otras páginas
  useEffect(() => {
    if (!isClient) return;

    // Escuchar eventos de storage (cambios desde otras pestañas)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'openrouter_api_key' || e.key === 'openrouter_model') {
        loadOpenRouterConfig();
      }
    };

    // Escuchar eventos personalizados (cambios desde la misma pestaña)
    const handleOpenRouterConfigUpdate = (e: CustomEvent) => {
      const { apiKey, model } = e.detail;
      setOpenRouterApiKey(apiKey);
      setOpenRouterModel(model);
    };

    const handleOpenRouterConfigClear = () => {
      setOpenRouterApiKey('');
      setOpenRouterModel('openai/gpt-3.5-turbo');
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('openrouter-config-updated', handleOpenRouterConfigUpdate as EventListener);
    window.addEventListener('openrouter-config-cleared', handleOpenRouterConfigClear);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('openrouter-config-updated', handleOpenRouterConfigUpdate as EventListener);
      window.removeEventListener('openrouter-config-cleared', handleOpenRouterConfigClear);
    };
  }, [isClient]);

  return {
    openRouterApiKey,
    openRouterModel,
    isClient,
    setOpenRouterApiKey,
    setOpenRouterModel,
    saveOpenRouterConfig,
    clearOpenRouterConfig,
    loadOpenRouterConfig
  };
}

/**
 * Hook simplificado para solo escuchar cambios de configuración
 * Útil para componentes que solo necesitan leer la configuración
 */
export function useOpenRouterConfigListener() {
  const [config, setConfig] = useState({ apiKey: '', model: 'openai/gpt-3.5-turbo' });
  const [isClient, setIsClient] = useState(false);

  const loadConfig = () => {
    if (typeof window === 'undefined') return;
    
    const apiKey = localStorage.getItem('openrouter_api_key') || '';
    const model = localStorage.getItem('openrouter_model') || 'openai/gpt-3.5-turbo';
    
    setConfig({ apiKey, model });
  };

  useEffect(() => {
    setIsClient(true);
    loadConfig();
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'openrouter_api_key' || e.key === 'openrouter_model') {
        loadConfig();
      }
    };

    const handleConfigUpdate = () => {
      loadConfig();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('openrouter-config-updated', handleConfigUpdate);
    window.addEventListener('openrouter-config-cleared', handleConfigUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('openrouter-config-updated', handleConfigUpdate);
      window.removeEventListener('openrouter-config-cleared', handleConfigUpdate);
    };
  }, [isClient]);

  return { config, isClient };
}