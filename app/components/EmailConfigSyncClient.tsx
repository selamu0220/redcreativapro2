'use client';

import { useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { EmailDebugger } from '../utils/emailDebugger';

// Sistema robusto de sincronización localStorage <-> BD
export function EmailConfigSyncClient() {
  const { user } = useAuth();

  // Función para verificar estado de la red
  const isOnline = useCallback(() => {
    return navigator.onLine;
  }, []);

  // Función para crear fetch con timeout
  const fetchWithTimeout = useCallback(async (url: string, options: RequestInit, timeoutMs: number = 10000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }, []);

  // Función para retry con exponential backoff
  const retryWithBackoff = useCallback(async (
    operation: () => Promise<any>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<any> => {
      let lastError: Error;
      
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          return await operation();
        } catch (error) {
          lastError = error as Error;
          
          // No reintentar en el último intento
          if (attempt === maxRetries) {
            break;
          }
          
          // No reintentar si estamos offline
          if (!isOnline()) {
            EmailDebugger.log('warn', 'EmailConfigSync', 'Sin conexión, cancelando reintentos');
            break;
          }
          
          // Calcular delay con exponential backoff
          const delay = baseDelay * Math.pow(2, attempt);
          EmailDebugger.log('warn', 'EmailConfigSync', `Reintento ${attempt + 1}/${maxRetries} en ${delay}ms`, error);
          
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      throw lastError!;
     },
     [isOnline]
   );

  // Función para sincronizar configuración desde localStorage a BD
  const syncConfigToDB = useCallback(async () => {
    if (!user?.email) {
      EmailDebugger.log('warn', 'EmailConfigSync', 'No hay usuario para sincronizar');
      return;
    }

    // Verificar conexión antes de intentar sincronizar
    if (!isOnline()) {
      EmailDebugger.log('warn', 'EmailConfigSync', 'Sin conexión a internet, posponiendo sincronización');
      return;
    }

    try {
      EmailDebugger.log('info', 'EmailConfigSync', 'Iniciando sincronización localStorage -> BD');
      
      // Leer configuración desde localStorage
      const selectedProvider = localStorage.getItem('selectedEmailProvider');
      const gmailUser = localStorage.getItem('gmailUser');
      const gmailPassword = localStorage.getItem('gmailPassword');

      const resendKey = localStorage.getItem('resendKey');
      const resendSender = localStorage.getItem('resendSender');

      EmailDebugger.log('debug', 'EmailConfigSync', 'Configuración en localStorage', {
        selectedProvider,
        hasGmail: !!(gmailUser && gmailPassword),

        hasResend: !!(resendKey && resendSender)
      });

      // Construir configuración válida
      let configToSync = null;
      
      if (selectedProvider === 'gmail' && gmailUser && gmailPassword) {
        configToSync = {
          provider: 'gmail' as const,
          config: { gmailUser, gmailPassword }
        };

      } else if (selectedProvider === 'resend' && resendKey && resendSender) {
        configToSync = {
          provider: 'resend' as const,
          config: { resendApiKey: resendKey, resendFromEmail: resendSender }
        };
      }

      if (configToSync) {
        EmailDebugger.log('info', 'EmailConfigSync', 'Sincronizando configuración a BD', {
          provider: configToSync.provider,
          configKeys: Object.keys(configToSync.config)
        });
        
        // Usar retry con backoff para la sincronización
        await retryWithBackoff(
          async () => {
            const response = await fetchWithTimeout('/api/user/email-provider', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-user-email': user.email!
              },
              body: JSON.stringify(configToSync)
            }, 8000); // 8 segundos de timeout

            if (!response.ok) {
              const errorText = await response.text();
              const error = new Error(`HTTP ${response.status}: ${errorText}`);
              error.name = 'NetworkError';
              throw error;
            }
            
            return response;
          },
          3,
          1000
        );

        EmailDebugger.log('info', 'EmailConfigSync', 'Configuración sincronizada exitosamente');
        // Marcar como sincronizado
        localStorage.setItem('emailConfigSynced', 'true');
        localStorage.setItem('emailConfigSyncedAt', new Date().toISOString());
      } else {
        EmailDebugger.log('warn', 'EmailConfigSync', 'No hay configuración válida para sincronizar');
        // Limpiar marca de sincronización si no hay config válida
        localStorage.removeItem('emailConfigSynced');
        localStorage.removeItem('emailConfigSyncedAt');
      }
    } catch (error) {
      const err = error as Error;
      
      // Clasificar tipos de error
      if (err.name === 'AbortError') {
        EmailDebugger.log('error', 'EmailConfigSync', 'Timeout en sincronización - conexión muy lenta', err.message);
      } else if (err.name === 'NetworkError' || err.message.includes('fetch')) {
        EmailDebugger.log('error', 'EmailConfigSync', 'Error de red en sincronización', err.message);
      } else {
        EmailDebugger.log('error', 'EmailConfigSync', 'Error desconocido en sincronización', err);
      }
      
      // No marcar como sincronizado en caso de error
      localStorage.removeItem('emailConfigSynced');
    }
  }, [user?.email, isOnline, fetchWithTimeout, retryWithBackoff]);

  // Función para verificar si necesita sincronización
  const needsSync = useCallback(() => {
    const synced = localStorage.getItem('emailConfigSynced');
    const syncedAt = localStorage.getItem('emailConfigSyncedAt');
    
    if (!synced || !syncedAt) return true;
    
    // Verificar si han pasado más de 5 minutos desde la última sincronización
    const lastSync = new Date(syncedAt);
    const now = new Date();
    const minutesSinceSync = (now.getTime() - lastSync.getTime()) / (1000 * 60);
    
    return minutesSinceSync > 5;
  }, []);

  // Función para validar configuración en tiempo real
  const validateCurrentConfig = useCallback(() => {
    const selectedProvider = localStorage.getItem('selectedEmailProvider');
    
    if (!selectedProvider) {
      EmailDebugger.log('warn', 'EmailConfigSync', 'No hay proveedor seleccionado');
      return false;
    }
    
    switch (selectedProvider) {
      case 'gmail': {
        const gmailUser = localStorage.getItem('gmailUser');
        const gmailPassword = localStorage.getItem('gmailPassword');
        const isValid = !!(gmailUser && gmailPassword);
        EmailDebugger.log('debug', 'EmailConfigSync', `Configuración Gmail válida: ${isValid}`);
        return isValid;
      }

      case 'resend': {
        const resendKey = localStorage.getItem('resendKey');
        const resendSender = localStorage.getItem('resendSender');
        const isValid = !!(resendKey && resendSender);
        EmailDebugger.log('debug', 'EmailConfigSync', `Configuración Resend válida: ${isValid}`);
        return isValid;
      }
      default:
        EmailDebugger.log('warn', 'EmailConfigSync', `Proveedor desconocido: ${selectedProvider}`);
        return false;
    }
  }, []);

  // Función para sincronizar configuración desde BD a localStorage
  const syncConfigFromDB = useCallback(async () => {
    if (!user?.email) {
      EmailDebugger.log('warn', 'EmailConfigSync', 'No hay usuario para sincronizar desde BD');
      return;
    }

    if (!isOnline()) {
      EmailDebugger.log('warn', 'EmailConfigSync', 'Sin conexión, no se puede sincronizar desde BD');
      return;
    }

    try {
      EmailDebugger.log('info', 'EmailConfigSync', 'Iniciando sincronización BD -> localStorage');
      
      const response = await retryWithBackoff(
        async () => {
          const res = await fetchWithTimeout('/api/user/email-provider', {
            method: 'GET',
            headers: {
              'x-user-email': user.email!
            }
          }, 8000);
          
          if (!res.ok) {
            if (res.status === 404) {
              // No hay configuración en BD, esto es normal
              EmailDebugger.log('info', 'EmailConfigSync', 'No hay configuración en BD');
              return null;
            }
            const errorText = await res.text();
            const error = new Error(`HTTP ${res.status}: ${errorText}`);
            error.name = 'NetworkError';
            throw error;
          }
          
          return res;
        },
        3,
        1000
      );

      if (!response) {
        // No hay configuración en BD
        return;
      }

      const dbConfig = await response.json();
      EmailDebugger.log('debug', 'EmailConfigSync', 'Configuración desde BD', {
        provider: dbConfig.provider,
        configKeys: dbConfig.config ? Object.keys(dbConfig.config) : []
      });

      // Actualizar localStorage con configuración de BD
      if (dbConfig.provider && dbConfig.config) {
        localStorage.setItem('selectedEmailProvider', dbConfig.provider);
        
        switch (dbConfig.provider) {
          case 'gmail':
            if (dbConfig.config.gmailUser) {
              localStorage.setItem('gmailUser', dbConfig.config.gmailUser);
            }
            if (dbConfig.config.gmailPassword) {
              localStorage.setItem('gmailPassword', dbConfig.config.gmailPassword);
            }
            break;

          case 'resend':
            if (dbConfig.config.resendApiKey) {
              localStorage.setItem('resendKey', dbConfig.config.resendApiKey);
            }
            if (dbConfig.config.resendFromEmail) {
              localStorage.setItem('resendSender', dbConfig.config.resendFromEmail);
            }
            break;
        }
        
        EmailDebugger.log('info', 'EmailConfigSync', 'Configuración sincronizada desde BD exitosamente');
      }
    } catch (error) {
      const err = error as Error;
      EmailDebugger.log('error', 'EmailConfigSync', 'Error sincronizando desde BD', err);
    }
  }, [user?.email, isOnline, fetchWithTimeout, retryWithBackoff]);

  // Función principal de sincronización bidireccional
  const performSync = useCallback(async () => {
    if (!user?.email) return;
    
    EmailDebugger.log('info', 'EmailConfigSync', 'Iniciando sincronización bidireccional');
    
    try {
      // Primero sincronizar desde BD (por si hay cambios remotos)
      await syncConfigFromDB();
      
      // Luego validar configuración local y sincronizar a BD si es necesaria
      if (validateCurrentConfig() && needsSync()) {
        await syncConfigToDB();
      }
      
      EmailDebugger.log('info', 'EmailConfigSync', 'Sincronización bidireccional completada');
    } catch (error) {
      EmailDebugger.log('error', 'EmailConfigSync', 'Error en sincronización bidireccional', error);
    }
  }, [user?.email, syncConfigFromDB, validateCurrentConfig, needsSync, syncConfigToDB]);

  // Efecto para sincronización inicial
  useEffect(() => {
    if (!user?.email) return;
    
    EmailDebugger.log('info', 'EmailConfigSync', 'Usuario autenticado, iniciando sincronización');
    
    // Sincronización inicial con delay para evitar race conditions
    const timeoutId = setTimeout(() => {
      performSync();
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [user?.email, performSync]);

  // Efecto para escuchar cambios en localStorage
  useEffect(() => {
    if (!user?.email) return;
    
    const handleStorageChange = (e: StorageEvent) => {
      // Solo reaccionar a cambios en configuración de email
      const emailConfigKeys = [
        'selectedEmailProvider',
        'gmailUser',
        'gmailPassword', 

        'resendKey',
        'resendSender'
      ];
      
      if (e.key && emailConfigKeys.includes(e.key)) {
        EmailDebugger.log('debug', 'EmailConfigSync', `Cambio detectado en ${e.key}`);
        
        // Sincronizar después de un breve delay para agrupar cambios
        setTimeout(() => {
          if (validateCurrentConfig()) {
            syncConfigToDB();
          }
        }, 2000);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user?.email, validateCurrentConfig, syncConfigToDB]);

  // Efecto para sincronización periódica
  useEffect(() => {
    if (!user?.email) return;
    
    // Sincronización cada 10 minutos
    const intervalId = setInterval(() => {
      if (isOnline()) {
        EmailDebugger.log('debug', 'EmailConfigSync', 'Sincronización periódica');
        performSync();
      }
    }, 10 * 60 * 1000); // 10 minutos
    
    return () => clearInterval(intervalId);
  }, [user?.email, isOnline, performSync]);

  // Efecto para manejar cambios de conectividad
  useEffect(() => {
    const handleOnline = () => {
      EmailDebugger.log('info', 'EmailConfigSync', 'Conexión restaurada, sincronizando');
      if (user?.email) {
        setTimeout(() => performSync(), 1000);
      }
    };
    
    const handleOffline = () => {
      EmailDebugger.log('warn', 'EmailConfigSync', 'Conexión perdida');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user?.email, performSync]);

  // Inicializar herramientas de debugging y monitoreo
  useEffect(() => {
    if (!user?.email) return;
    
    EmailDebugger.log('info', 'EmailConfigSync', 'Sistema de sincronización inicializado');
  }, [user?.email]);

  // Este componente no renderiza nada visible
  return null;
}