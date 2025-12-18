"use client";

import { useState, useEffect, useCallback } from 'react';
import { AISettingsManager, AISettings } from '../lib/ai-settings-manager';

export interface UseAISettingsReturn {
  // Settings state
  settings: AISettings;
  isLoading: boolean;
  isValid: boolean;
  
  // Individual setting getters for backward compatibility
  aiModel: string;
  aiTone: AISettings['aiTone'];
  aiStyle: AISettings['aiStyle'];
  aiCreativity: number;
  customPrompt: string;
  savedPrompts: string[];
  autoImprove: boolean;
  enhancedAutoImprove: boolean;
  autoImproveDelay: number;
  minWordsForAutoImprove: number;
  changeIntensity: number;
  textExpansion: number;
  preserveCursor: boolean;
  changeAllText: boolean;
  maxVersions: number;
  autoVersioning: boolean;
  agentMode: boolean;
  agentPersonality: string;
  agentIndustry: string;
  
  // Setting updaters
  updateSettings: (newSettings: Partial<AISettings>) => void;
  updateSetting: <K extends keyof AISettings>(key: K, value: AISettings[K]) => void;
  
  // Bulk operations
  saveSettings: () => boolean;
  loadSettings: () => void;
  resetSettings: () => void;
  
  // Validation
  validateSettings: () => void;
  
  // Backup/restore
  createBackup: () => boolean;
  restoreFromBackup: () => boolean;
}

export function useAISettings(): UseAISettingsReturn {
  const [settings, setSettings] = useState<AISettings>(() => {
    // Initialize with defaults, will be loaded in useEffect
    return AISettingsManager.resetToDefaults();
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(true);

  // Load settings on mount
  useEffect(() => {
    const loadInitialSettings = () => {
      try {
        const loadedSettings = AISettingsManager.loadSettings();
        setSettings(loadedSettings);
        
        // Validate loaded settings
        const validation = AISettingsManager.validateSettings(loadedSettings);
        setIsValid(validation.isValid);
        
        if (!validation.isValid && validation.fixedSettings) {
          // Auto-fix invalid settings
          const fixedSettings = { ...loadedSettings, ...validation.fixedSettings };
          setSettings(fixedSettings);
          AISettingsManager.saveSettings(fixedSettings);
          setIsValid(true);
        }
      } catch (error) {
        console.error('Error loading AI settings:', error);
        // Fall back to defaults on error
        const defaultSettings = AISettingsManager.resetToDefaults();
        setSettings(defaultSettings);
        setIsValid(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialSettings();
  }, []);

  // Auto-save settings when they change (debounced)
  useEffect(() => {
    if (isLoading) return; // Don't save during initial load
    
    const timeoutId = setTimeout(() => {
      AISettingsManager.saveSettings(settings);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [settings, isLoading]);

  // Update settings (partial update)
  const updateSettings = useCallback((newSettings: Partial<AISettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      
      // Validate the updated settings
      const validation = AISettingsManager.validateSettings(updated);
      setIsValid(validation.isValid);
      
      // Apply fixes if available
      if (!validation.isValid && validation.fixedSettings) {
        return { ...updated, ...validation.fixedSettings };
      }
      
      return updated;
    });
  }, []);

  // Update single setting
  const updateSetting = useCallback(<K extends keyof AISettings>(key: K, value: AISettings[K]) => {
    updateSettings({ [key]: value });
  }, [updateSettings]);

  // Manual save
  const saveSettings = useCallback(() => {
    return AISettingsManager.saveSettings(settings);
  }, [settings]);

  // Reload settings from storage
  const loadSettings = useCallback(() => {
    setIsLoading(true);
    try {
      const loadedSettings = AISettingsManager.loadSettings();
      setSettings(loadedSettings);
      
      const validation = AISettingsManager.validateSettings(loadedSettings);
      setIsValid(validation.isValid);
    } catch (error) {
      console.error('Error reloading settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reset to defaults
  const resetSettings = useCallback(() => {
    const defaultSettings = AISettingsManager.resetToDefaults();
    setSettings(defaultSettings);
    setIsValid(true);
  }, []);

  // Manual validation
  const validateSettings = useCallback(() => {
    const validation = AISettingsManager.validateSettings(settings);
    setIsValid(validation.isValid);
    
    if (!validation.isValid && validation.fixedSettings) {
      updateSettings(validation.fixedSettings);
    }
  }, [settings, updateSettings]);

  // Create backup
  const createBackup = useCallback(() => {
    return AISettingsManager.createBackup();
  }, []);

  // Restore from backup
  const restoreFromBackup = useCallback(() => {
    const result = AISettingsManager.restoreFromBackup();
    
    if (result.success && result.settings) {
      setSettings(result.settings);
      setIsValid(true);
      return true;
    }
    
    return false;
  }, []);

  return {
    // Settings state
    settings,
    isLoading,
    isValid,
    
    // Individual setting getters for backward compatibility
    aiModel: settings.aiModel,
    aiTone: settings.aiTone,
    aiStyle: settings.aiStyle,
    aiCreativity: settings.aiCreativity,
    customPrompt: settings.customPrompt,
    savedPrompts: settings.savedPrompts,
    autoImprove: settings.autoImprove,
    enhancedAutoImprove: settings.enhancedAutoImprove,
    autoImproveDelay: settings.autoImproveDelay,
    minWordsForAutoImprove: settings.minWordsForAutoImprove,
    changeIntensity: settings.changeIntensity,
    textExpansion: settings.textExpansion,
    preserveCursor: settings.preserveCursor,
    changeAllText: settings.changeAllText,
    maxVersions: settings.maxVersions,
    autoVersioning: settings.autoVersioning,
    agentMode: settings.agentMode,
    agentPersonality: settings.agentPersonality,
    agentIndustry: settings.agentIndustry,
    
    // Setting updaters
    updateSettings,
    updateSetting,
    
    // Bulk operations
    saveSettings,
    loadSettings,
    resetSettings,
    
    // Validation
    validateSettings,
    
    // Backup/restore
    createBackup,
    restoreFromBackup
  };
}