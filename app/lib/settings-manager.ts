/**
 * Settings Manager Module - localStorage Operations
 * 
 * Handles saving and loading AI Writer settings from localStorage.
 * Settings are the ONLY persistent data in the AI Writer.
 * 
 * Design principles:
 * - Single localStorage key for all settings
 * - Simple JSON serialization
 * - Validation on load
 * - Default values for missing settings
 */

export interface AISettings {
  provider: 'openai' | 'anthropic' | 'google';
  model: string;
  temperature: number;
  apiKey?: string;
  usePersonalKey: boolean;
  lastUpdated: string; // ISO timestamp
}

const STORAGE_KEY = 'ai-writer-settings';

const DEFAULT_SETTINGS: AISettings = {
  provider: 'openai',
  model: 'gpt-4o-mini',
  temperature: 0.7,
  usePersonalKey: false,
  lastUpdated: new Date().toISOString()
};

/**
 * Save settings to localStorage
 * 
 * @param settings - Settings to save
 */
export function saveSettings(settings: AISettings): void {
  try {
    const settingsToSave = {
      ...settings,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settingsToSave));
  } catch (error) {
    console.error('Failed to save settings:', error);
    throw new Error('No se pudieron guardar las configuraciones.');
  }
}

/**
 * Load settings from localStorage
 * 
 * @returns Settings object or null if not found/invalid
 */
export function loadSettings(): AISettings | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored);
    
    // Validate settings
    if (!isValidSettings(parsed)) {
      console.warn('Invalid settings found, clearing...');
      clearSettings();
      return null;
    }

    return parsed as AISettings;
  } catch (error) {
    console.error('Failed to load settings:', error);
    // Clear corrupted data
    clearSettings();
    return null;
  }
}

/**
 * Get settings with defaults
 * 
 * @returns Settings object (loaded or default)
 */
export function getSettings(): AISettings {
  const loaded = loadSettings();
  return loaded || DEFAULT_SETTINGS;
}

/**
 * Clear all settings from localStorage
 */
export function clearSettings(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear settings:', error);
  }
}

/**
 * Check if user has a personal API key configured
 * 
 * @returns true if personal API key is set
 */
export function hasPersonalApiKey(): boolean {
  const settings = loadSettings();
  return !!(settings?.usePersonalKey && settings?.apiKey);
}

/**
 * Update specific setting fields
 * 
 * @param updates - Partial settings to update
 */
export function updateSettings(updates: Partial<AISettings>): void {
  const current = getSettings();
  const updated = {
    ...current,
    ...updates,
    lastUpdated: new Date().toISOString()
  };
  
  // Validate before saving
  if (!isValidSettings(updated)) {
    throw new Error('Configuración inválida.');
  }
  
  saveSettings(updated);
}

/**
 * Validate settings object
 * 
 * @param settings - Settings to validate
 * @returns true if valid
 */
function isValidSettings(settings: any): boolean {
  if (!settings || typeof settings !== 'object') {
    return false;
  }

  // Check required fields
  if (!settings.provider || !settings.model) {
    return false;
  }

  // Validate provider
  if (!['openai', 'anthropic', 'google'].includes(settings.provider)) {
    return false;
  }

  // Validate temperature
  if (typeof settings.temperature !== 'number' || 
      settings.temperature < 0 || 
      settings.temperature > 1) {
    return false;
  }

  // Validate usePersonalKey
  if (typeof settings.usePersonalKey !== 'boolean') {
    return false;
  }

  return true;
}

/**
 * Get default model for a provider
 * 
 * @param provider - AI provider
 * @returns Default model name
 */
export function getDefaultModel(provider: 'openai' | 'anthropic' | 'google'): string {
  switch (provider) {
    case 'openai':
      return 'gpt-4o-mini';
    case 'anthropic':
      return 'claude-3-haiku-20240307';
    case 'google':
      return 'gemini-pro';
    default:
      return 'gpt-4o-mini';
  }
}

/**
 * Get available models for a provider
 * 
 * @param provider - AI provider
 * @returns Array of model names
 */
export function getAvailableModels(provider: 'openai' | 'anthropic' | 'google'): string[] {
  switch (provider) {
    case 'openai':
      return [
        'gpt-4o',
        'gpt-4o-mini',
        'gpt-4-turbo',
        'gpt-4',
        'gpt-3.5-turbo'
      ];
    case 'anthropic':
      return [
        'claude-3-opus-20240229',
        'claude-3-sonnet-20240229',
        'claude-3-haiku-20240307'
      ];
    case 'google':
      return [
        'gemini-pro',
        'gemini-pro-vision'
      ];
    default:
      return [];
  }
}
