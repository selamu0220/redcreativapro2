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
 * Modern Settings Panel Component
 * 
 * Professional configuration panel with:
 * - AI Provider selection
 * - Model configuration
 * - Temperature control
 * - Personal API key management
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

  const handleProviderChange = (provider: 'openai' | 'anthropic' | 'google' | 'openrouter' | 'huggingface' | 'replicate') => {
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

    const getProviderApiKeyUrl = (provider: string) => {
      switch (provider) {
        case 'openrouter': return 'https://openrouter.ai/keys';
        case 'google': return 'https://aistudio.google.com/app/apikey';
        case 'openai': return 'https://platform.openai.com/api-keys';
        case 'anthropic': return 'https://console.anthropic.com/settings/keys';
        case 'huggingface': return 'https://huggingface.co/settings/tokens';
        case 'replicate': return 'https://replicate.com/account/api-tokens';
        default: return null;
      }
    };

    const providerUrl = getProviderApiKeyUrl(settings.provider);

    return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-background shadow-2xl z-50 overflow-y-auto border-l">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  Configuración de IA
                </h2>
                <p className="text-sm text-muted-foreground">
                  Personaliza tu experiencia
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted rounded-lg"
              aria-label="Cerrar panel de configuración"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Provider Selection */}
            <div className="space-y-3">
              <label htmlFor="provider-select" className="block text-sm font-semibold text-foreground">
                Proveedor de IA
              </label>
                <select
                  id="provider-select"
                  value={settings.provider}
                  onChange={(e) => handleProviderChange(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="openrouter">OpenRouter (Multi-modelo)</option>
                  <option value="google">Google AI (Gemini)</option>
                  <option value="huggingface">Hugging Face (Open Source)</option>
                  <option value="replicate">Replicate (Varios Modelos)</option>
                  <option value="openai">OpenAI (GPT)</option>
                  <option value="anthropic" disabled>Anthropic (Claude) - Próximamente</option>
                </select>
              <p className="text-xs text-muted-foreground">
                Selecciona el proveedor de inteligencia artificial
              </p>
            </div>

            {/* Model Selection */}
            <div className="space-y-3">
              <label htmlFor="model-select" className="block text-sm font-semibold text-foreground">
                Modelo
              </label>
              <select
                id="model-select"
                value={settings.model}
                onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                className="w-full px-4 py-2.5 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                {availableModels.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Cada modelo tiene diferentes capacidades y costos
              </p>
            </div>

            {/* Temperature Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="temperature-slider" className="block text-sm font-semibold text-foreground">
                  Nivel de Creatividad
                </label>
                <span className="text-sm font-mono text-primary bg-primary/10 px-2 py-1 rounded">
                  {settings.temperature.toFixed(1)}
                </span>
              </div>
              <input
                id="temperature-slider"
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.temperature}
                onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                aria-label="Control de creatividad"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Preciso
                </span>
                <span className="flex items-center gap-1">
                  Creativo
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t"></div>

            {/* Personal API Key */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-foreground">
                  API Key Personal
                </label>
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={settings.usePersonalKey}
                    onChange={(e) => setSettings({ ...settings, usePersonalKey: e.target.checked })}
                    className="mr-2 w-4 h-4 accent-primary"
                  />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    Usar mi propia key
                  </span>
                </label>
              </div>
              
              {settings.usePersonalKey && (
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={settings.apiKey || ""}
                      onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                      placeholder="sk-..."
                      className="w-full px-4 py-2.5 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent pr-10 font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showApiKey ? "Ocultar API key" : "Mostrar API key"}
                    >
                      {showApiKey ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      )}
                    </button>
                  </div>
                    <p className="text-xs text-muted-foreground flex items-center justify-between gap-1">
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Tu API key se guarda solo en tu navegador
                      </span>
                      {providerUrl && (
                        <a 
                          href={providerUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1 font-medium"
                        >
                          Obtener Key
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </p>
                </div>
              )}
            </div>

            {/* Warning */}
            {!settings.apiKey && settings.usePersonalKey && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-sm text-destructive">
                    Necesitas configurar una API key para usar el servicio
                  </p>
                </div>
              </div>
            )}

            {/* Info Card */}
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <h3 className="font-semibold text-foreground mb-3 text-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Información de Seguridad
              </h3>
              <ul className="text-xs text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <svg className="w-3 h-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  La configuración se guarda localmente en tu navegador
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-3 h-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Tu API key nunca se envía a nuestros servidores
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-3 h-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Puedes usar tu propia API key de OpenAI
                </li>
              </ul>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t bg-muted/50 flex gap-3">
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-background border hover:bg-muted rounded-lg transition-colors"
            >
              Restablecer
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 px-6 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isSaving ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                      fill="none"
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Guardando...
                </span>
              ) : (
                "Guardar Configuración"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
