"use client";

import React, { useState } from 'react';
import { HelpCircle, X, ExternalLink, Lightbulb } from 'lucide-react';
import { AppError, ErrorType } from '@/app/lib/error-logging/ErrorLogger';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';

interface ContextualHelpTooltipProps {
  error: AppError;
  className?: string;
}

interface HelpContent {
  title: string;
  description: string;
  steps: string[];
  preventionTips: string[];
  relatedLinks?: { label: string; url: string }[];
}

const getHelpContent = (error: AppError): HelpContent => {
  const helpDatabase: Record<ErrorType, Record<string, HelpContent>> = {
    network: {
      default: {
        title: 'Problemas de Conexión',
        description: 'Tu dispositivo no puede conectarse a nuestros servidores.',
        steps: [
          'Verifica que tu conexión a internet esté funcionando',
          'Intenta recargar la página (Ctrl+F5 o Cmd+R)',
          'Desactiva temporalmente VPN o proxy si los usas',
          'Verifica que no haya restricciones de firewall'
        ],
        preventionTips: [
          'Mantén una conexión estable durante el uso',
          'Evita cambiar de red mientras trabajas',
          'Guarda tu trabajo frecuentemente'
        ],
        relatedLinks: [
          { label: 'Test de velocidad', url: 'https://fast.com' },
          { label: 'Estado del servicio', url: '/estado-servicio' }
        ]
      },
      timeout: {
        title: 'Tiempo de Espera Agotado',
        description: 'La operación tardó demasiado tiempo en completarse.',
        steps: [
          'Espera unos segundos e intenta de nuevo',
          'Verifica la velocidad de tu conexión',
          'Reduce el tamaño del contenido si es muy largo',
          'Intenta en un horario de menor tráfico'
        ],
        preventionTips: [
          'Trabaja con textos más cortos',
          'Evita múltiples operaciones simultáneas',
          'Usa una conexión más rápida si es posible'
        ]
      },
      offline: {
        title: 'Sin Conexión a Internet',
        description: 'Tu dispositivo está desconectado de internet.',
        steps: [
          'Verifica que tu WiFi o datos móviles estén activados',
          'Intenta conectarte a una red diferente',
          'Reinicia tu router o módem si usas WiFi',
          'Tu trabajo se guardará automáticamente cuando se restaure la conexión'
        ],
        preventionTips: [
          'Activa el modo offline para trabajar sin conexión',
          'Guarda tu trabajo localmente con frecuencia',
          'Usa una conexión de respaldo cuando sea posible'
        ],
        relatedLinks: [
          { label: 'Modo offline', url: '#offline-mode' },
          { label: 'Configuración de red', url: '#network-settings' }
        ]
      }
    },
    auth: {
      default: {
        title: 'Problemas de Autenticación',
        description: 'No se pudo verificar tu identidad o permisos.',
        steps: [
          'Cierra sesión y vuelve a iniciar sesión',
          'Limpia las cookies del navegador',
          'Verifica que tu cuenta esté activa',
          'Contacta soporte si el problema persiste'
        ],
        preventionTips: [
          'No compartas tu cuenta con otros',
          'Usa contraseñas seguras',
          'Mantén tu navegador actualizado'
        ],
        relatedLinks: [
          { label: 'Iniciar sesión', url: '/auth/login' },
          { label: 'Recuperar contraseña', url: '/auth/reset' }
        ]
      },
      expired: {
        title: 'Sesión Expirada',
        description: 'Tu sesión ha caducado por seguridad.',
        steps: [
          'Haz clic en "Iniciar sesión" para renovar tu sesión',
          'Tu trabajo se guardará automáticamente',
          'Continúa donde lo dejaste después de iniciar sesión'
        ],
        preventionTips: [
          'Mantén la pestaña activa mientras trabajas',
          'Guarda tu trabajo regularmente',
          'Renueva tu sesión antes de que expire'
        ]
      }
    },
    ai: {
      default: {
        title: 'Error del Servicio de IA',
        description: 'El servicio de inteligencia artificial no está respondiendo correctamente.',
        steps: [
          'Espera 30 segundos e intenta de nuevo',
          'Cambia a un modelo de IA diferente en Configuración',
          'Reduce la longitud del texto a procesar',
          'Verifica tu saldo de créditos si tienes cuenta premium'
        ],
        preventionTips: [
          'No envíes múltiples solicitudes muy rápido',
          'Usa textos de longitud moderada',
          'Mantén tu API key actualizada'
        ],
        relatedLinks: [
          { label: 'Configuración de IA', url: '/ajustes' },
          { label: 'Estado de servicios', url: '/estado-servicio' }
        ]
      },
      quota_exceeded: {
        title: 'Límite de Uso Alcanzado',
        description: 'Has alcanzado el límite de solicitudes permitidas.',
        steps: [
          'Espera hasta que se renueve tu cuota (generalmente cada hora)',
          'Considera actualizar a un plan premium',
          'Usa el servicio de manera más eficiente',
          'Revisa tu historial de uso en el dashboard'
        ],
        preventionTips: [
          'Planifica tu uso durante el día',
          'Combina múltiples mejoras en una sola solicitud',
          'Usa la función de auto-mejora con moderación'
        ]
      },
      api_key_invalid: {
        title: 'Clave de API Inválida',
        description: 'La clave de API configurada no es válida o ha expirado.',
        steps: [
          'Ve a Configuración de IA y verifica tu API key',
          'Genera una nueva API key en tu proveedor de IA',
          'Asegúrate de copiar la clave completa sin espacios',
          'Guarda la configuración y prueba de nuevo'
        ],
        preventionTips: [
          'Revisa regularmente la validez de tu API key',
          'Mantén un respaldo de tus claves de API',
          'No compartas tu API key con otros'
        ],
        relatedLinks: [
          { label: 'Configurar API Key', url: '/ajustes' },
          { label: 'OpenRouter Dashboard', url: 'https://openrouter.ai' }
        ]
      },
      model_unavailable: {
        title: 'Modelo de IA No Disponible',
        description: 'El modelo de IA seleccionado no está disponible temporalmente.',
        steps: [
          'Cambia a un modelo alternativo (GPT-4o o Claude)',
          'Verifica el estado del modelo en el dashboard del proveedor',
          'Intenta de nuevo en unos minutos',
          'Considera usar un modelo de respaldo'
        ],
        preventionTips: [
          'Configura múltiples modelos como respaldo',
          'Usa modelos más estables como GPT-4o',
          'Revisa el estado de los servicios regularmente'
        ],
        relatedLinks: [
          { label: 'Seleccionar modelo', url: '/ajustes' },
          { label: 'Estado de modelos', url: 'https://status.openai.com' }
        ]
      },
      content_filtered: {
        title: 'Contenido Filtrado',
        description: 'El contenido fue bloqueado por las políticas de seguridad de la IA.',
        steps: [
          'Revisa tu texto en busca de contenido sensible',
          'Reformula el contenido de manera más neutral',
          'Elimina referencias a temas controvertidos',
          'Intenta con un texto más específico y profesional'
        ],
        preventionTips: [
          'Evita contenido violento, sexual o discriminatorio',
          'Usa un lenguaje profesional y neutral',
          'Enfócate en contenido educativo o informativo'
        ],
        relatedLinks: [
          { label: 'Políticas de uso', url: 'https://openai.com/policies' },
          { label: 'Guía de contenido', url: '/centro-ayuda/contenido-permitido' }
        ]
      },
      rate_limited: {
        title: 'Demasiadas Solicitudes',
        description: 'Has enviado demasiadas solicitudes muy rápido.',
        steps: [
          'Espera 1-2 minutos antes de intentar de nuevo',
          'Desactiva la mejora automática temporalmente',
          'Procesa textos más largos en lugar de múltiples cortos',
          'Considera actualizar a un plan con límites mayores'
        ],
        preventionTips: [
          'Usa la mejora automática con moderación',
          'Agrupa múltiples cambios en una sola solicitud',
          'Configura un retraso mayor en la mejora automática'
        ],
        relatedLinks: [
          { label: 'Configurar retrasos', url: '/ajustes' },
          { label: 'Planes premium', url: '/planes' }
        ]
      }
    },
    validation: {
      default: {
        title: 'Error de Validación',
        description: 'Los datos ingresados no cumplen con los requisitos.',
        steps: [
          'Revisa que todos los campos obligatorios estén completos',
          'Verifica el formato de los datos (email, teléfono, etc.)',
          'Reduce la longitud del texto si es muy largo',
          'Elimina caracteres especiales problemáticos'
        ],
        preventionTips: [
          'Lee las instrucciones de cada campo',
          'Usa formatos estándar para fechas y números',
          'Evita copiar texto con formato desde otros programas'
        ]
      },
      length_exceeded: {
        title: 'Texto Demasiado Largo',
        description: 'El contenido excede la longitud máxima permitida.',
        steps: [
          'Divide el texto en partes más pequeñas',
          'Procesa secciones por separado',
          'Elimina contenido innecesario',
          'Considera actualizar a un plan con límites mayores'
        ],
        preventionTips: [
          'Trabaja con párrafos individuales',
          'Usa la función de división automática',
          'Revisa los límites de tu plan actual'
        ]
      }
    },
    storage: {
      default: {
        title: 'Error de Almacenamiento',
        description: 'No se pudo guardar o recuperar la información.',
        steps: [
          'Verifica que tengas espacio disponible en tu dispositivo',
          'Limpia la caché del navegador',
          'Intenta usar modo incógnito',
          'Descarga una copia de seguridad de tu trabajo'
        ],
        preventionTips: [
          'Limpia regularmente la caché del navegador',
          'Mantén espacio libre en tu dispositivo',
          'Haz copias de seguridad frecuentes'
        ],
        relatedLinks: [
          { label: 'Descargar respaldo', url: '#' },
          { label: 'Gestión de archivos', url: '/documentos' }
        ]
      }
    }
  };

  const errorType = error.type;
  const errorMessage = error.message.toLowerCase();
  
  // Try to find specific help content based on error message
  const typeHelp = helpDatabase[errorType];
  if (!typeHelp) return helpDatabase.validation.default;

  // Match specific error patterns with more comprehensive detection
  if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) return typeHelp.timeout || typeHelp.default;
  if (errorMessage.includes('offline') || errorMessage.includes('no internet') || errorMessage.includes('network unavailable')) return typeHelp.offline || typeHelp.default;
  if (errorMessage.includes('expired') || errorMessage.includes('session') && errorMessage.includes('invalid')) return typeHelp.expired || typeHelp.default;
  if (errorMessage.includes('quota') || errorMessage.includes('limit') || errorMessage.includes('rate limit')) return typeHelp.quota_exceeded || typeHelp.rate_limited || typeHelp.default;
  if (errorMessage.includes('api key') || errorMessage.includes('unauthorized') || errorMessage.includes('invalid key')) return typeHelp.api_key_invalid || typeHelp.default;
  if (errorMessage.includes('model') && (errorMessage.includes('unavailable') || errorMessage.includes('not found'))) return typeHelp.model_unavailable || typeHelp.default;
  if (errorMessage.includes('content') && (errorMessage.includes('filtered') || errorMessage.includes('blocked'))) return typeHelp.content_filtered || typeHelp.default;
  if (errorMessage.includes('rate') && errorMessage.includes('limit')) return typeHelp.rate_limited || typeHelp.default;
  if (errorMessage.includes('length') || errorMessage.includes('too long') || errorMessage.includes('exceeds')) return typeHelp.length_exceeded || typeHelp.default;

  return typeHelp.default;
};

export const ContextualHelpTooltip: React.FC<ContextualHelpTooltipProps> = ({
  error,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const helpContent = getHelpContent(error);

  const handleLinkClick = (url: string) => {
    if (url.startsWith('#')) {
      // Handle internal actions
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
        aria-label="Mostrar ayuda contextual"
      >
        <HelpCircle className="h-4 w-4" />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-25 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Tooltip Card */}
          <Card className="absolute top-8 right-0 w-80 z-50 shadow-lg border-2 border-blue-200 bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-sm font-semibold text-blue-900">
                    {helpContent.title}
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Description */}
              <p className="text-sm text-gray-700 leading-relaxed">
                {helpContent.description}
              </p>

              {/* Steps to resolve */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  Pasos para resolver:
                </h4>
                <ol className="text-sm text-gray-700 space-y-1">
                  {helpContent.steps.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-block w-5 h-5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Prevention tips */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  Consejos de prevención:
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  {helpContent.preventionTips.map((tip, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2 mt-1 flex-shrink-0">•</span>
                      <span className="leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Related links */}
              {helpContent.relatedLinks && helpContent.relatedLinks.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    Enlaces útiles:
                  </h4>
                  <div className="space-y-1">
                    {helpContent.relatedLinks.map((link, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLinkClick(link.url)}
                        className="h-auto p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 justify-start"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        <span className="text-xs">{link.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Error details (collapsible) */}
              <details className="text-xs">
                <summary className="cursor-pointer text-gray-500 hover:text-gray-700 font-medium">
                  Detalles técnicos del error
                </summary>
                <div className="mt-2 p-2 bg-gray-50 rounded text-gray-600 font-mono">
                  <div><strong>Tipo:</strong> {error.type}</div>
                  <div><strong>Severidad:</strong> {error.severity}</div>
                  <div><strong>ID:</strong> {error.id}</div>
                  <div><strong>Hora:</strong> {error.timestamp.toLocaleString()}</div>
                </div>
              </details>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ContextualHelpTooltip;
