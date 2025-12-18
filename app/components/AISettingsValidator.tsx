"use client";

import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, Download, Upload, RotateCcw } from 'lucide-react';
import { AISettingsManager, AISettings, SettingsValidationResult, SettingsConflict } from '../lib/ai-settings-manager';

interface AISettingsValidatorProps {
  settings: AISettings;
  onSettingsChange: (settings: AISettings) => void;
  onValidationChange?: (isValid: boolean) => void;
}

export default function AISettingsValidator({
  settings,
  onSettingsChange,
  onValidationChange
}: AISettingsValidatorProps) {
  const [validation, setValidation] = useState<SettingsValidationResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [conflicts, setConflicts] = useState<SettingsConflict[]>([]);
  const [showConflictResolution, setShowConflictResolution] = useState(false);
  const [conflictResolutions, setConflictResolutions] = useState<Record<string, 'keep_local' | 'use_incoming' | 'merge'>>({});

  // Validate settings whenever they change
  useEffect(() => {
    const validateSettings = async () => {
      setIsValidating(true);
      
      // Simulate async validation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const result = AISettingsManager.validateSettings(settings);
      setValidation(result);
      
      if (onValidationChange) {
        onValidationChange(result.isValid);
      }
      
      setIsValidating(false);
    };

    validateSettings();
  }, [settings, onValidationChange]);

  const handleFixSettings = () => {
    if (validation?.fixedSettings) {
      const fixedSettings = { ...settings, ...validation.fixedSettings };
      onSettingsChange(fixedSettings);
    }
  };

  const handleExportSettings = () => {
    try {
      const exportData = AISettingsManager.exportSettings(settings);
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `escritor-ia-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting settings:', error);
      alert('Error al exportar la configuración');
    }
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const result = AISettingsManager.importSettings(content);
        
        if (result.success && result.settings) {
          // Check for conflicts with current settings
          const detectedConflicts = AISettingsManager.detectConflicts(settings, result.settings);
          
          if (detectedConflicts.length > 0) {
            setConflicts(detectedConflicts);
            setShowConflictResolution(true);
            
            // Initialize default resolutions
            const defaultResolutions: Record<string, 'keep_local' | 'use_incoming' | 'merge'> = {};
            detectedConflicts.forEach(conflict => {
              defaultResolutions[conflict.field] = conflict.resolution === 'manual' ? 'use_incoming' : conflict.resolution;
            });
            setConflictResolutions(defaultResolutions);
          } else {
            onSettingsChange(result.settings);
            alert('Configuración importada exitosamente');
          }
        } else {
          alert(`Error al importar: ${result.error}`);
        }
      } catch (error) {
        alert('Error al leer el archivo');
      }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  const handleResolveConflicts = () => {
    if (conflicts.length === 0) return;
    
    // Get the incoming settings from the first conflict (they should all reference the same import)
    const incomingSettings = settings; // This would be the imported settings in a real scenario
    const resolvedSettings = AISettingsManager.resolveConflicts(
      settings, 
      incomingSettings, 
      conflictResolutions as any
    );
    
    onSettingsChange(resolvedSettings);
    setShowConflictResolution(false);
    setConflicts([]);
    alert('Conflictos resueltos y configuración actualizada');
  };

  const handleResetToDefaults = () => {
    if (confirm('¿Estás seguro de que quieres restablecer toda la configuración a los valores por defecto?')) {
      const defaultSettings = AISettingsManager.resetToDefaults();
      onSettingsChange(defaultSettings);
      alert('Configuración restablecida a valores por defecto');
    }
  };

  const handleRestoreBackup = () => {
    const result = AISettingsManager.restoreFromBackup();
    
    if (result.success && result.settings) {
      onSettingsChange(result.settings);
      alert('Configuración restaurada desde el respaldo');
    } else {
      alert(`Error al restaurar: ${result.error}`);
    }
  };

  const getValidationIcon = () => {
    if (isValidating) {
      return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
    }
    
    if (!validation) {
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
    
    if (validation.isValid) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getValidationMessage = () => {
    if (isValidating) return 'Validando configuración...';
    if (!validation) return 'Configuración no validada';
    if (validation.isValid) return 'Configuración válida';
    return `${validation.errors.length} errores encontrados`;
  };

  return (
    <div className="space-y-4">
      {/* Validation Status */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
        <div className="flex items-center space-x-2">
          {getValidationIcon()}
          <span className="text-sm font-medium text-gray-700">
            {getValidationMessage()}
          </span>
          {validation && (validation.errors.length > 0 || validation.warnings.length > 0) && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              {showDetails ? 'Ocultar detalles' : 'Ver detalles'}
            </button>
          )}
        </div>
        
        {validation && !validation.isValid && validation.fixedSettings && (
          <button
            onClick={handleFixSettings}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Corregir automáticamente
          </button>
        )}
      </div>

      {/* Validation Details */}
      {showDetails && validation && (
        <div className="p-3 bg-white border rounded-lg space-y-2">
          {validation.errors.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-red-700 mb-1">Errores:</h4>
              <ul className="text-xs text-red-600 space-y-1">
                {validation.errors.map((error, index) => (
                  <li key={index} className="flex items-start space-x-1">
                    <XCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {validation.warnings.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-yellow-700 mb-1">Advertencias:</h4>
              <ul className="text-xs text-yellow-600 space-y-1">
                {validation.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start space-x-1">
                    <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Settings Management Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleExportSettings}
          className="flex items-center space-x-1 px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          aria-label="Exportar configuración actual"
        >
          <Download className="w-4 h-4" />
          <span>Exportar</span>
        </button>
        
        <label className="flex items-center space-x-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors cursor-pointer">
          <Upload className="w-4 h-4" />
          <span>Importar</span>
          <input
            type="file"
            accept=".json"
            onChange={handleImportSettings}
            className="hidden"
            aria-label="Importar configuración desde archivo"
          />
        </label>
        
        <button
          type="button"
          onClick={handleRestoreBackup}
          className="flex items-center space-x-1 px-3 py-2 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
          aria-label="Restaurar configuración desde respaldo automático"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Restaurar respaldo</span>
        </button>
        
        <button
          type="button"
          onClick={handleResetToDefaults}
          className="flex items-center space-x-1 px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          aria-label="Restablecer toda la configuración a valores por defecto"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Restablecer</span>
        </button>
      </div>

      {/* Conflict Resolution Modal */}
      {showConflictResolution && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Resolver conflictos de configuración
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Se encontraron diferencias entre tu configuración actual y la importada. 
                Elige cómo resolver cada conflicto:
              </p>
            </div>
            
            <div className="p-4 max-h-96 overflow-y-auto space-y-4">
              {conflicts.map((conflict, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <h4 className="font-medium text-gray-900 mb-2">
                    {conflict.field}
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="p-2 bg-blue-50 rounded">
                      <div className="text-xs font-medium text-blue-700 mb-1">
                        Valor actual:
                      </div>
                      <div className="text-sm text-gray-900">
                        {JSON.stringify(conflict.localValue)}
                      </div>
                    </div>
                    
                    <div className="p-2 bg-green-50 rounded">
                      <div className="text-xs font-medium text-green-700 mb-1">
                        Valor importado:
                      </div>
                      <div className="text-sm text-gray-900">
                        {JSON.stringify(conflict.incomingValue)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <label className="flex items-center space-x-1">
                      <input
                        type="radio"
                        name={`conflict-${index}`}
                        value="keep_local"
                        checked={conflictResolutions[conflict.field] === 'keep_local'}
                        onChange={(e) => setConflictResolutions(prev => ({
                          ...prev,
                          [conflict.field]: e.target.value as any
                        }))}
                      />
                      <span className="text-sm">Mantener actual</span>
                    </label>
                    
                    <label className="flex items-center space-x-1">
                      <input
                        type="radio"
                        name={`conflict-${index}`}
                        value="use_incoming"
                        checked={conflictResolutions[conflict.field] === 'use_incoming'}
                        onChange={(e) => setConflictResolutions(prev => ({
                          ...prev,
                          [conflict.field]: e.target.value as any
                        }))}
                      />
                      <span className="text-sm">Usar importado</span>
                    </label>
                    
                    {Array.isArray(conflict.localValue) && Array.isArray(conflict.incomingValue) && (
                      <label className="flex items-center space-x-1">
                        <input
                          type="radio"
                          name={`conflict-${index}`}
                          value="merge"
                          checked={conflictResolutions[conflict.field] === 'merge'}
                          onChange={(e) => setConflictResolutions(prev => ({
                            ...prev,
                            [conflict.field]: e.target.value as any
                          }))}
                        />
                        <span className="text-sm">Combinar</span>
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t flex justify-end space-x-2">
              <button
                onClick={() => setShowConflictResolution(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleResolveConflicts}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Aplicar resoluciones
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Summary */}
      <div className="p-3 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Resumen de configuración:</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {Object.entries(AISettingsManager.getSettingsSummary(settings)).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="text-gray-600">{key}:</span>
              <span className="text-gray-900 font-medium">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}