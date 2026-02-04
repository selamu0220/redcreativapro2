'use client';

import React, { useState } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import {
  Phone,
  Calendar,
  MessageSquare,
  Send,
  User,
  Mail,
  ExternalLink,
  Heart
} from 'lucide-react';
import { toast } from 'sonner';
import { OptimizedImage } from '@/app/components/OptimizedImage';

export default function ContactPage() {
  const { user } = useAuth();
  const [suggestion, setSuggestion] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendSuggestion = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para enviar sugerencias');
      return;
    }

    if (!suggestion.trim()) {
      toast.error('Por favor, escribe tu sugerencia');
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/contact/suggestion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          message: suggestion.trim()
        }),
      });

      if (response.ok) {
        toast.success('¡Sugerencia enviada exitosamente!');
        setSuggestion('');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al enviar la sugerencia');
      }
    } catch (error) {
      console.error('Error sending suggestion:', error);
      toast.error('Error al enviar la sugerencia');
    } finally {
      setSending(false);
    }
  };

  const creatorPhotoUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400&h=400";
  const meetingUrl = "https://calendly.com/redcreativapro/reunion-feedback";

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Contacta con el Creador
        </h1>
        <p className="text-gray-600">
          ¿Tienes preguntas, sugerencias o necesitas ayuda? ¡Estoy aquí para ayudarte!
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Creator Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Sobre el Creador
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Creator Photo */}
            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-blue-100">
                <OptimizedImage
                  src={creatorPhotoUrl}
                  alt="Creador de Red Creativa Pro"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Creador de Red Creativa Pro
              </h3>
              <p className="text-gray-600 text-sm">
                Desarrollador y emprendedor creativo
              </p>
            </div>

            {/* Contact Methods */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Phone className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Teléfono Directo</p>
                  <a
                    href="tel:+34686887074"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    +34 686 887 074
                  </a>
                  <p className="text-xs text-gray-500">
                    Para cancelaciones y soporte urgente
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <Calendar className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Agendar Reunión</p>
                  <p className="text-xs text-gray-500 mb-2">
                    Reserva una llamada para feedback personalizado
                  </p>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => window.open(meetingUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Agendar Ahora
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Mail className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium text-gray-900">Email de Contacto</p>
                  <a
                    href="mailto:contacto@redcreativapro.com"
                    className="text-purple-600 hover:text-purple-800 text-sm"
                  >
                    contacto@redcreativapro.com
                  </a>
                  <p className="text-xs text-gray-500">
                    Respuesta en 24-48 horas
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Suggestion Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Envía tu Sugerencia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tu mensaje o sugerencia
                  </label>
                  <textarea
                    value={suggestion}
                    onChange={(e) => setSuggestion(e.target.value)}
                    placeholder="Comparte tus ideas, reporta problemas, o sugiere mejoras..."
                    className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    maxLength={1000}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {suggestion.length}/1000 caracteres
                  </p>
                </div>

                <Button
                  onClick={handleSendSuggestion}
                  disabled={sending || !suggestion.trim()}
                  className="w-full"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Sugerencia
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    Enviando como: {user.email}
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  Inicia sesión para enviar sugerencias y feedback
                </p>
                <Button
                  onClick={() => window.location.href = '/login'}
                  className="w-full"
                >
                  Iniciar Sesión
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Resources */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Recursos Adicionales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Centro de Ayuda</h4>
              <p className="text-sm text-gray-600 mb-3">
                Encuentra respuestas a preguntas frecuentes
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/help'}
              >
                Ver Ayuda
              </Button>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Documentación</h4>
              <p className="text-sm text-gray-600 mb-3">
                Guías detalladas de uso de herramientas
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/docs'}
              >
                Ver Docs
              </Button>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Estado del Sistema</h4>
              <p className="text-sm text-gray-600 mb-3">
                Verifica el estado de nuestros servicios
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://status.redcreativapro.com', '_blank')}
              >
                Ver Estado
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Google Drive Link */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">
              ¿Necesitas compartir archivos o documentos?
            </p>
            <Button
              variant="outline"
              onClick={() => window.open('https://drive.google.com/drive/folders/shared-folder-id', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Acceder a Google Drive Compartido
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
