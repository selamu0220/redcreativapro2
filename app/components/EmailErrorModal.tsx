'use client';

import React from 'react';
import { X, Settings, Mail, ExternalLink } from 'lucide-react';

interface EmailErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorType: 'resend' | 'gmail' | 'general';
  errorMessage?: string;
}

const EmailErrorModal: React.FC<EmailErrorModalProps> = ({
  isOpen,
  onClose,
  errorType,
  errorMessage
}) => {
  if (!isOpen) return null;

  const getErrorContent = () => {
    switch (errorType) {
      case 'resend':
        return {
          title: '🔧 Error de Configuración - Resend',
          description: 'Hay un problema con la configuración de Resend. Verifica tu API key y configuración.',
          recommendations: [
            'Verifica que tu API key de Resend sea válida',
            'Asegúrate de que el dominio esté verificado',
            'Revisa los límites de tu plan de Resend'
          ],
          actionText: 'Revisar Configuración'
        };
      case 'gmail':
        return {
          title: '📧 Error de Configuración - Gmail SMTP',
          description: 'Hay un problema con la configuración de Gmail SMTP. Revisa tus credenciales.',
          recommendations: [
            'Verifica tu email y contraseña de aplicación',
            'Asegúrate de tener habilitada la autenticación de 2 factores',
            'Genera una nueva contraseña de aplicación si es necesario'
          ],
          actionText: 'Revisar Configuración'
        };
      default:
        return {
          title: '❌ Error de Envío de Email',
          description: errorMessage || 'Ha ocurrido un error al enviar el email. Por favor, revisa tu configuración.',
          recommendations: [
            'Verifica tu conexión a internet',
            'Revisa la configuración de tu proveedor de email',
            'Intenta nuevamente en unos momentos'
          ],
          actionText: 'Ir a Configuración'
        };
    }
  };

  const content = getErrorContent();

  const handleGoToSettings = () => {
    window.location.href = '/ajustes';
  };

  const handleLearnMore = () => {
    if (errorType === 'resend') {
      window.open('https://resend.com/docs', '_blank');
    } else if (errorType === 'gmail') {
      window.open('https://support.google.com/accounts/answer/185833', '_blank');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Configuración de Email
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-base font-medium text-gray-900 mb-2">
              {content.title}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {content.description}
            </p>
          </div>

          {/* Recommendations */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              💡 Recomendaciones:
            </h4>
            <ul className="space-y-2">
              {content.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start text-sm text-gray-600">
                  <span className="text-blue-500 mr-2 mt-0.5">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleGoToSettings}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              <Settings size={16} className="mr-2" />
              {content.actionText}
            </button>
            
            {errorType !== 'general' && (
              <button
                onClick={handleLearnMore}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                <ExternalLink size={16} className="mr-2" />
                Más Información
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
          <div className="flex items-center text-xs text-gray-500">
            <Mail size={14} className="mr-1" />
            <span>Configura tu proveedor de email preferido para continuar</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailErrorModal;