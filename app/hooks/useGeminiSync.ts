import { useEffect, useState } from 'react';

/**
 * Hook personalizado para sincronizar la configuración de Gemini entre páginas
 * Escucha cambios en localStorage y actualiza automáticamente los estados
 */
export function useGeminiSync() {
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');
  const [geminiModel, setGeminiModel] = useState<string>('gemini-2.0-flash-lite');
  const [isClient, setIsClient] = useState(false);

  // Función para cargar configuración desde localStorage
  const loadGeminiConfig = () => {
    if (typeof window === 'undefined') return;
    
    const savedApiKey = localStorage.getItem('gemini_api_key') || '';
    const savedModel = localStorage.getItem('gemini_model') || 'gemini-2.0-flash-lite';
    
    setGeminiApiKey(savedApiKey);
    setGeminiModel(savedModel);
  };

  // Función para guardar configuración en localStorage
  const saveGeminiConfig = (apiKey: string, model: string) => {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem('gemini_api_key', apiKey);
    localStorage.setItem('gemini_model', model);
    
    // Disparar evento personalizado para notificar a otras páginas
    window.dispatchEvent(new CustomEvent('gemini-config-updated', {
      detail: { apiKey, model }
    }));
  };

  // Función para limpiar configuración
  const clearGeminiConfig = () => {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('gemini_api_key');
    localStorage.removeItem('gemini_model');
    
    setGeminiApiKey('');
    setGeminiModel('gemini-2.0-flash-lite');
    
    // Disparar evento de limpieza
    window.dispatchEvent(new CustomEvent('gemini-config-cleared'));
  };

  // Efecto para inicializar el cliente y cargar configuración
  useEffect(() => {
    setIsClient(true);
    loadGeminiConfig();
  }, []);

  // Efecto para escuchar cambios en localStorage desde otras páginas
  useEffect(() => {
    if (!isClient) return;

    // Escuchar eventos de storage (cambios desde otras pestañas)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'gemini_api_key' || e.key === 'gemini_model') {
        loadGeminiConfig();
      }
    };

    // Escuchar eventos personalizados (cambios desde la misma pestaña)
    const handleGeminiConfigUpdate = (e: CustomEvent) => {
      const { apiKey, model } = e.detail;
      setGeminiApiKey(apiKey);
      setGeminiModel(model);
    };

    const handleGeminiConfigClear = () => {
      setGeminiApiKey('');
      setGeminiModel('gemini-2.0-flash-lite');
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('gemini-config-updated', handleGeminiConfigUpdate as EventListener);
    window.addEventListener('gemini-config-cleared', handleGeminiConfigClear);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('gemini-config-updated', handleGeminiConfigUpdate as EventListener);
      window.removeEventListener('gemini-config-cleared', handleGeminiConfigClear);
    };
  }, [isClient]);

  return {
    geminiApiKey,
    geminiModel,
    isClient,
    setGeminiApiKey,
    setGeminiModel,
    saveGeminiConfig,
    clearGeminiConfig,
    loadGeminiConfig
  };
}

/**
 * Hook simplificado para solo escuchar cambios de configuración
 * Útil para componentes que solo necesitan leer la configuración
 */
export function useGeminiConfigListener() {
  const [config, setConfig] = useState({ apiKey: '', model: 'gemini-2.0-flash-lite' });
  const [isClient, setIsClient] = useState(false);

  const loadConfig = () => {
    if (typeof window === 'undefined') return;
    
    const apiKey = localStorage.getItem('gemini_api_key') || '';
    const model = localStorage.getItem('gemini_model') || 'gemini-2.0-flash-lite';
    
    setConfig({ apiKey, model });
  };

  useEffect(() => {
    setIsClient(true);
    loadConfig();
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'gemini_api_key' || e.key === 'gemini_model') {
        loadConfig();
      }
    };

    const handleConfigUpdate = () => {
      loadConfig();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('gemini-config-updated', handleConfigUpdate);
    window.addEventListener('gemini-config-cleared', handleConfigUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('gemini-config-updated', handleConfigUpdate);
      window.removeEventListener('gemini-config-cleared', handleConfigUpdate);
    };
  }, [isClient]);

  return { config, isClient };
}