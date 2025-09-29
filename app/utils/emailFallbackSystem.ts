'use client';

import { EmailDebugger } from './emailDebugger';

// Interfaces
interface EmailConfig {
  provider: string;
  config: {
    gmailUser?: string;
    gmailPassword?: string;
    resendApiKey?: string;
    resendFromEmail?: string;
  };
}

interface FallbackSource {
  name: string;
  priority: number;
  getData: () => Promise<EmailConfig | null>;
  isAvailable: () => boolean;
}

interface FallbackResult {
  success: boolean;
  config: EmailConfig | null;
  source: string;
  attempts: Array<{
    source: string;
    success: boolean;
    error?: string;
  }>;
}

// Sistema de fallbacks múltiples para configuración de email
export class EmailFallbackSystem {
  private static instance: EmailFallbackSystem;
  private fallbackSources: FallbackSource[] = [];
  private lastSuccessfulConfig: EmailConfig | null = null;
  private configCache: Map<string, { config: EmailConfig; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  static getInstance(): EmailFallbackSystem {
    if (!EmailFallbackSystem.instance) {
      EmailFallbackSystem.instance = new EmailFallbackSystem();
    }
    return EmailFallbackSystem.instance;
  }

  constructor() {
    this.initializeFallbackSources();
  }

  // Inicializar fuentes de fallback en orden de prioridad
  private initializeFallbackSources(): void {
    this.fallbackSources = [
      // 1. Base de datos (prioridad más alta)
      {
        name: 'database',
        priority: 1,
        getData: this.getConfigFromDatabase.bind(this),
        isAvailable: () => true
      },
      
      // 2. localStorage (segunda prioridad)
      {
        name: 'localStorage',
        priority: 2,
        getData: this.getConfigFromLocalStorage.bind(this),
        isAvailable: () => typeof window !== 'undefined' && !!window.localStorage
      },
      
      // 3. Headers de request (tercera prioridad)
      {
        name: 'headers',
        priority: 3,
        getData: this.getConfigFromHeaders.bind(this),
        isAvailable: () => true
      },
      
      // 4. Caché en memoria (cuarta prioridad)
      {
        name: 'memoryCache',
        priority: 4,
        getData: this.getConfigFromMemoryCache.bind(this),
        isAvailable: () => this.configCache.size > 0
      },
      
      // 5. Última configuración exitosa (quinta prioridad)
      {
        name: 'lastSuccessful',
        priority: 5,
        getData: this.getLastSuccessfulConfig.bind(this),
        isAvailable: () => !!this.lastSuccessfulConfig
      },
      
      // 6. Configuración de emergencia (última prioridad)
      {
        name: 'emergency',
        priority: 6,
        getData: this.getEmergencyConfig.bind(this),
        isAvailable: () => true
      }
    ];

    // Ordenar por prioridad
    this.fallbackSources.sort((a, b) => a.priority - b.priority);
  }

  // Obtener configuración con sistema de fallbacks
  async getEmailConfig(headers?: Headers): Promise<FallbackResult> {
    EmailDebugger.log('info', 'FALLBACK_SYSTEM', '🔄 Iniciando búsqueda de configuración con fallbacks');
    
    const attempts: Array<{ source: string; success: boolean; error?: string }> = [];
    
    // Guardar headers para uso en fallbacks
    if (headers) {
      this.currentHeaders = headers;
    }

    // Intentar cada fuente de fallback en orden de prioridad
    for (const source of this.fallbackSources) {
      if (!source.isAvailable()) {
        EmailDebugger.log('warn', 'FALLBACK_SYSTEM', `⏭️ Fuente ${source.name} no disponible`);
        attempts.push({ source: source.name, success: false, error: 'Source not available' });
        continue;
      }

      try {
        EmailDebugger.log('info', 'FALLBACK_SYSTEM', `🔍 Intentando fuente: ${source.name}`);
        
        const config = await source.getData();
        
        if (config && this.validateConfig(config)) {
          EmailDebugger.log('info', 'FALLBACK_SYSTEM', `✅ Configuración obtenida de: ${source.name}`, {
            provider: config.provider,
            configKeys: Object.keys(config.config)
          });
          
          attempts.push({ source: source.name, success: true });
          
          // Guardar como última configuración exitosa
          this.lastSuccessfulConfig = config;
          
          // Guardar en caché
          this.saveToMemoryCache(config);
          
          // Intentar sincronizar con otras fuentes si es necesario
          this.syncConfigToAllSources(config, source.name);
          
          return {
            success: true,
            config,
            source: source.name,
            attempts
          };
        } else {
          EmailDebugger.log('warn', 'FALLBACK_SYSTEM', `❌ Configuración inválida en: ${source.name}`);
          attempts.push({ source: source.name, success: false, error: 'Invalid configuration' });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        EmailDebugger.log('error', 'FALLBACK_SYSTEM', `💥 Error en fuente ${source.name}`, { error: errorMessage });
        attempts.push({ source: source.name, success: false, error: errorMessage });
      }
    }

    EmailDebugger.log('error', 'FALLBACK_SYSTEM', '❌ No se pudo obtener configuración de ninguna fuente', { attempts });
    
    return {
      success: false,
      config: null,
      source: 'none',
      attempts
    };
  }

  // Headers actuales para fallbacks
  private currentHeaders: Headers | null = null;

  // Obtener configuración de la base de datos
  private async getConfigFromDatabase(): Promise<EmailConfig | null> {
    try {
      EmailDebugger.log('debug', 'FALLBACK_SYSTEM', '🗄️ Intentando obtener configuración de BD');
      
      // Obtener email del usuario desde localStorage
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        EmailDebugger.log('warn', 'FALLBACK_SYSTEM', 'No hay email de usuario para consultar BD');
        return null;
      }
      
      const response = await fetch('/api/user/email-provider', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': userEmail,
          'x-internal-call': 'true',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        }
      });
      
      if (!response.ok) {
        EmailDebugger.log('warn', 'FALLBACK_SYSTEM', 'No se pudo obtener configuración de BD:', response.status);
        return null;
      }
      
      const data = await response.json();
      EmailDebugger.log('info', 'FALLBACK_SYSTEM', '✅ Configuración obtenida de BD:', data);
      
      return data || null;
    } catch (error) {
      EmailDebugger.log('error', 'FALLBACK_SYSTEM', 'Error obteniendo configuración de BD:', error);
      return null;
    }
  }

  // Obtener configuración de localStorage
  private async getConfigFromLocalStorage(): Promise<EmailConfig | null> {
    try {
      if (typeof window === 'undefined') return null;
      
      const provider = localStorage.getItem('emailProvider');
      if (!provider) return null;

      const config: any = {};
      
      switch (provider) {
        case 'gmail':
          config.gmailUser = localStorage.getItem('gmailUser');
          config.gmailPassword = localStorage.getItem('gmailPassword');
          break;

        case 'resend':
          config.resendApiKey = localStorage.getItem('resendApiKey');
          config.resendFromEmail = localStorage.getItem('resendFromEmail');
          break;
        default:
          return null;
      }

      return { provider, config };
    } catch (error) {
      EmailDebugger.log('error', 'FALLBACK_SYSTEM', 'Error al obtener configuración de localStorage', { error });
      return null;
    }
  }

  // Obtener configuración de headers
  private async getConfigFromHeaders(): Promise<EmailConfig | null> {
    try {
      if (!this.currentHeaders) return null;
      
      const selectedProvider = this.currentHeaders.get('x-selected-provider');
      if (!selectedProvider) return null;

      const config: any = {};
      
      switch (selectedProvider) {
        case 'gmail':
          config.gmailUser = this.currentHeaders.get('x-gmail-user');
          config.gmailPassword = this.currentHeaders.get('x-gmail-password');
          break;

        case 'resend':
          config.resendApiKey = this.currentHeaders.get('x-resend-key');
          config.resendFromEmail = this.currentHeaders.get('x-resend-sender');
          break;
        default:
          return null;
      }

      return { provider: selectedProvider, config };
    } catch (error) {
      EmailDebugger.log('error', 'FALLBACK_SYSTEM', 'Error al obtener configuración de headers', { error });
      return null;
    }
  }

  // Obtener configuración del caché en memoria
  private async getConfigFromMemoryCache(): Promise<EmailConfig | null> {
    try {
      const now = Date.now();
      
      // Limpiar caché expirado
      for (const [key, value] of this.configCache.entries()) {
        if (now - value.timestamp > this.CACHE_DURATION) {
          this.configCache.delete(key);
        }
      }
      
      // Buscar configuración válida en caché
      for (const [key, value] of this.configCache.entries()) {
        if (this.validateConfig(value.config)) {
          EmailDebugger.log('info', 'FALLBACK_SYSTEM', 'Configuración obtenida del caché en memoria');
          return value.config;
        }
      }
      
      return null;
    } catch (error) {
      EmailDebugger.log('error', 'FALLBACK_SYSTEM', 'Error al obtener configuración del caché', { error });
      return null;
    }
  }

  // Obtener última configuración exitosa
  private async getLastSuccessfulConfig(): Promise<EmailConfig | null> {
    if (this.lastSuccessfulConfig && this.validateConfig(this.lastSuccessfulConfig)) {
      EmailDebugger.log('info', 'FALLBACK_SYSTEM', 'Usando última configuración exitosa');
      return this.lastSuccessfulConfig;
    }
    return null;
  }

  // Obtener configuración de emergencia (valores por defecto)
  private async getEmergencyConfig(): Promise<EmailConfig | null> {
    // Esta sería una configuración de emergencia predefinida
    // En un entorno real, podrías tener valores por defecto seguros
    EmailDebugger.log('warn', 'FALLBACK_SYSTEM', 'Usando configuración de emergencia (no implementada)');
    return null;
  }

  // Validar configuración
  private validateConfig(config: EmailConfig | null): boolean {
    if (!config || !config.provider) return false;

    switch (config.provider) {
      case 'gmail':
        return !!(config.config.gmailUser && config.config.gmailPassword);

      case 'resend':
        return !!(config.config.resendApiKey && config.config.resendFromEmail);
      default:
        return false;
    }
  }

  // Guardar en caché de memoria
  private saveToMemoryCache(config: EmailConfig): void {
    const key = `${config.provider}_${Date.now()}`;
    this.configCache.set(key, {
      config,
      timestamp: Date.now()
    });
    
    // Mantener solo las últimas 5 configuraciones
    if (this.configCache.size > 5) {
      const oldestKey = Array.from(this.configCache.keys())[0];
      this.configCache.delete(oldestKey);
    }
  }

  // Sincronizar configuración a todas las fuentes disponibles
  private async syncConfigToAllSources(config: EmailConfig, sourceOrigin: string): Promise<void> {
    EmailDebugger.log('info', 'FALLBACK_SYSTEM', `🔄 Sincronizando configuración desde ${sourceOrigin} a otras fuentes`);
    
    // Sincronizar a localStorage si no es el origen
    if (sourceOrigin !== 'localStorage' && typeof window !== 'undefined') {
      try {
        localStorage.setItem('emailProvider', config.provider);
        
        Object.entries(config.config).forEach(([key, value]) => {
          if (value) {
            localStorage.setItem(key, value);
          }
        });
        
        EmailDebugger.log('info', 'FALLBACK_SYSTEM', '✅ Configuración sincronizada a localStorage');
      } catch (error) {
        EmailDebugger.log('error', 'FALLBACK_SYSTEM', 'Error al sincronizar a localStorage', { error });
      }
    }
    
    // Sincronizar a base de datos si no es el origen
    if (sourceOrigin !== 'database') {
      try {
        const userEmail = localStorage.getItem('userEmail');
        if (userEmail) {
          const response = await fetch('/api/user/email-provider', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-user-email': userEmail,
              'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
            },
            body: JSON.stringify(config)
          });
          
          if (response.ok) {
            EmailDebugger.log('info', 'FALLBACK_SYSTEM', '✅ Configuración sincronizada a base de datos');
          } else {
            EmailDebugger.log('error', 'FALLBACK_SYSTEM', 'Error al sincronizar a BD', { status: response.status });
          }
        } else {
          EmailDebugger.log('warn', 'FALLBACK_SYSTEM', 'No hay email de usuario para sincronizar a BD');
        }
      } catch (error) {
        EmailDebugger.log('error', 'FALLBACK_SYSTEM', 'Error al sincronizar a BD', { error });
      }
    }
  }

  // Forzar actualización de configuración en todas las fuentes
  async forceUpdateAllSources(config: EmailConfig): Promise<boolean> {
    EmailDebugger.log('info', 'FALLBACK_SYSTEM', '🔄 Forzando actualización en todas las fuentes');
    
    let success = true;
    
    // Actualizar localStorage
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('emailProvider', config.provider);
        Object.entries(config.config).forEach(([key, value]) => {
          if (value) {
            localStorage.setItem(key, value);
          }
        });
      }
    } catch (error) {
      EmailDebugger.log('error', 'FALLBACK_SYSTEM', 'Error al actualizar localStorage', { error });
      success = false;
    }
    
    // Actualizar base de datos
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (userEmail) {
        const response = await fetch('/api/user/email-provider', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-user-email': userEmail,
            'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
          },
          body: JSON.stringify(config)
        });
        
        if (!response.ok) {
          success = false;
        }
      } else {
        EmailDebugger.log('warn', 'FALLBACK_SYSTEM', 'No hay email de usuario para actualizar BD');
        success = false;
      }
    } catch (error) {
      EmailDebugger.log('error', 'FALLBACK_SYSTEM', 'Error al actualizar BD', { error });
      success = false;
    }
    
    // Actualizar caché y última configuración exitosa
    this.saveToMemoryCache(config);
    this.lastSuccessfulConfig = config;
    
    return success;
  }

  // Limpiar solo el caché en memoria
  clearMemoryCache(): void {
    EmailDebugger.log('info', 'FALLBACK_SYSTEM', '🧹 Limpiando caché en memoria');
    this.configCache.clear();
    this.lastSuccessfulConfig = null;
  }

  // Limpiar todas las fuentes
  async clearAllSources(): Promise<void> {
    EmailDebugger.log('info', 'FALLBACK_SYSTEM', '🧹 Limpiando todas las fuentes de configuración');
    
    // Limpiar localStorage
    if (typeof window !== 'undefined') {
      const keys = [
        'emailProvider', 'gmailUser', 'gmailPassword',
        'resendApiKey', 'resendFromEmail'
      ];
      keys.forEach(key => localStorage.removeItem(key));
    }
    
    // Limpiar caché y última configuración
    this.clearMemoryCache();
    
    // Nota: No limpiamos la base de datos automáticamente por seguridad
  }

  // Obtener reporte de estado de todas las fuentes
  async getSourcesStatusReport(): Promise<any> {
    const report: any = {
      sources: [],
      summary: {
        available: 0,
        withValidConfig: 0,
        total: this.fallbackSources.length
      },
      timestamp: new Date().toISOString()
    };
    
    for (const source of this.fallbackSources) {
      const isAvailable = source.isAvailable();
      let hasValidConfig = false;
      let config = null;
      
      if (isAvailable) {
        report.summary.available++;
        try {
          config = await source.getData();
          hasValidConfig = this.validateConfig(config);
          if (hasValidConfig) {
            report.summary.withValidConfig++;
          }
        } catch (error) {
          // Error ya manejado en getData
        }
      }
      
      report.sources.push({
        name: source.name,
        priority: source.priority,
        available: isAvailable,
        hasValidConfig,
        configProvider: config?.provider || null
      });
    }
    
    return report;
  }
}

// Funciones globales para uso en consola del navegador
if (typeof window !== 'undefined') {
  (window as any).getEmailConfigWithFallbacks = (headers?: Headers) => {
    return EmailFallbackSystem.getInstance().getEmailConfig(headers);
  };
  
  (window as any).getEmailSourcesStatus = () => {
    return EmailFallbackSystem.getInstance().getSourcesStatusReport();
  };
  
  (window as any).forceUpdateEmailConfig = (config: EmailConfig) => {
    return EmailFallbackSystem.getInstance().forceUpdateAllSources(config);
  };
  
  (window as any).clearAllEmailSources = () => {
    return EmailFallbackSystem.getInstance().clearAllSources();
  };
}

export default EmailFallbackSystem;