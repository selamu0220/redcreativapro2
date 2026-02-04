"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";

/**
 * Widget de Maria (ElevenLabs ConvAI) con opción de minimizar.
 * Se renderiza de forma flotante en la esquina inferior derecha.
 * Cuando está minimizado, solo muestra un botón pequeño para abrirla.
 */
export default function MariaWidget() {
  const [open, setOpen] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [hasMediaSupport, setHasMediaSupport] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Verificar compatibilidad del navegador y cargar script
  useEffect(() => {
    // Verificar soporte para getUserMedia
    const checkMediaSupport = () => {
      if (typeof window !== 'undefined') {
        const hasNavigator = typeof navigator !== 'undefined';
        const hasMediaDevices = hasNavigator && 'mediaDevices' in navigator;
        const hasGetUserMedia = hasMediaDevices && 'getUserMedia' in navigator.mediaDevices;

        setHasMediaSupport(hasGetUserMedia);

        if (!hasGetUserMedia) {
          setError('Tu navegador no soporta acceso al micrófono. Prueba con Chrome, Firefox o Safari actualizado.');
        }
      }
    };

    // Verificar si el script de ElevenLabs ya está cargado
    const checkScriptLoaded = () => {
      if (typeof window !== 'undefined') {
        // Verificar si el elemento personalizado está definido
        const isLoaded = customElements.get('elevenlabs-convai') !== undefined;
        setIsScriptLoaded(isLoaded);

        if (!isLoaded) {
          // Esperar a que se cargue el script
          const checkInterval = setInterval(() => {
            if (customElements.get('elevenlabs-convai')) {
              setIsScriptLoaded(true);
              clearInterval(checkInterval);
            }
          }, 500);

          // Timeout después de 10 segundos
          setTimeout(() => {
            clearInterval(checkInterval);
            if (!customElements.get('elevenlabs-convai')) {
              setError('No se pudo cargar el widget de Maria. Verifica tu conexión a internet.');
            }
          }, 10000);

          return () => clearInterval(checkInterval);
        }
      }
    };

    checkMediaSupport();
    checkScriptLoaded();
  }, []);

  // Manejar la apertura del widget con verificaciones adicionales
  const handleOpenWidget = async () => {
    if (!hasMediaSupport) {
      setError('Tu navegador no soporta acceso al micrófono. Necesitas un navegador compatible para usar Maria.');
      return;
    }

    if (!isScriptLoaded) {
      setError('El widget de Maria aún se está cargando. Inténtalo de nuevo en unos segundos.');
      return;
    }

    // Verificar permisos de micrófono antes de abrir
    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
        // Intentar obtener permisos de micrófono
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Cerrar el stream inmediatamente, solo queríamos verificar permisos
        stream.getTracks().forEach(track => track.stop());
      }

      setError(null);
      setOpen(true);
    } catch (err) {
      console.error('Error al acceder al micrófono:', err);
      setError('Necesitas permitir el acceso al micrófono para usar Maria. Verifica los permisos de tu navegador.');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-2">
      {/* Mensaje de error */}
      {error && (
        <div className="max-w-[300px] bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-300">
          <div className="flex items-start gap-2">
            <span className="text-red-500">⚠️</span>
            <div>
              <p className="font-medium">Error con Maria</p>
              <p className="mt-1">{error}</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 h-6 px-2 text-xs"
                onClick={() => setError(null)}
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Botón minimizado */}
      {!open && (
        <Button
          onClick={handleOpenWidget}
          className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg px-3 py-2 h-auto rounded-full flex items-center gap-2"
          aria-label="Abrir asistente Maria"
          disabled={!hasMediaSupport || !isScriptLoaded}
        >
          <span className={`inline-block w-2 h-2 rounded-full ${hasMediaSupport && isScriptLoaded
            ? 'bg-green-400 animate-pulse'
            : 'bg-yellow-400'
            }`} />
          <span className="text-sm">Maria</span>
          {(!hasMediaSupport || !isScriptLoaded) && (
            <span className="text-xs opacity-75">
              {!isScriptLoaded ? '⏳' : '🚫'}
            </span>
          )}
        </Button>
      )}

      {/* Contenedor del widget cuando está abierto */}
      {open && (
        <div className="w-[360px] max-w-[90vw] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="font-semibold text-slate-900 dark:text-slate-100">Maria</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="h-8 px-2 text-xs"
                onClick={() => setOpen(false)}
                aria-label="Minimizar asistente"
              >
                Minimizar
              </Button>
            </div>
          </div>
          <div className="p-2" ref={widgetRef}>
            {/* Widget de ElevenLabs ConvAI */}
            {isScriptLoaded && hasMediaSupport ? (
              // @ts-ignore - Custom element from ElevenLabs
              <elevenlabs-convai agent-id="agent_3601k6mxy180fhdbbec3kszs2qdp"></elevenlabs-convai>
            ) : (
              <div className="flex items-center justify-center h-32 text-center">
                <div className="text-slate-600 dark:text-slate-400">
                  <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-sm">Cargando Maria...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
