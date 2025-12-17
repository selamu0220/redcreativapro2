"use client";

import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Info, CheckCircle, XCircle, RefreshCw, ExternalLink } from 'lucide-react';
import ErrorLogger, { AppError, ErrorRecoveryAction, ErrorType } from '@/app/lib/error-logging/ErrorLogger';

import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';

export type NotificationType = 'error' | 'warning' | 'info' | 'success';

export interface ErrorNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  actions?: ErrorRecoveryAction[];
  autoClose?: boolean;
  duration?: number;
  persistent?: boolean;
  error?: AppError;
}

interface ErrorNotificationSystemProps {
  maxNotifications?: number;
  defaultDuration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center';
}

export const ErrorNotificationSystem: React.FC<ErrorNotificationSystemProps> = ({
  maxNotifications = 5,
  defaultDuration = 5000,
  position = 'top-right'
}) => {
  const [notifications, setNotifications] = useState<ErrorNotification[]>([]);
  const [errorLogger] = useState(() => ErrorLogger.getInstance());

  useEffect(() => {
    // Listen for new errors
    const unsubscribe = errorLogger.onError((error: AppError) => {
      const notification = createErrorNotification(error);
      addNotification(notification);
    });

    return unsubscribe;
  }, [errorLogger]);

  const createErrorNotification = (error: AppError): ErrorNotification => {
    const recoveryActions = errorLogger.getRecoveryActions(error);
    
    return {
      id: error.id,
      type: getNotificationTypeFromError(error),
      title: getErrorTitle(error),
      message: getUserFriendlyMessage(error),
      actions: recoveryActions,
      autoClose: error.severity === 'low',
      duration: getNotificationDuration(error),
      persistent: error.severity === 'critical',
      error
    };
  };

  const getNotificationTypeFromError = (error: AppError): NotificationType => {
    switch (error.severity) {
      case 'critical':
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'error';
    }
  };

  const getErrorTitle = (error: AppError): string => {
    const titles = {
      network: 'Error de Conexión',
      auth: 'Error de Autenticación',
      validation: 'Error de Validación',
      ai: 'Error del Servicio de IA',
      storage: 'Error de Almacenamiento'
    };
    return titles[error.type] || 'Error del Sistema';
  };

  const getUserFriendlyMessage = (error: AppError): string => {
    // Enhanced user-friendly messages with specific guidance
    type MessageMap = {
      [K in ErrorType]: {
        default: string;
        [key: string]: string;
      };
    };

    const messages: MessageMap = {
      network: {
        default: 'No se pudo conectar al servidor. Verifica tu conexión a internet.',
        timeout: 'La conexión tardó demasiado. Intenta de nuevo en unos momentos.',
        offline: 'Parece que estás sin conexión. Verifica tu conexión a internet.',
        server_error: 'El servidor está experimentando problemas. Intenta de nuevo más tarde.'
      },
      auth: {
        default: 'Problema con tu sesión. Por favor, inicia sesión nuevamente.',
        expired: 'Tu sesión ha expirado. Inicia sesión para continuar.',
        invalid_token: 'Token de acceso inválido. Necesitas iniciar sesión nuevamente.',
        permission_denied: 'No tienes permisos para realizar esta acción.'
      },
      validation: {
        default: 'Los datos ingresados no son válidos. Revisa la información.',
        required_field: 'Faltan campos obligatorios. Completa toda la información requerida.',
        invalid_format: 'El formato de los datos no es correcto. Verifica e intenta de nuevo.',
        length_exceeded: 'El texto es demasiado largo. Reduce la cantidad de contenido.'
      },
      ai: {
        default: 'Error en el servicio de IA. Intenta de nuevo en unos momentos.',
        quota_exceeded: 'Has alcanzado el límite de uso. Espera unos minutos antes de continuar.',
        model_unavailable: 'El modelo de IA no está disponible. Cambiando a modelo alternativo.',
        api_key_invalid: 'La clave de API no es válida. Verifica tu configuración.',
        content_filtered: 'El contenido fue filtrado por políticas de seguridad. Modifica el texto.'
      },
      storage: {
        default: 'Error al guardar los datos. Intenta de nuevo.',
        quota_exceeded: 'Espacio de almacenamiento lleno. Libera espacio y vuelve a intentar.',
        permission_denied: 'No se puede acceder al almacenamiento. Verifica los permisos.',
        corrupted_data: 'Los datos están corruptos. Restaura desde una copia de seguridad.'
      }
    };

    const typeMessages = messages[error.type];
    if (!typeMessages) return error.userMessage;

    // Try to match specific error patterns with type-safe property access
    const errorMessage = error.message.toLowerCase();
    
    // Helper function to safely get message with fallback
    const getMessageSafely = (key: string): string => {
      return typeMessages[key] || typeMessages.default;
    };
    
    if (errorMessage.includes('timeout')) return getMessageSafely('timeout');
    if (errorMessage.includes('offline')) return getMessageSafely('offline');
    if (errorMessage.includes('server') || errorMessage.includes('500')) return getMessageSafely('server_error');
    if (errorMessage.includes('expired')) return getMessageSafely('expired');
    if (errorMessage.includes('invalid')) return getMessageSafely('invalid_token') || getMessageSafely('invalid_format');
    if (errorMessage.includes('permission')) return getMessageSafely('permission_denied');
    if (errorMessage.includes('required')) return getMessageSafely('required_field');
    if (errorMessage.includes('quota') || errorMessage.includes('limit')) return getMessageSafely('quota_exceeded');
    if (errorMessage.includes('api key')) return getMessageSafely('api_key_invalid');
    if (errorMessage.includes('filtered')) return getMessageSafely('content_filtered');
    if (errorMessage.includes('corrupt')) return getMessageSafely('corrupted_data');

    return typeMessages.default;
  };

  const getNotificationDuration = (error: AppError): number => {
    switch (error.severity) {
      case 'critical':
        return 0; // Never auto-close
      case 'high':
        return 10000; // 10 seconds
      case 'medium':
        return 7000; // 7 seconds
      case 'low':
        return 5000; // 5 seconds
      default:
        return defaultDuration;
    }
  };

  const addNotification = (notification: ErrorNotification) => {
    setNotifications(prev => {
      // Remove oldest notifications if we exceed the limit
      const updated = prev.length >= maxNotifications 
        ? prev.slice(-(maxNotifications - 1))
        : prev;
      
      return [...updated, notification];
    });

    // Auto-close notification if specified
    if (notification.autoClose && notification.duration && notification.duration > 0) {
      setTimeout(() => {
        removeNotification(notification.id);
      }, notification.duration);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleRecoveryAction = async (notification: ErrorNotification, action: ErrorRecoveryAction) => {
    try {
      // Mark that user is attempting recovery
      if (notification.error) {
        errorLogger.addUserAction(notification.error.id, `User clicked: ${action.label}`);
      }

      // Execute the recovery action
      await action.action();

      // If the action doesn't reload the page, show success
      setTimeout(() => {
        addNotification({
          id: `recovery_success_${Date.now()}`,
          type: 'success',
          title: 'Recuperación Exitosa',
          message: `${action.label} completado correctamente.`,
          autoClose: true,
          duration: 3000
        });
        
        // Remove the original error notification
        removeNotification(notification.id);
      }, 500);

    } catch (error) {
      console.error('Recovery action failed:', error);
      
      addNotification({
        id: `recovery_failed_${Date.now()}`,
        type: 'error',
        title: 'Error en Recuperación',
        message: `No se pudo completar: ${action.label}. Intenta otra opción.`,
        autoClose: true,
        duration: 5000
      });
    }
  };

  const getPositionClasses = () => {
    const positions = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'top-center': 'top-4 left-1/2 transform -translate-x-1/2'
    };
    return positions[position];
  };

  const getNotificationIcon = (type: NotificationType) => {
    const icons = {
      error: <XCircle className="w-5 h-5 text-red-500" />,
      warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
      info: <Info className="w-5 h-5 text-blue-500" />,
      success: <CheckCircle className="w-5 h-5 text-green-500" />
    };
    return icons[type];
  };

  const getNotificationStyles = (type: NotificationType) => {
    const styles = {
      error: 'bg-red-50 border-red-200 text-red-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800',
      success: 'bg-green-50 border-green-200 text-green-800'
    };
    return styles[type];
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className={`fixed ${getPositionClasses()} z-50 space-y-2 max-w-md w-full`}>
      {notifications.map((notification) => (
        <Card 
          key={notification.id} 
          className={`${getNotificationStyles(notification.type)} border shadow-lg animate-in slide-in-from-right duration-300`}
        >
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {getNotificationIcon(notification.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm">{notification.title}</h4>
                <p className="text-sm mt-1 leading-relaxed">{notification.message}</p>
                
                {/* Recovery Actions */}
                {notification.actions && notification.actions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {notification.actions.slice(0, 2).map((action) => (
                        <Button
                          key={action.id}
                          onClick={() => handleRecoveryAction(notification, action)}
                          variant={action.primary ? "default" : "outline"}
                          size="sm"
                          className="text-xs"
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          {action.label}
                        </Button>
                      ))}
                    </div>
                    
                    {/* Additional actions */}
                    {notification.actions.length > 2 && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                          Más opciones ({notification.actions.length - 2})
                        </summary>
                        <div className="mt-2 space-y-1">
                          {notification.actions.slice(2).map((action) => (
                            <Button
                              key={action.id}
                              onClick={() => handleRecoveryAction(notification, action)}
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start text-xs h-8"
                            >
                              <ExternalLink className="w-3 h-3 mr-2" />
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                )}

                {/* Help text for specific errors */}
                {notification.error && (
                  <div className="mt-2 text-xs opacity-75">
                    {getHelpText(notification.error)}
                  </div>
                )}
              </div>
              
              {/* Close button */}
              {!notification.persistent && (
                <button
                  type="button"
                  onClick={() => removeNotification(notification.id)}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={`Cerrar notificación: ${notification.title}`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const getHelpText = (error: AppError): string => {
  const helpTexts = {
    network: 'Tip: Verifica que tu conexión a internet esté funcionando correctamente.',
    auth: 'Tip: Si el problema persiste, cierra sesión y vuelve a iniciar sesión.',
    validation: 'Tip: Revisa que todos los campos estén completos y en el formato correcto.',
    ai: 'Tip: Puedes cambiar el modelo de IA en Configuración si el problema continúa.',
    storage: 'Tip: Intenta limpiar la caché del navegador si el problema persiste.'
  };
  
  return helpTexts[error.type] || 'Tip: Si el problema persiste, contacta al soporte técnico.';
};

// Hook for programmatic notifications
export const useErrorNotifications = () => {
  const [errorLogger] = useState(() => ErrorLogger.getInstance());

  const showNotification = (notification: Omit<ErrorNotification, 'id'>) => {
    const error = errorLogger.logError({
      type: 'validation',
      severity: notification.type === 'error' ? 'high' : 'low',
      message: notification.message,
      userMessage: notification.message,
      recoverable: true,
      retryable: false
    });
    
    return error.id;
  };

  const showSuccess = (message: string, title = 'Éxito') => {
    return showNotification({
      type: 'success',
      title,
      message,
      autoClose: true,
      duration: 3000
    });
  };

  const showError = (message: string, title = 'Error') => {
    return showNotification({
      type: 'error',
      title,
      message,
      autoClose: false
    });
  };

  const showWarning = (message: string, title = 'Advertencia') => {
    return showNotification({
      type: 'warning',
      title,
      message,
      autoClose: true,
      duration: 5000
    });
  };

  const showInfo = (message: string, title = 'Información') => {
    return showNotification({
      type: 'info',
      title,
      message,
      autoClose: true,
      duration: 4000
    });
  };

  return {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};

export default ErrorNotificationSystem;