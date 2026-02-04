"use client";

import { useState, useEffect } from 'react';
import { Settings, Sliders, Brain, Zap, Save, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';
import { useAISettings } from '../hooks/useAISettings';
import AISettingsValidator from './AISettingsValidator';

interface AIConfigurationPanelProps {
  className?: string;
  onSettingsChange?: (settings: any) => void;
}

export default function AIConfigurationPanel({ 
  className = '', 
  onSettingsChange 
}: AIConfigurationPanelProps) {
  const {
    settings,
    isLoading,
    isValid,
    updateSetting,
    updateSettings,
    saveSettings,
    resetSettings,
    validateSettings
  } = useAISettings();

  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'validation'>('basic');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Track changes to show unsaved indicator
  useEffect(() => {
    setHasUnsavedChanges(true);
    setSaveStatus('idle');
  }, [settings]);

  // Notify parent of settings changes
  useEffect(() => {
    if (onSettingsChange) {
      onSettingsChange(settings);
    }
  }, [settings, onSettingsChange]);

  const handleSaveSettings = async () => {
    setSaveStatus('saving');
    try {
      const success = saveSettings();
      if (success) {
        setSaveStatus('saved');
        setHasUnsavedChanges(false);
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
    }
  };

  const handleResetSettings = () => {
    if (confirm('¿Estás seguro de que quieres restablecer toda la configuración a los valores por defecto?')) {
      resetSettings();
      setHasUnsavedChanges(false);
      setSaveStatus('idle');
    }
  };

  const getSaveButtonContent = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Guardando...</span>
          </>
        );
      case 'saved':
        return (
          <>
            <CheckCircle className="w-4 h-4" />
            <span>Guardado</span>
          </>
        );
      case 'error':
        return (
          <>
            <AlertCircle className="w-4 h-4" />
            <span>Error</span>
          </>
        );
      default:
        return (
          <>
            <Save className="w-4 h-4" />
            <span>Guardar</span>
          </>
        );
    }
  };

  if (isLoading) {
    return (
      <div className={`p-6 bg-white rounded-lg border ${className}`}>
        <div className="flex items-center justify-center space-x-2">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600">Cargando configuración...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border ${className}`}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Configuración de IA
            </h3>
            {!isValid && (
              <AlertCircle className="w-4 h-4 text-red-500" aria-label="Configuración inválida" />
            )}
            {hasUnsavedChanges && (
              <div className="w-2 h-2 bg-orange-500 rounded-full" aria-label="Cambios sin guardar" />
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleResetSettings}
              className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              aria-label="Restablecer configuración a valores por defecto"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restablecer</span>
            </button>
            
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={saveStatus === 'saving'}
              className={`flex items-center space-x-1 px-3 py-1 text-sm rounded transition-colors ${
                saveStatus === 'saved' 
                  ? 'bg-green-600 text-white' 
                  : saveStatus === 'error'
                  ? 'bg-red-600 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              } ${saveStatus === 'saving' ? 'opacity-75 cursor-not-allowed' : ''}`}
              aria-label="Guardar configuración actual"
            >
              {getSaveButtonContent()}
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex space-x-1 mt-4" role="tablist">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              activeTab === 'basic' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
            role="tab"
            aria-selected={activeTab === 'basic' ? 'true' : 'false'}
            aria-controls="basic-panel"
          >
            Básico
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('advanced')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              activeTab === 'advanced' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
            role="tab"
            aria-selected={activeTab === 'advanced' ? 'true' : 'false'}
            aria-controls="advanced-panel"
          >
            Avanzado
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('validation')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              activeTab === 'validation' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
            role="tab"
            aria-selected={activeTab === 'validation' ? 'true' : 'false'}
            aria-controls="validation-panel"
          >
            Validación y Respaldo
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'basic' && (
          <div className="space-y-6">
            {/* AI Model Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Brain className="w-4 h-4 inline mr-1" />
                Modelo de IA
              </label>
              <select
                value={settings.aiModel}
                onChange={(e) => updateSetting('aiModel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Seleccionar modelo de IA"
              >
                <option value="openai/gpt-4o">GPT-4o (Recomendado)</option>
                <option value="openai/gpt-4o-mini">GPT-4o Mini (Rápido)</option>
                <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                <option value="anthropic/claude-3-haiku">Claude 3 Haiku</option>
                <option value="google/gemini-pro-1.5">Gemini Pro 1.5</option>
                <option value="meta-llama/llama-3.1-70b-instruct">Llama 3.1 70B</option>
              </select>
            </div>

            {/* Tone Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tono de escritura
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'profesional', label: 'Profesional' },
                  { value: 'casual', label: 'Casual' },
                  { value: 'formal', label: 'Formal' },
                  { value: 'amigable', label: 'Amigable' },
                  { value: 'persuasivo', label: 'Persuasivo' }
                ].map((tone) => (
                  <button
                    key={tone.value}
                    type="button"
                    onClick={() => updateSetting('aiTone', tone.value as any)}
                    className={`p-2 text-sm border rounded transition-colors ${
                      settings.aiTone === tone.value
                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    aria-pressed={settings.aiTone === tone.value ? 'true' : 'false'}
                    aria-label={`Seleccionar tono ${tone.label}`}
                  >
                    {tone.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Style Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estilo de escritura
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'claro', label: 'Claro' },
                  { value: 'detallado', label: 'Detallado' },
                  { value: 'conciso', label: 'Conciso' },
                  { value: 'creativo', label: 'Creativo' },
                  { value: 'técnico', label: 'Técnico' }
                ].map((style) => (
                  <button
                    key={style.value}
                    type="button"
                    onClick={() => updateSetting('aiStyle', style.value as any)}
                    className={`p-2 text-sm border rounded transition-colors ${
                      settings.aiStyle === style.value
                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    aria-pressed={settings.aiStyle === style.value ? 'true' : 'false'}
                    aria-label={`Seleccionar estilo ${style.label}`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Creativity Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Sliders className="w-4 h-4 inline mr-1" />
                Creatividad: {settings.aiCreativity}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.aiCreativity}
                onChange={(e) => updateSetting('aiCreativity', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                aria-label={`Creatividad: ${settings.aiCreativity}%`}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Conservador</span>
                <span>Creativo</span>
              </div>
            </div>

            {/* Custom Prompt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prompt personalizado
              </label>
              <textarea
                value={settings.customPrompt}
                onChange={(e) => updateSetting('customPrompt', e.target.value)}
                placeholder="Instrucciones adicionales para la IA..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="space-y-6">
            {/* Auto-improvement Settings */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900 flex items-center">
                <Zap className="w-4 h-4 mr-1" />
                Mejora automática
              </h4>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="autoImprove"
                  checked={settings.autoImprove}
                  onChange={(e) => updateSetting('autoImprove', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="autoImprove" className="text-sm text-gray-700">
                  Activar mejora automática
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="enhancedAutoImprove"
                  checked={settings.enhancedAutoImprove}
                  onChange={(e) => updateSetting('enhancedAutoImprove', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="enhancedAutoImprove" className="text-sm text-gray-700">
                  Mejora automática avanzada
                </label>
              </div>

              {settings.autoImprove && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Retraso de mejora: {settings.autoImproveDelay}ms
                    </label>
                    <input
                      type="range"
                      min="100"
                      max="5000"
                      step="100"
                      value={settings.autoImproveDelay}
                      onChange={(e) => updateSetting('autoImproveDelay', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      aria-label={`Retraso de mejora: ${settings.autoImproveDelay}ms`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mínimo de palabras: {settings.minWordsForAutoImprove}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={settings.minWordsForAutoImprove}
                      onChange={(e) => updateSetting('minWordsForAutoImprove', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      aria-label={`Mínimo de palabras: ${settings.minWordsForAutoImprove}`}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Content Modification Settings */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">
                Modificación de contenido
              </h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Intensidad de cambios: {settings.changeIntensity}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.changeIntensity}
                  onChange={(e) => updateSetting('changeIntensity', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  aria-label={`Intensidad de cambios: ${settings.changeIntensity}%`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expansión de texto: {settings.textExpansion}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.textExpansion}
                  onChange={(e) => updateSetting('textExpansion', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  aria-label={`Expansión de texto: ${settings.textExpansion}%`}
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="preserveCursor"
                  checked={settings.preserveCursor}
                  onChange={(e) => updateSetting('preserveCursor', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="preserveCursor" className="text-sm text-gray-700">
                  Preservar posición del cursor
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="changeAllText"
                  checked={settings.changeAllText}
                  onChange={(e) => updateSetting('changeAllText', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="changeAllText" className="text-sm text-gray-700">
                  Cambiar todo el texto
                </label>
              </div>
            </div>

            {/* Version Control Settings */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">
                Control de versiones
              </h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Máximo de versiones: {settings.maxVersions}
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={settings.maxVersions}
                  onChange={(e) => updateSetting('maxVersions', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  aria-label={`Máximo de versiones: ${settings.maxVersions}`}
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="autoVersioning"
                  checked={settings.autoVersioning}
                  onChange={(e) => updateSetting('autoVersioning', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="autoVersioning" className="text-sm text-gray-700">
                  Versionado automático
                </label>
              </div>
            </div>

            {/* Agent Mode Settings */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">
                Modo agente
              </h4>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="agentMode"
                  checked={settings.agentMode}
                  onChange={(e) => updateSetting('agentMode', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="agentMode" className="text-sm text-gray-700">
                  Activar modo agente
                </label>
              </div>

              {settings.agentMode && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Personalidad del agente
                    </label>
                    <input
                      type="text"
                      value={settings.agentPersonality}
                      onChange={(e) => updateSetting('agentPersonality', e.target.value)}
                      placeholder="ej. profesional, creativo, analítico..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Industria/Sector
                    </label>
                    <input
                      type="text"
                      value={settings.agentIndustry}
                      onChange={(e) => updateSetting('agentIndustry', e.target.value)}
                      placeholder="ej. tecnología, marketing, educación..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'validation' && (
          <AISettingsValidator
            settings={settings}
            onSettingsChange={updateSettings}
            onValidationChange={(isValid) => {
              // Handle validation state change if needed
            }}
          />
        )}
      </div>
    </div>
  );
}
