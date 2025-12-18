"use client";

import React, { useState } from 'react';
import { Send, Star, MessageSquare, Camera, Paperclip, CheckCircle, AlertCircle } from 'lucide-react';
import { AppError } from '@/app/lib/error-logging/ErrorLogger';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Textarea } from '@/app/components/ui/textarea';

interface ErrorReportingSystemProps {
  error: AppError;
  onReportSubmitted?: (reportId: string) => void;
  className?: string;
}

interface ErrorReport {
  errorId: string;
  userFeedback: string;
  severity: number; // 1-5 stars
  category: string;
  reproductionSteps: string;
  expectedBehavior: string;
  actualBehavior: string;
  userAgent: string;
  url: string;
  timestamp: Date;
  attachments: File[];
  contactInfo?: string;
  allowFollowUp: boolean;
}

type ReportCategory = 
  | 'bug' 
  | 'performance' 
  | 'usability' 
  | 'feature_request' 
  | 'documentation' 
  | 'other';

export const ErrorReportingSystem: React.FC<ErrorReportingSystemProps> = ({
  error,
  onReportSubmitted,
  className = ''
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [reportId, setReportId] = useState<string>('');
  
  // Form state
  const [userFeedback, setUserFeedback] = useState('');
  const [severity, setSeverity] = useState(3);
  const [category, setCategory] = useState<ReportCategory>('bug');
  const [reproductionSteps, setReproductionSteps] = useState('');
  const [expectedBehavior, setExpectedBehavior] = useState('');
  const [actualBehavior, setActualBehavior] = useState(error.userMessage);
  const [contactInfo, setContactInfo] = useState('');
  const [allowFollowUp, setAllowFollowUp] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);

  const categories: { value: ReportCategory; label: string; description: string }[] = [
    { 
      value: 'bug', 
      label: 'Error/Bug', 
      description: 'Algo no funciona como debería' 
    },
    { 
      value: 'performance', 
      label: 'Rendimiento', 
      description: 'La aplicación es lenta o consume muchos recursos' 
    },
    { 
      value: 'usability', 
      label: 'Usabilidad', 
      description: 'Es difícil de usar o confuso' 
    },
    { 
      value: 'feature_request', 
      label: 'Solicitud de función', 
      description: 'Sugerir una nueva característica' 
    },
    { 
      value: 'documentation', 
      label: 'Documentación', 
      description: 'Información faltante o incorrecta' 
    },
    { 
      value: 'other', 
      label: 'Otro', 
      description: 'Otro tipo de problema o sugerencia' 
    }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      // Limit file size to 5MB
      if (file.size > 5 * 1024 * 1024) {
        alert(`El archivo ${file.name} es demasiado grande. Máximo 5MB.`);
        return false;
      }
      // Allow common file types
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'text/plain', 'application/json', 'text/csv',
        'application/pdf'
      ];
      if (!allowedTypes.includes(file.type)) {
        alert(`Tipo de archivo no permitido: ${file.name}`);
        return false;
      }
      return true;
    });
    
    setAttachments(prev => [...prev, ...validFiles].slice(0, 3)); // Max 3 files
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const generateReportId = (): string => {
    return `report_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  };

  const captureScreenshot = async (): Promise<void> => {
    try {
      // Use the Screen Capture API if available
      if ('getDisplayMedia' in navigator.mediaDevices) {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        });
        
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();
        
        video.addEventListener('loadedmetadata', () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(video, 0, 0);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], `screenshot_${Date.now()}.png`, {
                type: 'image/png'
              });
              setAttachments(prev => [...prev, file].slice(0, 3));
            }
          });
          
          // Stop the stream
          stream.getTracks().forEach(track => track.stop());
        });
      } else {
        alert('La captura de pantalla no está disponible en este navegador.');
      }
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      alert('No se pudo capturar la pantalla. Puedes subir una imagen manualmente.');
    }
  };

  const validateForm = (): boolean => {
    if (!userFeedback.trim()) {
      alert('Por favor, describe el problema o tu feedback.');
      return false;
    }
    
    if (category === 'bug' && !reproductionSteps.trim()) {
      alert('Para reportes de bugs, por favor describe los pasos para reproducir el problema.');
      return false;
    }
    
    return true;
  };

  const submitReport = async (): Promise<void> => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const newReportId = generateReportId();
      
      const report: ErrorReport = {
        errorId: error.id,
        userFeedback: userFeedback.trim(),
        severity,
        category,
        reproductionSteps: reproductionSteps.trim(),
        expectedBehavior: expectedBehavior.trim(),
        actualBehavior: actualBehavior.trim(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date(),
        attachments,
        contactInfo: contactInfo.trim() || undefined,
        allowFollowUp
      };

      // In a real implementation, you would send this to your backend
      // For now, we'll store it locally and simulate the API call
      await simulateReportSubmission(report, newReportId);
      
      setReportId(newReportId);
      setIsSubmitted(true);
      
      if (onReportSubmitted) {
        onReportSubmitted(newReportId);
      }
      
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Error al enviar el reporte. Por favor, intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const simulateReportSubmission = async (report: ErrorReport, reportId: string): Promise<void> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Store in localStorage for now (in production, send to backend)
    try {
      const existingReports = JSON.parse(localStorage.getItem('error_reports') || '[]');
      existingReports.push({
        id: reportId,
        ...report,
        timestamp: report.timestamp.toISOString(),
        // Don't store actual file objects, just metadata
        attachments: report.attachments.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type
        }))
      });
      
      // Keep only last 50 reports
      if (existingReports.length > 50) {
        existingReports.splice(0, existingReports.length - 50);
      }
      
      localStorage.setItem('error_reports', JSON.stringify(existingReports));
      
      // Also log to console for development
      console.log('Error report submitted:', { id: reportId, report });
      
    } catch (e) {
      console.error('Failed to store error report:', e);
    }
  };

  if (isSubmitted) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            ¡Reporte Enviado!
          </h3>
          <p className="text-gray-600 mb-4">
            Gracias por tu feedback. Tu reporte ha sido enviado correctamente.
          </p>
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-700">
              <strong>ID del reporte:</strong> <code className="bg-white px-2 py-1 rounded text-xs">{reportId}</code>
            </p>
          </div>
          {allowFollowUp && contactInfo && (
            <p className="text-sm text-gray-600">
              Te contactaremos en <strong>{contactInfo}</strong> si necesitamos más información.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          <span>Reportar Problema</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Ayúdanos a mejorar reportando este error o compartiendo tu feedback.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de reporte
          </label>
          <div className="grid grid-cols-1 gap-2">
            {categories.map((cat) => (
              <label key={cat.value} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  value={cat.value}
                  checked={category === cat.value}
                  onChange={(e) => setCategory(e.target.value as ReportCategory)}
                  className="text-blue-600"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">{cat.label}</div>
                  <div className="text-xs text-gray-600">{cat.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Severity Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ¿Qué tan grave es este problema? ({severity}/5)
          </label>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setSeverity(star)}
                className={`p-1 ${star <= severity ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
                aria-label={`Calificar severidad como ${star} de 5 estrellas`}
                title={`Severidad: ${star}/5`}
              >
                <Star className="h-6 w-6 fill-current" />
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-1">
            1 = Menor inconveniente, 5 = Problema crítico
          </p>
        </div>

        {/* User Feedback */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Describe el problema o tu feedback *
          </label>
          <Textarea
            value={userFeedback}
            onChange={(e) => setUserFeedback(e.target.value)}
            placeholder="Describe qué estaba pasando cuando ocurrió el error, qué esperabas que pasara, y cualquier información adicional que pueda ser útil..."
            rows={4}
            className="w-full"
          />
        </div>

        {/* Reproduction Steps (for bugs) */}
        {category === 'bug' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pasos para reproducir el problema *
            </label>
            <Textarea
              value={reproductionSteps}
              onChange={(e) => setReproductionSteps(e.target.value)}
              placeholder="1. Hice clic en...&#10;2. Escribí...&#10;3. Entonces vi..."
              rows={3}
              className="w-full"
            />
          </div>
        )}

        {/* Expected vs Actual Behavior */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ¿Qué esperabas que pasara?
            </label>
            <Textarea
              value={expectedBehavior}
              onChange={(e) => setExpectedBehavior(e.target.value)}
              placeholder="Describe el comportamiento esperado..."
              rows={2}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ¿Qué pasó en realidad?
            </label>
            <Textarea
              value={actualBehavior}
              onChange={(e) => setActualBehavior(e.target.value)}
              rows={2}
              className="w-full"
            />
          </div>
        </div>

        {/* Attachments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Archivos adjuntos (opcional)
          </label>
          <div className="space-y-2">
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('file-upload')?.click()}
                className="flex items-center space-x-1"
              >
                <Paperclip className="h-4 w-4" />
                <span>Subir archivo</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={captureScreenshot}
                className="flex items-center space-x-1"
              >
                <Camera className="h-4 w-4" />
                <span>Capturar pantalla</span>
              </Button>
            </div>
            
            <input
              id="file-upload"
              type="file"
              multiple
              accept="image/*,.txt,.json,.csv,.pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            {attachments.length > 0 && (
              <div className="space-y-1">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 rounded p-2">
                    <span className="text-sm text-gray-700 truncate">
                      {file.name} ({Math.round(file.size / 1024)}KB)
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            <p className="text-xs text-gray-600">
              Máximo 3 archivos, 5MB cada uno. Formatos: imágenes, texto, JSON, CSV, PDF.
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email de contacto (opcional)
          </label>
          <input
            type="email"
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
            placeholder="tu@email.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Email de contacto opcional"
            title="Ingresa tu email si deseas que te contactemos sobre este reporte"
          />
          <div className="mt-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={allowFollowUp}
                onChange={(e) => setAllowFollowUp(e.target.checked)}
                className="text-blue-600"
              />
              <span className="text-sm text-gray-700">
                Permitir que nos contactemos para seguimiento
              </span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button
            type="button"
            onClick={submitReport}
            disabled={isSubmitting}
            className="flex items-center space-x-2"
          >
            {isSubmitting ? (
              <AlertCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span>{isSubmitting ? 'Enviando...' : 'Enviar Reporte'}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ErrorReportingSystem;