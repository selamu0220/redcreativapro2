// Utilidad para validar y corregir configuraciones de Gemini
// Previene errores 404 por modelos incorrectos

export interface GeminiConfig {
  model: string;
  temperature: string;
  maxTokens: string;
  apiKey?: string;
}

// Modelos válidos de Gemini
const VALID_GEMINI_MODELS = [
  'gemini-2.5-flash-preview-05-20',
  'gemini-2.5-pro-preview-03-25',
  'gemini-1.5-pro',
  'gemini-pro',
  'gemini-1.0-pro'
];

// Modelo por defecto recomendado
const DEFAULT_MODEL = 'gemini-2.5-flash-preview-05-20';

/**
 * Valida y corrige un modelo de Gemini
 * @param model - El modelo a validar
 * @returns El modelo corregido si es necesario
 */
export function validateAndFixGeminiModel(model: string): string {
  // Si el modelo es válido, devolverlo
  if (VALID_GEMINI_MODELS.includes(model)) {
    return model;
  }
  
  // Si el modelo contiene 'gemini-1.5-flash' pero tiene sufijos incorrectos
  if (model.includes('gemini-1.5-flash')) {
    console.warn(`⚠️ Modelo incorrecto detectado: ${model}. Corrigiendo a ${DEFAULT_MODEL}`);
    localStorage.setItem('gemini_model', DEFAULT_MODEL);
    return DEFAULT_MODEL;
  }
  
  // Para cualquier otro modelo inválido, usar el por defecto
  console.warn(`⚠️ Modelo inválido detectado: ${model}. Usando ${DEFAULT_MODEL} por defecto`);
  localStorage.setItem('gemini_model', DEFAULT_MODEL);
  return DEFAULT_MODEL;
}

/**
 * Obtiene la configuración completa de Gemini desde localStorage con validación
 * @param userApiKey - API key opcional del estado local del componente
 * @returns Configuración validada de Gemini
 */
export function getValidatedGeminiConfig(userApiKey?: string): GeminiConfig {
  const rawModel = localStorage.getItem('gemini_model') || DEFAULT_MODEL;
  const validatedModel = validateAndFixGeminiModel(rawModel);
  
  return {
    model: validatedModel,
    temperature: localStorage.getItem('gemini_temperature') || '0.7',
    maxTokens: localStorage.getItem('gemini_max_tokens') || '1000',
    apiKey: userApiKey || localStorage.getItem('gemini_api_key') || undefined
  };
}

/**
 * Limpia todas las configuraciones incorrectas de Gemini
 * @returns true si se realizaron cambios
 */
export function cleanIncorrectGeminiConfig(): boolean {
  let hasChanges = false;
  
  // Lista de claves a verificar y limpiar si contienen valores incorrectos
  const keysToCheck = [
    'gemini_model',
    'customGeminiModel'
  ];
  
  keysToCheck.forEach(key => {
    const value = localStorage.getItem(key);
    if (value && !VALID_GEMINI_MODELS.includes(value)) {
      console.log(`🧹 Limpiando configuración incorrecta: ${key} = ${value}`);
      localStorage.setItem(key, DEFAULT_MODEL);
      hasChanges = true;
    }
  });
  
  return hasChanges;
}

/**
 * Inicializa la configuración de Gemini con valores por defecto seguros
 */
export function initializeGeminiConfig(): void {
  const config = {
    gemini_model: DEFAULT_MODEL,
    gemini_temperature: '0.7',
    gemini_max_tokens: '1000'
  };
  
  Object.entries(config).forEach(([key, value]) => {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, value);
    }
  });
  
  // Limpiar configuraciones incorrectas existentes
  cleanIncorrectGeminiConfig();
}

/**
 * Verifica si la configuración actual de Gemini es válida
 * @returns true si la configuración es válida
 */
export function isGeminiConfigValid(): boolean {
  const model = localStorage.getItem('gemini_model');
  return model ? VALID_GEMINI_MODELS.includes(model) : false;
}

// Auto-ejecutar limpieza al importar el módulo
if (typeof window !== 'undefined') {
  // Solo ejecutar en el navegador
  setTimeout(() => {
    cleanIncorrectGeminiConfig();
  }, 100);
}