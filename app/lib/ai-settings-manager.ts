/**
 * AI Settings Management Service
 * Handles persistence, validation, conflict resolution, and backup/restore of AI configuration
 */

export interface AISettings {
  // Model configuration
  aiModel: string;

  // Content generation settings
  aiTone: 'profesional' | 'casual' | 'formal' | 'amigable' | 'persuasivo';
  aiStyle: 'claro' | 'detallado' | 'conciso' | 'creativo' | 'técnico';
  aiCreativity: number; // 0-100

  // Prompt configuration
  customPrompt: string;
  savedPrompts: string[];

  // Auto-improvement settings
  autoImprove: boolean;
  enhancedAutoImprove: boolean;
  autoImproveDelay: number;
  minWordsForAutoImprove: number;

  // Content modification settings
  changeIntensity: number; // 0-100
  textExpansion: number; // 0-100
  preserveCursor: boolean;
  changeAllText: boolean;

  // Version control settings
  maxVersions: number;
  autoVersioning: boolean;

  // Agent mode settings
  agentMode: boolean;
  agentPersonality: string;
  agentIndustry: string;

  // Metadata
  lastModified: string;
  version: number;
}

export interface SettingsValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fixedSettings?: Partial<AISettings>;
}

export interface SettingsConflict {
  field: keyof AISettings;
  localValue: any;
  incomingValue: any;
  resolution: 'keep_local' | 'use_incoming' | 'merge' | 'manual';
}

export class AISettingsManager {
  private static readonly STORAGE_KEY = 'escritor_ia_settings';
  private static readonly BACKUP_KEY = 'escritor_ia_settings_backup';
  private static readonly EXPORT_VERSION = '1.0';

  private static readonly DEFAULT_SETTINGS: AISettings = {
    aiModel: 'minimax/abab-6.5-chat',
    aiTone: 'profesional',
    aiStyle: 'claro',
    aiCreativity: 50,
    customPrompt: '',
    savedPrompts: [],
    autoImprove: false,
    enhancedAutoImprove: false,
    autoImproveDelay: 500,
    minWordsForAutoImprove: 5,
    changeIntensity: 20,
    textExpansion: 10,
    preserveCursor: true,
    changeAllText: true,
    maxVersions: 10,
    autoVersioning: false,
    agentMode: false,
    agentPersonality: 'profesional',
    agentIndustry: 'general',
    lastModified: new Date().toISOString(),
    version: 1
  };

  /**
   * Load settings from localStorage with validation and error recovery
   */
  static loadSettings(): AISettings {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        console.warn('localStorage not available, using default settings');
        return { ...this.DEFAULT_SETTINGS };
      }

      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        console.log('No stored settings found, using defaults');
        return { ...this.DEFAULT_SETTINGS };
      }

      const parsed = JSON.parse(stored);
      const validation = this.validateSettings(parsed);

      if (!validation.isValid) {
        console.warn('Invalid settings detected, attempting recovery:', validation.errors);

        // Try to recover with fixed settings
        if (validation.fixedSettings) {
          const recoveredSettings = { ...this.DEFAULT_SETTINGS, ...validation.fixedSettings };
          this.saveSettings(recoveredSettings);
          return recoveredSettings;
        }

        // Fall back to defaults if recovery fails
        console.error('Settings recovery failed, using defaults');
        return { ...this.DEFAULT_SETTINGS };
      }

      // Merge with defaults to ensure all fields are present
      const mergedSettings = { ...this.DEFAULT_SETTINGS, ...parsed };
      mergedSettings.version = this.DEFAULT_SETTINGS.version;

      return mergedSettings;
    } catch (error) {
      console.error('Error loading AI settings:', error);
      return { ...this.DEFAULT_SETTINGS };
    }
  }

  /**
   * Save settings to localStorage with backup
   */
  static saveSettings(settings: AISettings): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        console.warn('localStorage not available, cannot save settings');
        return false;
      }

      // Create backup of current settings before saving new ones
      const currentSettings = localStorage.getItem(this.STORAGE_KEY);
      if (currentSettings) {
        localStorage.setItem(this.BACKUP_KEY, currentSettings);
      }

      // Update metadata
      const settingsToSave = {
        ...settings,
        lastModified: new Date().toISOString(),
        version: this.DEFAULT_SETTINGS.version
      };

      // Validate before saving
      const validation = this.validateSettings(settingsToSave);
      if (!validation.isValid) {
        console.error('Cannot save invalid settings:', validation.errors);
        return false;
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settingsToSave));
      console.log('AI settings saved successfully');
      return true;
    } catch (error) {
      console.error('Error saving AI settings:', error);
      return false;
    }
  }

  /**
   * Validate settings and provide fixes for common issues
   */
  static validateSettings(settings: any): SettingsValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const fixedSettings: Partial<AISettings> = {};

    if (!settings || typeof settings !== 'object') {
      errors.push('Settings must be an object');
      return { isValid: false, errors, warnings };
    }

    // Validate aiModel
    if (settings.aiModel && typeof settings.aiModel !== 'string') {
      errors.push('aiModel must be a string');
      fixedSettings.aiModel = this.DEFAULT_SETTINGS.aiModel;
    }

    // Validate aiTone
    const validTones = ['profesional', 'casual', 'formal', 'amigable', 'persuasivo'];
    if (settings.aiTone && !validTones.includes(settings.aiTone)) {
      warnings.push(`Invalid aiTone: ${settings.aiTone}, using default`);
      fixedSettings.aiTone = this.DEFAULT_SETTINGS.aiTone;
    }

    // Validate aiStyle
    const validStyles = ['claro', 'detallado', 'conciso', 'creativo', 'técnico'];
    if (settings.aiStyle && !validStyles.includes(settings.aiStyle)) {
      warnings.push(`Invalid aiStyle: ${settings.aiStyle}, using default`);
      fixedSettings.aiStyle = this.DEFAULT_SETTINGS.aiStyle;
    }

    // Validate numeric ranges
    const numericFields = [
      { field: 'aiCreativity', min: 0, max: 100 },
      { field: 'autoImproveDelay', min: 100, max: 5000 },
      { field: 'minWordsForAutoImprove', min: 1, max: 50 },
      { field: 'changeIntensity', min: 0, max: 100 },
      { field: 'textExpansion', min: 0, max: 100 },
      { field: 'maxVersions', min: 1, max: 50 }
    ];

    numericFields.forEach(({ field, min, max }) => {
      const value = settings[field];
      if (value !== undefined) {
        if (typeof value !== 'number' || isNaN(value)) {
          warnings.push(`${field} must be a number, using default`);
          (fixedSettings as any)[field] = (this.DEFAULT_SETTINGS as any)[field];
        } else if (value < min || value > max) {
          warnings.push(`${field} must be between ${min} and ${max}, clamping value`);
          (fixedSettings as any)[field] = Math.max(min, Math.min(max, value));
        }
      }
    });

    // Validate arrays
    if (settings.savedPrompts && !Array.isArray(settings.savedPrompts)) {
      warnings.push('savedPrompts must be an array, using default');
      fixedSettings.savedPrompts = this.DEFAULT_SETTINGS.savedPrompts;
    }

    // Validate strings
    const stringFields = ['customPrompt', 'agentPersonality', 'agentIndustry'];
    stringFields.forEach(field => {
      if (settings[field] !== undefined && typeof settings[field] !== 'string') {
        warnings.push(`${field} must be a string, using default`);
        (fixedSettings as any)[field] = (this.DEFAULT_SETTINGS as any)[field];
      }
    });

    // Validate booleans
    const booleanFields = ['autoImprove', 'enhancedAutoImprove', 'preserveCursor', 'changeAllText', 'autoVersioning', 'agentMode'];
    booleanFields.forEach(field => {
      if (settings[field] !== undefined && typeof settings[field] !== 'boolean') {
        warnings.push(`${field} must be a boolean, using default`);
        (fixedSettings as any)[field] = (this.DEFAULT_SETTINGS as any)[field];
      }
    });

    const isValid = errors.length === 0;
    return {
      isValid,
      errors,
      warnings,
      fixedSettings: Object.keys(fixedSettings).length > 0 ? fixedSettings : undefined
    };
  }

  /**
   * Detect and resolve conflicts between local and incoming settings
   */
  static detectConflicts(localSettings: AISettings, incomingSettings: AISettings): SettingsConflict[] {
    const conflicts: SettingsConflict[] = [];

    // Check if settings are from different versions or timestamps
    const localTime = new Date(localSettings.lastModified).getTime();
    const incomingTime = new Date(incomingSettings.lastModified).getTime();

    Object.keys(this.DEFAULT_SETTINGS).forEach(key => {
      const field = key as keyof AISettings;

      // Skip metadata fields
      if (field === 'lastModified' || field === 'version') return;

      const localValue = localSettings[field];
      const incomingValue = incomingSettings[field];

      if (JSON.stringify(localValue) !== JSON.stringify(incomingValue)) {
        let resolution: SettingsConflict['resolution'] = 'manual';

        // Auto-resolve based on timestamps for some fields
        if (incomingTime > localTime) {
          resolution = 'use_incoming';
        } else if (localTime > incomingTime) {
          resolution = 'keep_local';
        }

        // Special handling for arrays (merge)
        if (Array.isArray(localValue) && Array.isArray(incomingValue)) {
          resolution = 'merge';
        }

        conflicts.push({
          field,
          localValue,
          incomingValue,
          resolution
        });
      }
    });

    return conflicts;
  }

  /**
   * Resolve conflicts and merge settings
   */
  static resolveConflicts(
    localSettings: AISettings,
    incomingSettings: AISettings,
    resolutions: Record<keyof AISettings, 'keep_local' | 'use_incoming' | 'merge'>
  ): AISettings {
    const resolvedSettings = { ...localSettings };

    Object.entries(resolutions).forEach(([field, resolution]) => {
      const key = field as keyof AISettings;

      switch (resolution) {
        case 'use_incoming':
          (resolvedSettings as any)[key] = (incomingSettings as any)[key];
          break;
        case 'merge':
          if (Array.isArray(localSettings[key]) && Array.isArray(incomingSettings[key])) {
            // Merge arrays, removing duplicates
            const merged = [...new Set([...localSettings[key] as any[], ...incomingSettings[key] as any[]])];
            (resolvedSettings as any)[key] = merged;
          }
          break;
        case 'keep_local':
        default:
          // Keep local value (no change needed)
          break;
      }
    });

    return resolvedSettings;
  }

  /**
   * Export settings to JSON file
   */
  static exportSettings(settings: AISettings): string {
    const exportData = {
      version: this.EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      settings: settings
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import settings from JSON string
   */
  static importSettings(jsonString: string): { success: boolean; settings?: AISettings; error?: string } {
    try {
      const importData = JSON.parse(jsonString);

      if (!importData.settings) {
        return { success: false, error: 'Invalid export format: missing settings' };
      }

      const validation = this.validateSettings(importData.settings);
      if (!validation.isValid) {
        return { success: false, error: `Invalid settings: ${validation.errors.join(', ')}` };
      }

      const settings = validation.fixedSettings
        ? { ...this.DEFAULT_SETTINGS, ...importData.settings, ...validation.fixedSettings }
        : { ...this.DEFAULT_SETTINGS, ...importData.settings };

      return { success: true, settings };
    } catch (error) {
      return { success: false, error: `Failed to parse JSON: ${error}` };
    }
  }

  /**
   * Create backup of current settings
   */
  static createBackup(): boolean {
    try {
      const currentSettings = this.loadSettings();
      const backupData = {
        createdAt: new Date().toISOString(),
        settings: currentSettings
      };

      localStorage.setItem(this.BACKUP_KEY, JSON.stringify(backupData));
      return true;
    } catch (error) {
      console.error('Failed to create backup:', error);
      return false;
    }
  }

  /**
   * Restore settings from backup
   */
  static restoreFromBackup(): { success: boolean; settings?: AISettings; error?: string } {
    try {
      const backupData = localStorage.getItem(this.BACKUP_KEY);
      if (!backupData) {
        return { success: false, error: 'No backup found' };
      }

      const parsed = JSON.parse(backupData);
      if (!parsed.settings) {
        return { success: false, error: 'Invalid backup format' };
      }

      const validation = this.validateSettings(parsed.settings);
      if (!validation.isValid) {
        return { success: false, error: `Invalid backup settings: ${validation.errors.join(', ')}` };
      }

      const settings = validation.fixedSettings
        ? { ...this.DEFAULT_SETTINGS, ...parsed.settings, ...validation.fixedSettings }
        : { ...this.DEFAULT_SETTINGS, ...parsed.settings };

      return { success: true, settings };
    } catch (error) {
      return { success: false, error: `Failed to restore backup: ${error}` };
    }
  }

  /**
   * Reset settings to defaults
   */
  static resetToDefaults(): AISettings {
    const defaultSettings = { ...this.DEFAULT_SETTINGS };
    this.saveSettings(defaultSettings);
    return defaultSettings;
  }

  /**
   * Get settings summary for display
   */
  static getSettingsSummary(settings: AISettings): Record<string, string> {
    return {
      'Modelo de IA': settings.aiModel,
      'Tono': settings.aiTone,
      'Estilo': settings.aiStyle,
      'Creatividad': `${settings.aiCreativity}%`,
      'Mejora automática': settings.autoImprove ? 'Activada' : 'Desactivada',
      'Mejora automática enhanced': settings.enhancedAutoImprove ? 'Activada' : 'Desactivada',
      'Prompts guardados': settings.savedPrompts.length.toString(),
      'Última modificación': new Date(settings.lastModified).toLocaleString()
    };
  }
}
