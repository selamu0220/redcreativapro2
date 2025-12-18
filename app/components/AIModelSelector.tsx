"use client";

import { useState, useEffect } from 'react';
import { ChevronDown, Zap, Clock, DollarSign, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export interface AIModel {
  id: string;
  name: string;
  description: string;
  speed: 'fast' | 'medium' | 'slow';
  cost: 'low' | 'medium' | 'high';
  quality: 'good' | 'excellent' | 'premium';
  availability: 'available' | 'limited' | 'unavailable';
  fallbackFor?: string[];
  isPremium?: boolean;
}

interface AIModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  models: AIModel[];
  disabled?: boolean;
  showFallbacks?: boolean;
  className?: string;
}

const DEFAULT_MODELS: AIModel[] = [
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    description: 'Modelo ultra-rápido y ligero (recomendado)',
    speed: 'fast',
    cost: 'medium',
    quality: 'excellent',
    availability: 'available'
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'Modelo económico y eficiente',
    speed: 'fast',
    cost: 'low',
    quality: 'good',
    availability: 'available',
    fallbackFor: ['openai/gpt-4o']
  },
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    description: 'Modelo avanzado para tareas complejas',
    speed: 'medium',
    cost: 'high',
    quality: 'premium',
    availability: 'available',
    isPremium: true
  },
  {
    id: 'google/gemini-pro-1.5',
    name: 'Gemini Pro 1.5',
    description: 'Modelo de Google vía OpenRouter',
    speed: 'medium',
    cost: 'medium',
    quality: 'excellent',
    availability: 'limited'
  },
  {
    id: 'meta-llama/llama-3.1-8b-instruct',
    name: 'Llama 3.1 8B',
    description: 'Modelo open source rápido',
    speed: 'fast',
    cost: 'low',
    quality: 'good',
    availability: 'available'
  }
];

export default function AIModelSelector({
  selectedModel,
  onModelChange,
  models = DEFAULT_MODELS,
  disabled = false,
  showFallbacks = true,
  className = ''
}: AIModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [modelStatus, setModelStatus] = useState<Record<string, 'checking' | 'available' | 'unavailable'>>({});

  const selectedModelData = models.find(m => m.id === selectedModel) || models[0];

  // Check model availability
  useEffect(() => {
    const checkModelAvailability = async () => {
      const statusChecks = models.map(async (model) => {
        setModelStatus(prev => ({ ...prev, [model.id]: 'checking' }));
        
        try {
          // Simulate API check - replace with actual availability check
          await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
          
          // Mock availability based on model type
          const isAvailable = model.availability === 'available' || 
                             (model.availability === 'limited' && Math.random() > 0.3);
          
          setModelStatus(prev => ({ 
            ...prev, 
            [model.id]: isAvailable ? 'available' : 'unavailable' 
          }));
        } catch (error) {
          setModelStatus(prev => ({ ...prev, [model.id]: 'unavailable' }));
        }
      });

      await Promise.all(statusChecks);
    };

    checkModelAvailability();
  }, [models]);

  const getSpeedIcon = (speed: AIModel['speed']) => {
    switch (speed) {
      case 'fast': return <Zap className="w-3 h-3 text-green-500" />;
      case 'medium': return <Clock className="w-3 h-3 text-yellow-500" />;
      case 'slow': return <Clock className="w-3 h-3 text-red-500" />;
    }
  };

  const getCostIcon = (cost: AIModel['cost']) => {
    const dollarCount = cost === 'low' ? 1 : cost === 'medium' ? 2 : 3;
    return (
      <div className="flex">
        {Array.from({ length: 3 }, (_, i) => (
          <DollarSign 
            key={i} 
            className={`w-3 h-3 ${i < dollarCount ? 'text-green-500' : 'text-gray-300'}`} 
          />
        ))}
      </div>
    );
  };

  const getAvailabilityIcon = (modelId: string) => {
    const status = modelStatus[modelId];
    switch (status) {
      case 'checking':
        return <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />;
      case 'available':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'unavailable':
        return <XCircle className="w-3 h-3 text-red-500" />;
      default:
        return <AlertTriangle className="w-3 h-3 text-yellow-500" />;
    }
  };

  const getFallbackModels = (modelId: string): AIModel[] => {
    const model = models.find(m => m.id === modelId);
    if (!model?.fallbackFor) return [];
    
    return models.filter(m => model.fallbackFor!.includes(m.id));
  };

  const handleModelSelect = (modelId: string) => {
    const status = modelStatus[modelId];
    
    if (status === 'unavailable') {
      // Try to find a fallback
      const model = models.find(m => m.id === modelId);
      const fallbacks = model?.fallbackFor ? 
        models.filter(m => model.fallbackFor!.includes(m.id) && modelStatus[m.id] === 'available') :
        models.filter(m => m.fallbackFor?.includes(modelId) && modelStatus[m.id] === 'available');
      
      if (fallbacks.length > 0) {
        onModelChange(fallbacks[0].id);
      } else {
        // Find any available model
        const availableModel = models.find(m => modelStatus[m.id] === 'available');
        if (availableModel) {
          onModelChange(availableModel.id);
        }
      }
    } else {
      onModelChange(modelId);
    }
    
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Modelo de IA
      </label>
      
      {/* Selected Model Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-left
          flex items-center justify-between
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400 cursor-pointer'}
          transition-colors duration-200
        `}
      >
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {getAvailabilityIcon(selectedModel)}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 truncate">
              {selectedModelData.name}
              {selectedModelData.isPremium && (
                <span className="ml-1 text-xs bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-1.5 py-0.5 rounded">
                  PRO
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {selectedModelData.description}
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {getSpeedIcon(selectedModelData.speed)}
            {getCostIcon(selectedModelData.cost)}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {models.map((model) => {
            const status = modelStatus[model.id];
            const isSelected = model.id === selectedModel;
            const isUnavailable = status === 'unavailable';
            
            return (
              <div key={model.id}>
                <button
                  type="button"
                  onClick={() => handleModelSelect(model.id)}
                  disabled={isUnavailable}
                  className={`
                    w-full px-3 py-2 text-left hover:bg-gray-50 
                    ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''}
                    ${isUnavailable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    transition-colors duration-200
                  `}
                >
                  <div className="flex items-center space-x-2">
                    {getAvailabilityIcon(model.id)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                          {model.name}
                        </span>
                        {model.isPremium && (
                          <span className="text-xs bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-1.5 py-0.5 rounded">
                            PRO
                          </span>
                        )}
                        {isUnavailable && (
                          <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                            No disponible
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {model.description}
                      </div>
                      <div className="flex items-center space-x-3 mt-1">
                        <div className="flex items-center space-x-1">
                          {getSpeedIcon(model.speed)}
                          <span className="text-xs text-gray-600 capitalize">{model.speed}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {getCostIcon(model.cost)}
                          <span className="text-xs text-gray-600 capitalize">{model.cost}</span>
                        </div>
                        <div className="text-xs text-gray-600 capitalize">
                          {model.quality}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Show fallback options */}
                {showFallbacks && isUnavailable && model.fallbackFor && (
                  <div className="px-6 py-2 bg-yellow-50 border-l-4 border-yellow-400">
                    <div className="text-xs text-yellow-700 font-medium mb-1">
                      Alternativas disponibles:
                    </div>
                    {models
                      .filter(m => model.fallbackFor!.includes(m.id) && modelStatus[m.id] === 'available')
                      .map(fallback => (
                        <button
                          key={fallback.id}
                          type="button"
                          onClick={() => handleModelSelect(fallback.id)}
                          className="block text-xs text-yellow-600 hover:text-yellow-800 underline"
                        >
                          {fallback.name}
                        </button>
                      ))
                    }
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Fallback Information */}
      {showFallbacks && selectedModelData && (
        <div className="mt-2 text-xs text-gray-500">
          {modelStatus[selectedModel] === 'unavailable' && (
            <div className="flex items-center space-x-1 text-red-600">
              <AlertTriangle className="w-3 h-3" />
              <span>Modelo no disponible, usando alternativa</span>
            </div>
          )}
          {getFallbackModels(selectedModel).length > 0 && (
            <div className="mt-1">
              Alternativas: {getFallbackModels(selectedModel).map(f => f.name).join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}