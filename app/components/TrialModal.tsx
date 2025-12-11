'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTrialMode } from '../hooks/useTrialMode';
import { useTranslation } from '../lib/language/context';

interface TrialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTrial: () => void;
  toolName: string;
}

export default function TrialModal({ isOpen, onClose, onStartTrial, toolName }: TrialModalProps) {
  const { trialDaysLeft, isTrialExpired, canUseTrial } = useTrialMode();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`bg-background border border-border rounded-xl max-w-md w-full p-6 shadow-2xl transform transition-all duration-300 ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
        {/* Header */}
        <div className="text-center mb-6 animate-fade-in-up">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 hover:scale-110 transition-transform duration-200 hover:bg-primary/20">
            <span className="text-2xl">🚀</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Prueba {toolName} GRATIS
          </h2>
          <p className="text-muted-foreground">
            Sin registro • Sin tarjeta de crédito
          </p>
        </div>

        {/* Trial Info */}
        {canUseTrial ? (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6 animate-fade-in-up hover:bg-primary/10 transition-all duration-300" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Días de prueba restantes:</span>
              <span className="text-lg font-bold text-primary animate-pulse">{trialDaysLeft} días</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-500 animate-gradient-x"
                style={{ width: `${(trialDaysLeft / 7) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
                ⏰ Prueba Pro de 7 días
              </p>
          </div>
        ) : (
          <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 mb-6 animate-fade-in-up hover:bg-destructive/10 transition-all duration-300" style={{animationDelay: '0.1s'}}>
            <div className="text-center">
              <span className="text-2xl mb-2 block hover:scale-110 transition-transform duration-200">⏰</span>
              <h3 className="font-bold text-foreground mb-2">Prueba expirada</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Has usado tu prueba gratuita de 7 días.
              </p>
              <p className="text-xs text-muted-foreground">
                ✨ Regístrate para continuar usando las funciones
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          {canUseTrial ? (
            <>
              <button
                onClick={() => {
                  onStartTrial();
                  onClose();
                }}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg group"
              >
                <span className="group-hover:animate-bounce inline-block">🚀</span> Comenzar Prueba Pro (7 días)
              </button>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-2">¿Quieres acceso ilimitado?</p>
                <Link
                  href="/auth"
                  className="text-primary hover:text-primary/80 text-sm font-medium underline hover:scale-105 transition-transform duration-200 inline-block"
                >
                  Regístrate gratis aquí
                </Link>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/auth"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-4 rounded-lg font-medium transition-all duration-200 text-center block hover:scale-105 hover:shadow-lg group"
              >
                <span className="group-hover:animate-bounce inline-block">🎯</span> Registrarse para Acceso Ilimitado
              </Link>
              <p className="text-center text-xs text-muted-foreground">
                El registro es 100% gratuito
              </p>
            </>
          )}
          
          <button
            onClick={onClose}
            className="w-full border border-border hover:bg-muted py-3 px-4 rounded-lg font-medium transition-all duration-200 text-muted-foreground hover:scale-105 hover:shadow-md"
          >
            Cerrar
          </button>
        </div>

        {/* Benefits */}
        <div className="mt-6 pt-4 border-t border-border animate-fade-in-up" style={{animationDelay: '0.3s'}}>
          <p className="text-xs text-muted-foreground text-center mb-2">Con registro gratuito obtienes:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center text-muted-foreground hover:text-foreground transition-colors duration-200 hover:scale-105 transform">
              <span className="text-green-500 mr-1 hover:scale-110 transition-transform duration-200">✓</span>
              Chat IA ilimitado
            </div>
            <div className="flex items-center text-muted-foreground hover:text-foreground transition-colors duration-200 hover:scale-105 transform">
              <span className="text-green-500 mr-1 hover:scale-110 transition-transform duration-200">✓</span>
              Envío de emails
            </div>
            <div className="flex items-center text-muted-foreground hover:text-foreground transition-colors duration-200 hover:scale-105 transform">
              <span className="text-blue-500 mr-1 hover:scale-110 transition-transform duration-200">💰</span>
              Escritor IA (Plan Pro)
            </div>
            <div className="flex items-center text-muted-foreground hover:text-foreground transition-colors duration-200 hover:scale-105 transform">
              <span className="text-green-500 mr-1 hover:scale-110 transition-transform duration-200">✓</span>
              Sin límites diarios
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}