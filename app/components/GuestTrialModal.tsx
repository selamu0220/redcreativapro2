'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useGuestTrial } from '../hooks/useGuestTrial';

interface GuestTrialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTrial: () => void;
  toolName: string;
}

export default function GuestTrialModal({ isOpen, onClose, onStartTrial, toolName }: GuestTrialModalProps) {
  const { timeRemainingSeconds, canStartTrial, isTrialExpired, getTimeRemaining, getNextResetDate } = useGuestTrial();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen && !isVisible) return null;

  const timeRemaining = getTimeRemaining();
  const nextReset = getNextResetDate();

  const handleStartTrial = () => {
    onStartTrial();
    onClose();
  };

  return (
    <div className={`fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      <div className={`bg-background rounded-xl max-w-md w-full transform transition-all duration-300 ${
        isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
      }`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">🚀 Prueba Gratuita</h2>
              <p className="text-sm text-muted-foreground">{toolName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          {canStartTrial ? (
            <div className="space-y-4">
              {/* Time Available */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Tiempo disponible esta semana:</span>
                  <span className="text-lg font-bold text-primary">{timeRemaining.formatted}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(timeRemainingSeconds / 180) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  ⏰ 3 minutos gratis por semana sin registro
                </p>
              </div>

              {/* Features */}
              <div className="space-y-2">
                <h3 className="font-medium text-foreground">✨ Lo que puedes hacer:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Probar todas las funciones de {toolName}</li>
                  <li>• Generar contenido con IA</li>
                  <li>• Experimentar sin límites durante 3 minutos</li>
                </ul>
              </div>

              {/* CTA */}
              <div className="space-y-3">
                <button
                  onClick={handleStartTrial}
                  className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition-all duration-200 hover:scale-105 hover:shadow-lg"
                >
                  🚀 Comenzar Prueba Gratuita
                </button>
                
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-2">
                    ¿Quieres acceso ilimitado?
                  </p>
                  <Link
                    href="/auth"
                    className="text-primary hover:text-primary/80 text-sm font-medium underline hover:scale-105 transition-transform duration-200 inline-block"
                  >
                    Regístrate gratis aquí
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Trial Expired */}
              <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-destructive">⏰</span>
                  <span className="font-medium text-destructive">Tiempo agotado esta semana</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Has usado tus 3 minutos gratuitos de esta semana.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Se renueva el: {nextReset.toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>

              {/* Benefits of registering */}
              <div className="space-y-2">
                <h3 className="font-medium text-foreground">🎯 Con una cuenta gratuita obtienes:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 7 días de prueba completa</li>
                  <li>• Acceso a todas las herramientas</li>
                  <li>• Guardado de documentos</li>
                  <li>• Sin límites de tiempo</li>
                </ul>
              </div>

              {/* CTA */}
              <div className="space-y-3">
                <Link
                  href="/auth"
                  className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center justify-center"
                >
                  🎯 Registrarse Gratis
                </Link>
                
                <button
                  onClick={onClose}
                  className="w-full border border-border py-2 px-4 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}