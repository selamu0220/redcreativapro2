// Utilidad para validar y corregir configuraciones de OpenRouter
// Previene errores 404 por modelos incorrectos

export interface OpenRouterConfig {
  model: string;
  temperature: string;
  maxTokens: string;
  apiKey?: string;
}

// Modelos válidos de OpenRouter
const VALID_OPENROUTER_MODELS = [
  'openai/gpt-4o-mini',
  'openai/gpt-4o',
  'openai/gpt-3.5-turbo',
  'anthropic/claude-3-haiku',
  'anthropic/claude-3-sonnet',
  'anthropic/claude-3-opus',
  'google/gemini-pro-1.5',
  'meta-llama/llama-3.1-8b-instruct',
  'meta-llama/llama-3.1-70b-instruct',
  'mistralai/mistral-7b-instruct'
];

// Modelo por defecto recomendado
const DEFAULT_MODEL = 'openai/gpt-4o-mini';

/**
 * Valida y corrige un modelo de OpenRouter
 * @param model - El modelo a validar
 * @returns El modelo corregido si es necesario
 */
export function validateAndFixOpenRouterModel(model: string): string {
  // Si el modelo es válido, devolverlo
  if (VALID_OPENROUTER_MODELS.includes(model)) {
    return model;
  }
  
  // Si el modelo contiene 'gpt-4o-mini' pero tiene prefijos incorrectos
  if (model.includes('gpt-4o-mini')) {
    console.warn(`⚠️ Modelo incorrecto detectado: ${model}. Corrigiendo a ${DEFAULT_MODEL}`);
    localStorage.setItem('openrouter_model', DEFAULT_MODEL);
    return DEFAULT_MODEL;
  }
  
  // Para cualquier otro modelo inválido, usar el por defecto
  console.warn(`⚠️ Modelo inválido detectado: ${model}. Usando ${DEFAULT_MODEL} por defecto`);
  localStorage.setItem('openrouter_model', DEFAULT_MODEL);
  return DEFAULT_MODEL;
}

/**
 * Obtiene la configuración completa de OpenRouter desde localStorage con validación
 * @param userApiKey - API key opcional del estado local del componente
 * @returns Configuración validada de OpenRouter
 */
export function getValidatedOpenRouterConfig(userApiKey?: string): OpenRouterConfig {
  const rawModel = localStorage.getItem('openrouter_model') || DEFAULT_MODEL;
  const validatedModel = validateAndFixOpenRouterModel(rawModel);
  
  return {
    model: validatedModel,
    temperature: localStorage.getItem('openrouter_temperature') || '0.7',
    maxTokens: localStorage.getItem('openrouter_max_tokens') || '1000',
    apiKey: userApiKey || localStorage.getItem('openrouter_api_key') || undefined
  };
}

/**
 * Limpia todas las configuraciones incorrectas de OpenRouter
 * @returns true si se realizaron cambios
 */
export function cleanIncorrectOpenRouterConfig(): boolean {
  let hasChanges = false;
  
  // Lista de claves a verificar y limpiar si contienen valores incorrectos
  const keysToCheck = [
    'openrouter_model',
    'customOpenRouterModel'
  ];
  
  keysToCheck.forEach(key => {
    const value = localStorage.getItem(key);
    if (value && !VALID_OPENROUTER_MODELS.includes(value)) {
      console.log(`🧹 Limpiando configuración incorrecta: ${key} = ${value}`);
      localStorage.setItem(key, DEFAULT_MODEL);
      hasChanges = true;
    }
  });
  
  return hasChanges;
}

/**
 * Inicializa la configuración de OpenRouter con valores por defecto seguros
 */
export function initializeOpenRouterConfig(): void {
  const config = {
    openrouter_model: DEFAULT_MODEL,
    openrouter_temperature: '0.7',
    openrouter_max_tokens: '1000'
  };
  
  Object.entries(config).forEach(([key, value]) => {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, value);
    }
  });
  
  // Limpiar configuraciones incorrectas existentes
  cleanIncorrectOpenRouterConfig();
}

/**
 * Verifica si la configuración actual de OpenRouter es válida
 * @returns true si la configuración es válida
 */
export function isOpenRouterConfigValid(): boolean {
  const model = localStorage.getItem('openrouter_model');
  return model ? VALID_OPENROUTER_MODELS.includes(model) : false;
}

// Auto-ejecutar limpieza al importar el módulo
if (typeof window !== 'undefined') {
  // Solo ejecutar en el navegador
  setTimeout(() => {
    cleanIncorrectOpenRouterConfig();
  }, 100);
}
