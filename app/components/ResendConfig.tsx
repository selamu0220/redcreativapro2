'use client';

import React, { useState, useEffect } from 'react';
import { X, Mail, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';

interface ResendConfigProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigured?: () => void;
}

const ResendConfig: React.FC<ResendConfigProps> = ({ isOpen, onClose, onConfigured }) => {
  const [resendApiKey, setResendApiKey] = useState('');
  const [resendFromEmail, setResendFromEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Cargar configuración existente
      const savedApiKey = localStorage.getItem('resend_api_key') || '';
      const savedFromEmail = localStorage.getItem('resend_from_email') || '';
      setResendApiKey(savedApiKey);
      setResendFromEmail(savedFromEmail);
      setTestResult(null);
    }
  }, [isOpen]);

  const saveConfiguration = async () => {
    if (!resendApiKey || !resendFromEmail) {
      setTestResult({ success: false, message: 'Por favor completa ambos campos' });
      return;
    }

    try {
      setIsLoading(true);
      
      // Obtener el email del usuario desde localStorage
      const userEmail = localStorage.getItem('userEmail') || localStorage.getItem('user_email') || localStorage.getItem('email');
      
      if (!userEmail) {
        setTestResult({ success: false, message: 'Error: No se encontró el email del usuario. Por favor inicia sesión nuevamente.' });
        return;
      }
      
      // Guardar en localStorage
      localStorage.setItem('resend_api_key', resendApiKey);
      localStorage.setItem('resend_from_email', resendFromEmail);
      localStorage.setItem('selectedEmailProvider', 'resend');
      
      // Guardar en base de datos
      const response = await fetch('/api/user/email-provider', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': userEmail,
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        },
        body: JSON.stringify({
          provider: 'resend',
          config: {
            resendApiKey,
            resendFromEmail
          }
        }),
      });

      if (response.ok) {
        setTestResult({ success: true, message: 'Configuración guardada exitosamente' });
        setTimeout(() => {
          onConfigured?.();
          onClose();
        }, 1500);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error del servidor: ${response.status}`);
      }
    } catch (error: any) {
      console.error('Error saving Resend config:', error);
      setTestResult({ success: false, message: `Error al guardar la configuración: ${error.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  const testConfiguration = async () => {
    if (!resendApiKey || !resendFromEmail) {
      setTestResult({ success: false, message: 'Por favor completa ambos campos primero' });
      return;
    }

    try {
      setIsLoading(true);
      setTestResult(null);
      
      // Guardar temporalmente la configuración para la prueba
      localStorage.setItem('resend_api_key', resendApiKey);
      localStorage.setItem('resend_from_email', resendFromEmail);
      localStorage.setItem('selectedEmailProvider', 'resend');
      
      // Enviar email de prueba usando la API interna
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        },
        body: JSON.stringify({
          to: resendFromEmail, // Enviar a sí mismo para prueba
          subject: 'Prueba de configuración Resend',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #2563eb;">✅ Configuración de Resend exitosa</h2>
              <p>Tu configuración de Resend está funcionando correctamente.</p>
              <p><strong>Email remitente:</strong> ${resendFromEmail}</p>
              <p><strong>Fecha de prueba:</strong> ${new Date().toLocaleString()}</p>
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px;">Este es un email de prueba generado automáticamente.</p>
            </div>
          `,
          isTest: true
        }),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setTestResult({ 
          success: true, 
          message: 'Email de prueba enviado exitosamente. Revisa tu bandeja de entrada.' 
        });
      } else {
        throw new Error(result.error || 'Error al enviar email de prueba');
      }
    } catch (error: any) {
      console.error('Error testing Resend:', error);
      setTestResult({ 
        success: false, 
        message: `Error: ${error.message || 'No se pudo enviar el email de prueba'}` 
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div className="flex items-center space-x-3">
            <Mail className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-white">Configurar Resend</h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Información destacada sobre Resend */}
          <div className="bg-gradient-to-r from-blue-600/20 to-green-600/20 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-2xl">⭐</span>
              <h3 className="text-lg font-semibold text-white">Recomendado: Resend</h3>
            </div>
            <p className="text-blue-200 mb-4">
              La mejor opción para envío de emails. API moderna, confiable y fácil de configurar.
            </p>
            <ol className="text-sm text-blue-300/90 space-y-1">
              <li>1. Ve a <a href="https://resend.com" target="_blank" className="underline text-blue-200 hover:text-blue-100">resend.com</a> y crea una cuenta gratuita</li>
              <li>2. Genera una API Key en tu dashboard</li>
              <li>3. Configura tu email remitente</li>
              <li>4. ¡Listo para enviar emails profesionales!</li>
            </ol>
          </div>

          {/* Campos de configuración */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Email remitente *
              </label>
              <input
                type="email"
                value={resendFromEmail}
                onChange={(e) => setResendFromEmail(e.target.value)}
                placeholder="noreply@tudominio.com"
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              <p className="text-xs text-zinc-400 mt-1">
                Usa tu dominio verificado o onboarding@resend.dev para pruebas
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Resend API Key *
              </label>
              <input
                type="password"
                value={resendApiKey}
                onChange={(e) => setResendApiKey(e.target.value)}
                placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              <p className="text-xs text-zinc-400 mt-1">
                Obtén tu API key en{' '}
                <a 
                  href="https://resend.com/api-keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline inline-flex items-center gap-1"
                >
                  resend.com/api-keys
                  <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
          </div>

          {/* Resultado de prueba */}
          {testResult && (
            <div className={`p-4 rounded-lg border ${
              testResult.success 
                ? 'bg-green-900/20 border-green-800/50 text-green-200' 
                : 'bg-red-900/20 border-red-800/50 text-red-200'
            }`}>
              <div className="flex items-center space-x-2">
                {testResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                )}
                <span className="text-sm">{testResult.message}</span>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-zinc-800">
            <button
              onClick={testConfiguration}
              disabled={isLoading || !resendApiKey || !resendFromEmail}
              className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <span>🧪</span>
              <span>{isLoading ? 'Probando...' : 'Probar'}</span>
            </button>
            
            <button
              onClick={saveConfiguration}
              disabled={isLoading || !resendApiKey || !resendFromEmail}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <span>💾</span>
              <span>{isLoading ? 'Guardando...' : 'Guardar y Usar'}</span>
            </button>
            
            <button
              onClick={onClose}
              className="bg-zinc-800 border border-zinc-700 text-zinc-300 px-4 py-2 rounded-md text-sm hover:bg-zinc-700 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResendConfig;