"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, AlertTriangle, Info, Bug, Clock, User } from 'lucide-react';
import { AppError } from '@/app/lib/error-logging/ErrorLogger';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';

interface ProgressiveErrorDisclosureProps {
  error: AppError;
  className?: string;
}

interface ErrorLevel {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  defaultExpanded?: boolean;
}

export const ProgressiveErrorDisclosure: React.FC<ProgressiveErrorDisclosureProps> = ({
  error,
  className = ''
}) => {
  const [expandedLevels, setExpandedLevels] = useState<Set<string>>(new Set(['basic']));

  const toggleLevel = (levelId: string) => {
    const newExpanded = new Set(expandedLevels);
    if (newExpanded.has(levelId)) {
      newExpanded.delete(levelId);
    } else {
      newExpanded.add(levelId);
    }
    setExpandedLevels(newExpanded);
  };

  const getErrorLevels = (): ErrorLevel[] => {
    return [
      {
        id: 'basic',
        title: 'Información Básica',
        icon: <Info className="h-4 w-4 text-blue-500" />,
        defaultExpanded: true,
        content: (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Mensaje:</span>
              <span className="text-sm text-gray-900">{error.userMessage}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Tipo:</span>
              <span className={`text-sm px-2 py-1 rounded-full ${getTypeStyles(error.type)}`}>
                {getTypeLabel(error.type)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Severidad:</span>
              <span className={`text-sm px-2 py-1 rounded-full ${getSeverityStyles(error.severity)}`}>
                {getSeverityLabel(error.severity)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Recuperable:</span>
              <span className={`text-sm ${error.recoverable ? 'text-green-600' : 'text-red-600'}`}>
                {error.recoverable ? 'Sí' : 'No'}
              </span>
            </div>
          </div>
        )
      },
      {
        id: 'context',
        title: 'Contexto del Error',
        icon: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
        content: (
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-700 block mb-1">Cuándo ocurrió:</span>
              <span className="text-sm text-gray-900">
                {error.timestamp.toLocaleString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </span>
            </div>
            
            {error.context && (
              <div>
                <span className="text-sm font-medium text-gray-700 block mb-1">Contexto adicional:</span>
                <div className="bg-gray-50 rounded p-2 text-sm">
                  {typeof error.context === 'object' ? (
                    <pre className="whitespace-pre-wrap text-xs font-mono text-gray-700">
                      {JSON.stringify(error.context, null, 2)}
                    </pre>
                  ) : (
                    <span className="text-gray-700">{String(error.context)}</span>
                  )}
                </div>
              </div>
            )}

            {error.metadata && (
              <div>
                <span className="text-sm font-medium text-gray-700 block mb-1">Metadatos:</span>
                <div className="bg-gray-50 rounded p-2">
                  {Object.entries(error.metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                      <span className="text-gray-900 font-mono text-xs">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      },
      {
        id: 'session',
        title: 'Información de Sesión',
        icon: <User className="h-4 w-4 text-purple-500" />,
        content: (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">ID de Sesión:</span>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                {error.sessionId}
              </code>
            </div>
            
            {error.userId && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Usuario:</span>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                  {error.userId}
                </code>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">ID del Error:</span>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                {error.id}
              </code>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Navegador:</span>
              <span className="text-xs text-gray-600">
                {navigator.userAgent.split(' ').slice(-2).join(' ')}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">URL:</span>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono max-w-48 truncate">
                {window.location.pathname}
              </code>
            </div>
          </div>
        )
      },
      {
        id: 'technical',
        title: 'Detalles Técnicos',
        icon: <Bug className="h-4 w-4 text-red-500" />,
        content: (
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-700 block mb-1">Mensaje técnico:</span>
              <code className="text-xs bg-red-50 border border-red-200 rounded p-2 block font-mono text-red-800">
                {error.message}
              </code>
            </div>

            {error.stackTrace && (
              <div>
                <span className="text-sm font-medium text-gray-700 block mb-1">Stack Trace:</span>
                <details className="bg-gray-50 border rounded">
                  <summary className="p-2 cursor-pointer text-sm text-gray-600 hover:bg-gray-100">
                    Ver stack trace completo
                  </summary>
                  <pre className="p-2 text-xs font-mono text-gray-700 overflow-x-auto border-t bg-white">
                    {error.stackTrace}
                  </pre>
                </details>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700 block">Reintentable:</span>
                <span className={error.retryable ? 'text-green-600' : 'text-red-600'}>
                  {error.retryable ? 'Sí' : 'No'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700 block">Timestamp:</span>
                <code className="text-xs text-gray-600">
                  {error.timestamp.toISOString()}
                </code>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'diagnostic',
        title: 'Información de Diagnóstico',
        icon: <Clock className="h-4 w-4 text-indigo-500" />,
        content: (
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-700 block mb-2">Estado del sistema:</span>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-green-50 border border-green-200 rounded p-2">
                  <div className="font-medium text-green-800">Conexión</div>
                  <div className="text-green-600">
                    {navigator.onLine ? 'En línea' : 'Sin conexión'}
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded p-2">
                  <div className="font-medium text-blue-800">Memoria</div>
                  <div className="text-blue-600">
                    {getMemoryUsage()}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <span className="text-sm font-medium text-gray-700 block mb-1">Capacidades del navegador:</span>
              <div className="text-xs text-gray-600 space-y-1">
                <div>• LocalStorage: {typeof Storage !== 'undefined' ? 'Disponible' : 'No disponible'}</div>
                <div>• Service Workers: {typeof navigator.serviceWorker !== 'undefined' ? 'Disponible' : 'No disponible'}</div>
                <div>• WebGL: {getWebGLSupport()}</div>
                <div>• Cookies: {navigator.cookieEnabled ? 'Habilitadas' : 'Deshabilitadas'}</div>
              </div>
            </div>

            <div>
              <span className="text-sm font-medium text-gray-700 block mb-1">Configuración de la página:</span>
              <div className="text-xs text-gray-600 space-y-1">
                <div>• Viewport: {window.innerWidth}x{window.innerHeight}</div>
                <div>• Idioma: {navigator.language}</div>
                <div>• Zona horaria: {Intl.DateTimeFormat().resolvedOptions().timeZone}</div>
                <div>• Protocolo: {window.location.protocol}</div>
              </div>
            </div>
          </div>
        )
      }
    ];
  };

  const getTypeStyles = (type: string) => {
    const styles = {
      network: 'bg-orange-100 text-orange-800',
      auth: 'bg-red-100 text-red-800',
      validation: 'bg-yellow-100 text-yellow-800',
      ai: 'bg-purple-100 text-purple-800',
      storage: 'bg-blue-100 text-blue-800'
    };
    return styles[type as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      network: 'Red',
      auth: 'Autenticación',
      validation: 'Validación',
      ai: 'IA',
      storage: 'Almacenamiento'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getSeverityStyles = (severity: string) => {
    const styles = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return styles[severity as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getSeverityLabel = (severity: string) => {
    const labels = {
      low: 'Baja',
      medium: 'Media',
      high: 'Alta',
      critical: 'Crítica'
    };
    return labels[severity as keyof typeof labels] || severity;
  };

  const getMemoryUsage = () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const used = Math.round(memory.usedJSHeapSize / 1024 / 1024);
      const total = Math.round(memory.totalJSHeapSize / 1024 / 1024);
      return `${used}/${total} MB`;
    }
    return 'No disponible';
  };

  const getWebGLSupport = () => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return gl ? 'Disponible' : 'No disponible';
    } catch {
      return 'No disponible';
    }
  };

  const errorLevels = getErrorLevels();

  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {errorLevels.map((level) => (
            <div key={level.id} className="border border-gray-200 rounded-lg">
              <Button
                variant="ghost"
                onClick={() => toggleLevel(level.id)}
                className="w-full justify-between p-3 h-auto hover:bg-gray-50"
              >
                <div className="flex items-center space-x-2">
                  {level.icon}
                  <span className="font-medium text-sm">{level.title}</span>
                </div>
                {expandedLevels.has(level.id) ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
              </Button>
              
              {expandedLevels.has(level.id) && (
                <div className="px-3 pb-3 border-t border-gray-100 bg-gray-50">
                  <div className="pt-3">
                    {level.content}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressiveErrorDisclosure;