"use client";

import { useState, useEffect } from "react";
import { 
  getSettings, 
  saveSettings, 
  clearSettings,
  getAvailableModels,
  getDefaultModel,
  type AISettings 
} from "../../lib/settings-manager";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange?: (settings: AISettings) => void;
}

/**
 * Settings Panel Component
 * 
 * Allows users to configure:
 * - AI Provider (OpenAI, Anthropic, Google)
 * - Model selection
 * - Temperature (creativity)
 * - Personal API key
 */
export default function SettingsPanel({ 
  isOpen, 
  onClose,
  onSettingsChange 
}: SettingsPanelProps) {
  const [settings, setSettings] = useState<AISettings>(getSettings());
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load settings when panel opens
  useEffect(() => {
    if (isOpen) {
      setSettings(getSettings());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleProviderChange = (provider: 'openai' | 'anthropic' | 'google') => {
    const newSettings = {
      ...settings,
      provider,
      model: getDefaultModel(provider)
    };
    setSettings(newSettings);
  };

  const handleSave = () => {
    setIsSaving(true);
    try {
      saveSettings(settings);
      onSettingsChange?.(settings);
      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 500);
    } catch (error) {
      console.error("Failed to save settings:", error);
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    if (confirm("¿Estás seguro de que quieres borrar todas las configuraciones?")) {
      clearSettings();
      const defaultSettings = getSettings();
      setSettings(defaultSettings);
      onSettingsChange?.(defaultSettings);
    }
  };

  const availableModels = getAvailableModels(settings.provider);

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl z-50 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Configuración
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Cerrar panel de configuración"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Provider Selection */}
          <div>
            <label htmlFor="provider-select" className="block text-sm font-medium text-gray-700 mb-2">
              Proveedor de IA
            </label>
            <select
              id="provider-select"
              value={settings.provider}
              onChange={(e) => handleProviderChange(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="openai">OpenAI (GPT)</option>
              <option value="anthropic" disabled>Anthropic (Claude) - Próximamente</option>
              <option value="google" disabled>Google (Gemini) - Próximamente</option>
            </select>
          </div>

          {/* Model Selection */}
          <div>
            <label htmlFor="model-select" className="block text-sm font-medium text-gray-700 mb-2">
              Modelo
            </label>
            <select
              id="model-select"
              value={settings.model}
              onChange={(e) => setSettings({ ...settings, model: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {availableModels.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>

          {/* Temperature Slider */}
          <div>
            <label htmlFor="temperature-slider" className="block text-sm font-medium text-gray-700 mb-2">
              Creatividad: {settings.temperature.toFixed(1)}
            </label>
            <input
              id="temperature-slider"
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.temperature}
              onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
              className="w-full"
              aria-label="Control de creatividad"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Preciso (0.0)</span>
              <span>Creativo (1.0)</span>
            </div>
          </div>

          {/* Personal API Key */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                API Key Personal
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.usePersonalKey}
                  onChange={(e) => setSettings({ ...settings, usePersonalKey: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">Usar mi propia key</span>
              </label>
            </div>
            
            {settings.usePersonalKey && (
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={settings.apiKey || ""}
                  onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                  placeholder="sk-..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showApiKey ? "Ocultar API key" : "Mostrar API key"}
                >
                  {showApiKey ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            )}
            
            <p className="text-xs text-gray-500 mt-1">
              Tu API key se guarda solo en tu navegador
            </p>
          </div>

          {/* Warning */}
          {!settings.apiKey && settings.usePersonalKey && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                ⚠️ Necesitas configurar una API key para usar el servicio
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSaving ? "Guardando..." : "Guardar"}
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Limpiar
            </button>
          </div>

          {/* Info */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2 text-sm">
              ℹ️ Acerca de la configuración
            </h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• La configuración se guarda en tu navegador</li>
              <li>• Tu API key nunca se envía a nuestros servidores</li>
              <li>• Puedes usar tu propia API key de OpenAI</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
