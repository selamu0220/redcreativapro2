"use client";

import React, { useState, useEffect } from 'react';
import { Lightbulb, CheckCircle, AlertTriangle, ArrowRight, Clock, Users, TrendingUp } from 'lucide-react';
import { AppError } from '@/app/lib/error-logging/ErrorLogger';
import ErrorPatternAnalyzer, { ErrorPattern, PreventionSuggestion } from '@/app/lib/error-logging/ErrorPatternAnalyzer';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';

interface ContextualRecoverySuggestionsProps {
  error: AppError;
  onSuggestionApplied?: (suggestionId: string) => void;
  className?: string;
}

interface ContextualSuggestion {
  id: string;
  title: string;
  description: string;
  action: () => Promise<void> | void;
  confidence: number; // 0-100
  category: 'immediate' | 'preventive' | 'system';
  estimatedTime: string;
  successRate: number; // 0-100 based on historical data
  icon: React.ReactNode;
}

export const ContextualRecoverySuggestions: React.FC<ContextualRecoverySuggestionsProps> = ({
  error,
  onSuggestionApplied,
  className = ''
}) => {
  const [suggestions, setSuggestions] = useState<ContextualSuggestion[]>([]);
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [patternAnalyzer] = useState(() => ErrorPatternAnalyzer.getInstance());

  useEffect(() => {
    generateContextualSuggestions();
  }, [error]);

  const generateContextualSuggestions = async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Get related patterns
      const relatedPatterns = await findRelatedPatterns();
      
      // Generate suggestions based on error context and patterns
      const contextualSuggestions = await createContextualSuggestions(relatedPatterns);
      
      setSuggestions(contextualSuggestions);
    } catch (err) {
      console.error('Error generating suggestions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const findRelatedPatterns = async (): Promise<ErrorPattern[]> => {
    // Get patterns similar to current error
    const allPatterns = patternAnalyzer.getTopPatterns(50);
    
    return allPatterns.filter(pattern => {
      // Match by type
      if (pattern.type !== error.type) return false;
      
      // Match by context similarity
      const contextSimilarity = calculateContextSimilarity(pattern, error);
      return contextSimilarity > 0.5; // 50% similarity threshold
    });
  };

  const calculateContextSimilarity = (pattern: ErrorPattern, error: AppError): number => {
    if (!error.context || !pattern.commonContext) return 0;
    
    const errorContextKeys = Object.keys(error.context);
    const patternContextKeys = Object.keys(pattern.commonContext);
    
    const commonKeys = errorContextKeys.filter(key => patternContextKeys.includes(key));
    const matchingValues = commonKeys.filter(key => 
      error.context[key] === pattern.commonContext[key] ||
      (Array.isArray(pattern.commonContext[key]) && pattern.commonContext[key].includes(error.context[key]))
    );
    
    return matchingValues.length / Math.max(errorContextKeys.length, patternContextKeys.length);
  };

  const createContextualSuggestions = async (relatedPatterns: ErrorPattern[]): Promise<ContextualSuggestion[]> => {
    const suggestions: ContextualSuggestion[] = [];
    
    // Immediate recovery suggestions
    suggestions.push(...generateImmediateSuggestions());
    
    // Pattern-based suggestions
    if (relatedPatterns.length > 0) {
      suggestions.push(...generatePatternBasedSuggestions(relatedPatterns));
    }
    
    // Context-specific suggestions
    suggestions.push(...generateContextSpecificSuggestions());
    
    // System-level suggestions
    suggestions.push(...generateSystemSuggestions());
    
    // Sort by confidence and success rate
    return suggestions.sort((a, b) => {
      const scoreA = (a.confidence * 0.6) + (a.successRate * 0.4);
      const scoreB = (b.confidence * 0.6) + (b.successRate * 0.4);
      return scoreB - scoreA;
    });
  };

  const generateImmediateSuggestions = (): ContextualSuggestion[] => {
    const suggestions: ContextualSuggestion[] = [];
    
    switch (error.type) {
      case 'network':
        suggestions.push({
          id: 'retry_operation',
          title: 'Reintentar Operación',
          description: 'Intenta la operación nuevamente. Los problemas de red suelen ser temporales.',
          action: async () => {
            await new Promise(resolve => setTimeout(resolve, 1000));
            window.location.reload();
          },
          confidence: 85,
          category: 'immediate',
          estimatedTime: '5 segundos',
          successRate: 78,
          icon: <ArrowRight className="h-4 w-4 text-blue-500" />
        });
        
        if (error.context?.offline) {
          suggestions.push({
            id: 'check_connection',
            title: 'Verificar Conexión',
            description: 'Parece que estás sin conexión. Verifica tu conexión a internet.',
            action: () => {
              window.open('https://www.google.com', '_blank');
            },
            confidence: 95,
            category: 'immediate',
            estimatedTime: '1 minuto',
            successRate: 90,
            icon: <AlertTriangle className="h-4 w-4 text-orange-500" />
          });
        }
        break;
        
      case 'auth':
        suggestions.push({
          id: 'refresh_session',
          title: 'Renovar Sesión',
          description: 'Tu sesión puede haber expirado. Intenta renovarla automáticamente.',
          action: async () => {
            try {
              await fetch('/api/auth/refresh', { method: 'POST' });
              window.location.reload();
            } catch (e) {
              window.location.href = '/auth/login';
            }
          },
          confidence: 80,
          category: 'immediate',
          estimatedTime: '10 segundos',
          successRate: 85,
          icon: <CheckCircle className="h-4 w-4 text-green-500" />
        });
        break;
        
      case 'ai':
        if (error.message.includes('quota') || error.message.includes('limit')) {
          suggestions.push({
            id: 'wait_quota_reset',
            title: 'Esperar Renovación de Cuota',
            description: 'Has alcanzado el límite de uso. La cuota se renueva cada hora.',
            action: () => {
              const nextHour = new Date();
              nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
              alert(`Tu cuota se renovará a las ${nextHour.toLocaleTimeString()}`);
            },
            confidence: 90,
            category: 'immediate',
            estimatedTime: 'Hasta 1 hora',
            successRate: 100,
            icon: <Clock className="h-4 w-4 text-purple-500" />
          });
        }
        break;
        
      case 'storage':
        suggestions.push({
          id: 'clear_cache',
          title: 'Limpiar Caché',
          description: 'Libera espacio eliminando datos temporales del navegador.',
          action: () => {
            if (confirm('¿Estás seguro de que quieres limpiar la caché? Esto puede eliminar datos guardados localmente.')) {
              localStorage.clear();
              sessionStorage.clear();
              window.location.reload();
            }
          },
          confidence: 70,
          category: 'immediate',
          estimatedTime: '30 segundos',
          successRate: 75,
          icon: <AlertTriangle className="h-4 w-4 text-yellow-500" />
        });
        break;
    }
    
    return suggestions;
  };

  const generatePatternBasedSuggestions = (patterns: ErrorPattern[]): ContextualSuggestion[] => {
    const suggestions: ContextualSuggestion[] = [];
    
    // Find the most successful resolution patterns
    const successfulPatterns = patterns
      .filter(pattern => pattern.resolutionSuccess > 60)
      .sort((a, b) => b.resolutionSuccess - a.resolutionSuccess);
    
    if (successfulPatterns.length > 0) {
      const topPattern = successfulPatterns[0];
      
      suggestions.push({
        id: 'pattern_based_solution',
        title: 'Solución Basada en Historial',
        description: `Este error se ha resuelto exitosamente ${topPattern.resolutionSuccess}% de las veces siguiendo estos pasos.`,
        action: async () => {
          // Generate specific steps based on pattern
          const steps = generateResolutionSteps(topPattern);
          alert(`Pasos recomendados:\n${steps.join('\n')}`);
        },
        confidence: topPattern.resolutionSuccess,
        category: 'preventive',
        estimatedTime: `${Math.round(topPattern.averageResolutionTime / 60000)} minutos`,
        successRate: topPattern.resolutionSuccess,
        icon: <TrendingUp className="h-4 w-4 text-green-500" />
      });
    }
    
    // Community-based suggestions
    const communityPattern = patterns.find(pattern => pattern.affectedUsers.size > 5);
    if (communityPattern) {
      suggestions.push({
        id: 'community_solution',
        title: 'Solución de la Comunidad',
        description: `${communityPattern.affectedUsers.size} usuarios han experimentado este error. Solución más común aplicada.`,
        action: () => {
          // Show community-based solution
          const solution = getCommunityBasedSolution(communityPattern);
          alert(`Solución de la comunidad:\n${solution}`);
        },
        confidence: 75,
        category: 'preventive',
        estimatedTime: '2-5 minutos',
        successRate: 70,
        icon: <Users className="h-4 w-4 text-blue-500" />
      });
    }
    
    return suggestions;
  };

  const generateContextSpecificSuggestions = (): ContextualSuggestion[] => {
    const suggestions: ContextualSuggestion[] = [];
    
    // Browser-specific suggestions
    const browser = getBrowserInfo();
    if (browser === 'Safari' && error.type === 'storage') {
      suggestions.push({
        id: 'safari_storage_fix',
        title: 'Configuración de Safari',
        description: 'Safari tiene restricciones especiales de almacenamiento. Ajusta la configuración de privacidad.',
        action: () => {
          alert('Ve a Configuración > Safari > Privacidad y Seguridad > Bloquear todas las cookies: Desactivar');
        },
        confidence: 80,
        category: 'system',
        estimatedTime: '2 minutos',
        successRate: 85,
        icon: <Lightbulb className="h-4 w-4 text-yellow-500" />
      });
    }
    
    // Mobile-specific suggestions
    if (isMobileDevice()) {
      suggestions.push({
        id: 'mobile_optimization',
        title: 'Optimización Móvil',
        description: 'Usa la versión móvil optimizada para mejor rendimiento.',
        action: () => {
          window.location.href = window.location.href + '?mobile=true';
        },
        confidence: 70,
        category: 'system',
        estimatedTime: '10 segundos',
        successRate: 80,
        icon: <Lightbulb className="h-4 w-4 text-blue-500" />
      });
    }
    
    // Time-based suggestions
    const hour = new Date().getHours();
    if (hour >= 22 || hour <= 6) { // Night time
      suggestions.push({
        id: 'night_mode_suggestion',
        title: 'Modo Nocturno',
        description: 'Activa el modo nocturno para reducir la carga del sistema durante horas de poco uso.',
        action: () => {
          document.body.classList.add('dark-mode');
          localStorage.setItem('dark-mode', 'true');
        },
        confidence: 60,
        category: 'system',
        estimatedTime: '5 segundos',
        successRate: 65,
        icon: <Lightbulb className="h-4 w-4 text-indigo-500" />
      });
    }
    
    return suggestions;
  };

  const generateSystemSuggestions = (): ContextualSuggestion[] => {
    const suggestions: ContextualSuggestion[] = [];
    
    // Performance-based suggestions
    if (getMemoryUsage() > 80) {
      suggestions.push({
        id: 'memory_optimization',
        title: 'Optimizar Memoria',
        description: 'El uso de memoria es alto. Cierra otras pestañas o aplicaciones.',
        action: () => {
          if (confirm('¿Quieres que intentemos liberar memoria automáticamente?')) {
            // Force garbage collection if available
            if ('gc' in window) {
              (window as any).gc();
            }
            // Clear some caches
            sessionStorage.clear();
          }
        },
        confidence: 75,
        category: 'system',
        estimatedTime: '1 minuto',
        successRate: 70,
        icon: <AlertTriangle className="h-4 w-4 text-orange-500" />
      });
    }
    
    return suggestions;
  };

  const generateResolutionSteps = (pattern: ErrorPattern): string[] => {
    // Generate specific steps based on pattern characteristics
    const steps: string[] = [];
    
    if (pattern.preventionSuggestions.length > 0) {
      steps.push(...pattern.preventionSuggestions.slice(0, 3));
    }
    
    // Add generic steps based on error type
    switch (pattern.type) {
      case 'network':
        steps.push('Verifica tu conexión a internet', 'Intenta recargar la página');
        break;
      case 'auth':
        steps.push('Cierra sesión y vuelve a iniciar sesión', 'Limpia las cookies del navegador');
        break;
      case 'ai':
        steps.push('Espera unos minutos antes de intentar de nuevo', 'Verifica tu configuración de API');
        break;
    }
    
    return steps;
  };

  const getCommunityBasedSolution = (pattern: ErrorPattern): string => {
    // Return a community-based solution description
    return `Basado en ${pattern.affectedUsers.size} usuarios que experimentaron este error:\n\n` +
           `• ${pattern.resolutionSuccess}% de éxito con las soluciones aplicadas\n` +
           `• Tiempo promedio de resolución: ${Math.round(pattern.averageResolutionTime / 60000)} minutos\n` +
           `• Última ocurrencia: ${pattern.lastOccurrence.toLocaleDateString()}\n\n` +
           `Solución más efectiva: ${pattern.preventionSuggestions[0] || 'Reintentar la operación'}`;
  };

  const getBrowserInfo = (): string => {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
  };

  const isMobileDevice = (): boolean => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const getMemoryUsage = (): number => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100;
    }
    return 0;
  };

  const applySuggestion = async (suggestion: ContextualSuggestion): Promise<void> => {
    try {
      await suggestion.action();
      
      setAppliedSuggestions(prev => new Set([...prev, suggestion.id]));
      
      if (onSuggestionApplied) {
        onSuggestionApplied(suggestion.id);
      }
      
      // Log the application for analytics
      console.log(`Applied suggestion: ${suggestion.id} for error: ${error.id}`);
      
    } catch (err) {
      console.error('Error applying suggestion:', err);
      alert('No se pudo aplicar la sugerencia. Intenta manualmente.');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'immediate':
        return <ArrowRight className="h-4 w-4 text-red-500" />;
      case 'preventive':
        return <Lightbulb className="h-4 w-4 text-yellow-500" />;
      case 'system':
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'immediate':
        return 'Solución Inmediata';
      case 'preventive':
        return 'Prevención';
      case 'system':
        return 'Sistema';
      default:
        return 'General';
    }
  };

  if (isLoading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analizando error y generando sugerencias...</p>
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="p-6 text-center">
          <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No se encontraron sugerencias específicas para este error.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          <span>Sugerencias de Recuperación</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Sugerencias personalizadas basadas en el contexto del error y patrones históricos.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className={`border rounded-lg p-4 ${
              appliedSuggestions.has(suggestion.id) 
                ? 'bg-green-50 border-green-200' 
                : 'bg-white border-gray-200 hover:border-gray-300'
            } transition-colors`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  {suggestion.icon}
                  <h4 className="font-semibold text-gray-900">{suggestion.title}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    suggestion.category === 'immediate' ? 'bg-red-100 text-red-800' :
                    suggestion.category === 'preventive' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {getCategoryLabel(suggestion.category)}
                  </span>
                </div>
                
                <p className="text-sm text-gray-700 mb-3">{suggestion.description}</p>
                
                <div className="flex items-center space-x-4 text-xs text-gray-600">
                  <span>⏱️ {suggestion.estimatedTime}</span>
                  <span>✅ {suggestion.successRate}% éxito</span>
                  <span>🎯 {suggestion.confidence}% confianza</span>
                </div>
              </div>
              
              <div className="ml-4">
                {appliedSuggestions.has(suggestion.id) ? (
                  <div className="flex items-center space-x-1 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Aplicado</span>
                  </div>
                ) : (
                  <Button
                    onClick={() => applySuggestion(suggestion)}
                    size="sm"
                    variant={suggestion.category === 'immediate' ? 'default' : 'outline'}
                  >
                    Aplicar
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ContextualRecoverySuggestions;