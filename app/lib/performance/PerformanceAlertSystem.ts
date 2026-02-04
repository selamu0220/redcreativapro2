"use client";

/**
 * Performance Alert System
 * Monitors memory usage and triggers alerts when thresholds are exceeded
 */

export interface PerformanceThreshold {
  type: 'memory' | 'cpu' | 'network' | 'storage';
  warning: number;
  critical: number;
  unit: 'percentage' | 'bytes' | 'ms' | 'count';
}

export interface PerformanceAlert {
  id: string;
  type: 'memory' | 'cpu' | 'network' | 'storage' | 'ai_operation';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: number;
  value: number;
  threshold: number;
  unit: string;
  actions: AlertAction[];
  autoResolve?: boolean;
  resolved?: boolean;
  resolvedAt?: number;
}

export interface AlertAction {
  id: string;
  label: string;
  action: () => Promise<void> | void;
  type: 'primary' | 'secondary' | 'danger';
}

export interface AlertConfig {
  enableNotifications: boolean;
  enableAutoActions: boolean;
  enableSound: boolean;
  thresholds: Record<string, PerformanceThreshold>;
  autoActionDelays: Record<string, number>;
}

class PerformanceAlertSystem {
  private static instance: PerformanceAlertSystem;
  private alerts: PerformanceAlert[] = [];
  private config: AlertConfig;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private alertCallbacks = new Set<(alert: PerformanceAlert) => void>();

  private defaultThresholds: Record<string, PerformanceThreshold> = {
    memory: {
      type: 'memory',
      warning: 0.7, // 70%
      critical: 0.9, // 90%
      unit: 'percentage'
    },
    aiOperations: {
      type: 'cpu',
      warning: 5,
      critical: 10,
      unit: 'count'
    },
    networkLatency: {
      type: 'network',
      warning: 2000, // 2 seconds
      critical: 5000, // 5 seconds
      unit: 'ms'
    },
    storageUsage: {
      type: 'storage',
      warning: 5 * 1024 * 1024, // 5MB
      critical: 10 * 1024 * 1024, // 10MB
      unit: 'bytes'
    }
  };

  private constructor() {
    this.config = {
      enableNotifications: true,
      enableAutoActions: true,
      enableSound: false,
      thresholds: { ...this.defaultThresholds },
      autoActionDelays: {
        memory: 30000, // 30 seconds
        aiOperations: 10000, // 10 seconds
        networkLatency: 5000, // 5 seconds
        storageUsage: 60000 // 1 minute
      }
    };

    this.startMonitoring();
  }

  static getInstance(): PerformanceAlertSystem {
    if (!PerformanceAlertSystem.instance) {
      PerformanceAlertSystem.instance = new PerformanceAlertSystem();
    }
    return PerformanceAlertSystem.instance;
  }

  /**
   * Start performance monitoring
   */
  private startMonitoring(): void {
    if (typeof window === 'undefined') return;

    this.monitoringInterval = setInterval(() => {
      this.checkMemoryUsage();
      this.checkAIOperations();
      this.checkStorageUsage();
      this.checkNetworkLatency();
      this.resolveExpiredAlerts();
    }, 5000); // Check every 5 seconds
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * Check memory usage and trigger alerts
   */
  private checkMemoryUsage(): void {
    if (typeof window === 'undefined' || !('performance' in window)) return;

    const memory = (performance as any).memory;
    if (!memory) return;

    const memoryUsagePercentage = memory.usedJSHeapSize / memory.totalJSHeapSize;
    const threshold = this.config.thresholds.memory;

    if (memoryUsagePercentage >= threshold.critical) {
      this.triggerAlert({
        type: 'memory',
        severity: 'critical',
        title: 'Uso Crítico de Memoria',
        message: `El uso de memoria ha alcanzado ${Math.round(memoryUsagePercentage * 100)}%. La aplicación puede volverse lenta o inestable.`,
        value: memoryUsagePercentage,
        threshold: threshold.critical,
        unit: '%',
        actions: [
          {
            id: 'force-cleanup',
            label: 'Limpiar Memoria',
            action: this.performEmergencyCleanup.bind(this),
            type: 'primary'
          },
          {
            id: 'force-gc',
            label: 'Forzar Recolección',
            action: this.forceGarbageCollection.bind(this),
            type: 'secondary'
          },
          {
            id: 'reload-page',
            label: 'Recargar Página',
            action: () => window.location.reload(),
            type: 'danger'
          }
        ],
        autoResolve: true
      });
    } else if (memoryUsagePercentage >= threshold.warning) {
      this.triggerAlert({
        type: 'memory',
        severity: 'warning',
        title: 'Alto Uso de Memoria',
        message: `El uso de memoria es ${Math.round(memoryUsagePercentage * 100)}%. Considera limpiar datos innecesarios.`,
        value: memoryUsagePercentage,
        threshold: threshold.warning,
        unit: '%',
        actions: [
          {
            id: 'cleanup-storage',
            label: 'Limpiar Almacenamiento',
            action: this.cleanupStorage.bind(this),
            type: 'primary'
          },
          {
            id: 'close-unused',
            label: 'Cerrar Documentos',
            action: this.closeUnusedDocuments.bind(this),
            type: 'secondary'
          }
        ],
        autoResolve: true
      });
    }
  }

  /**
   * Check AI operations and trigger alerts
   */
  private checkAIOperations(): void {
    // This would integrate with the AI operation tracker
    const activeOperations = this.getActiveAIOperations();
    const threshold = this.config.thresholds.aiOperations;

    if (activeOperations >= threshold.critical) {
      this.triggerAlert({
        type: 'ai_operation',
        severity: 'critical',
        title: 'Demasiadas Operaciones de IA',
        message: `Hay ${activeOperations} operaciones de IA activas. Esto puede causar problemas de rendimiento.`,
        value: activeOperations,
        threshold: threshold.critical,
        unit: 'operaciones',
        actions: [
          {
            id: 'cancel-operations',
            label: 'Cancelar Operaciones',
            action: this.cancelExcessiveAIOperations.bind(this),
            type: 'primary'
          },
          {
            id: 'pause-auto-improve',
            label: 'Pausar Auto-mejora',
            action: this.pauseAutoImprovement.bind(this),
            type: 'secondary'
          }
        ]
      });
    } else if (activeOperations >= threshold.warning) {
      this.triggerAlert({
        type: 'ai_operation',
        severity: 'warning',
        title: 'Muchas Operaciones de IA',
        message: `Hay ${activeOperations} operaciones de IA activas. El rendimiento puede verse afectado.`,
        value: activeOperations,
        threshold: threshold.warning,
        unit: 'operaciones',
        actions: [
          {
            id: 'reduce-operations',
            label: 'Reducir Operaciones',
            action: this.optimizeAIOperations.bind(this),
            type: 'primary'
          }
        ]
      });
    }
  }

  /**
   * Check storage usage
   */
  private checkStorageUsage(): void {
    try {
      const storageUsage = this.calculateStorageUsage();
      const threshold = this.config.thresholds.storageUsage;

      if (storageUsage >= threshold.critical) {
        this.triggerAlert({
          type: 'storage',
          severity: 'critical',
          title: 'Almacenamiento Crítico',
          message: `El almacenamiento local está usando ${this.formatBytes(storageUsage)}. Limpia datos para evitar problemas.`,
          value: storageUsage,
          threshold: threshold.critical,
          unit: 'bytes',
          actions: [
            {
              id: 'cleanup-all',
              label: 'Limpiar Todo',
              action: this.performStorageCleanup.bind(this),
              type: 'primary'
            },
            {
              id: 'export-data',
              label: 'Exportar Datos',
              action: this.exportImportantData.bind(this),
              type: 'secondary'
            }
          ]
        });
      } else if (storageUsage >= threshold.warning) {
        this.triggerAlert({
          type: 'storage',
          severity: 'warning',
          title: 'Alto Uso de Almacenamiento',
          message: `El almacenamiento local está usando ${this.formatBytes(storageUsage)}. Considera limpiar datos antiguos.`,
          value: storageUsage,
          threshold: threshold.warning,
          unit: 'bytes',
          actions: [
            {
              id: 'cleanup-old',
              label: 'Limpiar Antiguos',
              action: this.cleanupOldData.bind(this),
              type: 'primary'
            }
          ],
          autoResolve: true
        });
      }
    } catch (error) {
      console.warn('Failed to check storage usage:', error);
    }
  }

  /**
   * Check network latency
   */
  private checkNetworkLatency(): void {
    // This would measure actual network latency to AI services
    // For now, we'll use a placeholder implementation
    const latency = this.measureNetworkLatency();
    const threshold = this.config.thresholds.networkLatency;

    if (latency >= threshold.critical) {
      this.triggerAlert({
        type: 'network',
        severity: 'critical',
        title: 'Latencia de Red Crítica',
        message: `La latencia de red es ${latency}ms. Las operaciones de IA pueden fallar.`,
        value: latency,
        threshold: threshold.critical,
        unit: 'ms',
        actions: [
          {
            id: 'retry-connection',
            label: 'Reintentar Conexión',
            action: this.retryNetworkConnection.bind(this),
            type: 'primary'
          },
          {
            id: 'switch-offline',
            label: 'Modo Offline',
            action: this.switchToOfflineMode.bind(this),
            type: 'secondary'
          }
        ]
      });
    }
  }

  /**
   * Trigger an alert
   */
  private triggerAlert(alertData: Omit<PerformanceAlert, 'id' | 'timestamp'>): void {
    const alertId = `${alertData.type}-${Date.now()}`;
    
    // Check if similar alert already exists
    const existingAlert = this.alerts.find(alert => 
      alert.type === alertData.type && 
      alert.severity === alertData.severity &&
      !alert.resolved &&
      Date.now() - alert.timestamp < 60000 // Within last minute
    );

    if (existingAlert) {
      // Update existing alert instead of creating new one
      existingAlert.value = alertData.value;
      existingAlert.timestamp = Date.now();
      return;
    }

    const alert: PerformanceAlert = {
      id: alertId,
      timestamp: Date.now(),
      ...alertData
    };

    this.alerts.push(alert);

    // Keep only last 50 alerts
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(-50);
    }

    // Notify callbacks
    this.alertCallbacks.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.error('Alert callback failed:', error);
      }
    });

    // Show browser notification if enabled
    if (this.config.enableNotifications && alert.severity === 'critical') {
      this.showBrowserNotification(alert);
    }

    // Play sound if enabled
    if (this.config.enableSound && alert.severity === 'critical') {
      this.playAlertSound();
    }

    // Schedule auto-action if enabled
    if (this.config.enableAutoActions && alert.actions.length > 0) {
      const delay = this.config.autoActionDelays[alert.type] || 30000;
      setTimeout(() => {
        if (!alert.resolved && alert.actions[0]) {
          console.log(`Auto-executing action for ${alert.type} alert:`, alert.actions[0].label);
          try {
            alert.actions[0].action();
          } catch (error) {
            console.error('Auto-action failed:', error);
          }
        }
      }, delay);
    }
  }

  /**
   * Resolve expired alerts
   */
  private resolveExpiredAlerts(): void {
    const now = Date.now();
    const expireTime = 5 * 60 * 1000; // 5 minutes

    this.alerts.forEach(alert => {
      if (alert.autoResolve && !alert.resolved && now - alert.timestamp > expireTime) {
        alert.resolved = true;
        alert.resolvedAt = now;
      }
    });
  }

  /**
   * Emergency cleanup actions
   */
  private async performEmergencyCleanup(): Promise<void> {
    console.log('Performing emergency cleanup...');
    
    // Clear caches
    this.cleanupStorage();
    
    // Force garbage collection
    this.forceGarbageCollection();
    
    // Cancel non-essential operations
    this.cancelExcessiveAIOperations();
    
    // Clear old alerts
    this.clearResolvedAlerts();
  }

  private forceGarbageCollection(): void {
    if (typeof window !== 'undefined' && (window as any).gc) {
      try {
        (window as any).gc();
        console.log('Forced garbage collection');
      } catch (error) {
        console.warn('Failed to force garbage collection:', error);
      }
    }
  }

  private cleanupStorage(): void {
    try {
      // Remove old backups
      const keysToRemove = Object.keys(localStorage)
        .filter(key => key.startsWith('document_backup_') || key.startsWith('temp_'))
        .sort()
        .slice(0, -10); // Keep only last 10

      keysToRemove.forEach(key => localStorage.removeItem(key));
      console.log(`Cleaned up ${keysToRemove.length} storage items`);
    } catch (error) {
      console.warn('Storage cleanup failed:', error);
    }
  }

  private closeUnusedDocuments(): void {
    // This would integrate with document management
    console.log('Closing unused documents...');
  }

  private cancelExcessiveAIOperations(): void {
    // This would integrate with AI operation management
    console.log('Canceling excessive AI operations...');
  }

  private pauseAutoImprovement(): void {
    // This would integrate with auto-improvement system
    console.log('Pausing auto-improvement...');
  }

  private optimizeAIOperations(): void {
    console.log('Optimizing AI operations...');
  }

  private performStorageCleanup(): void {
    this.cleanupStorage();
  }

  private exportImportantData(): void {
    console.log('Exporting important data...');
  }

  private cleanupOldData(): void {
    this.cleanupStorage();
  }

  private retryNetworkConnection(): void {
    console.log('Retrying network connection...');
  }

  private switchToOfflineMode(): void {
    console.log('Switching to offline mode...');
  }

  /**
   * Helper methods
   */
  private getActiveAIOperations(): number {
    // This would integrate with actual AI operation tracking
    return Math.floor(Math.random() * 3); // Placeholder
  }

  private calculateStorageUsage(): number {
    try {
      let totalSize = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length;
        }
      }
      return totalSize;
    } catch (error) {
      return 0;
    }
  }

  private measureNetworkLatency(): number {
    // This would measure actual network latency
    return Math.floor(Math.random() * 1000); // Placeholder
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private showBrowserNotification(alert: PerformanceAlert): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(alert.title, {
        body: alert.message,
        icon: '/favicon.ico'
      });
    }
  }

  private playAlertSound(): void {
    // Play a subtle alert sound
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTuR2O/Eeyw');
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Ignore errors
    } catch (error) {
      // Ignore audio errors
    }
  }

  /**
   * Public API methods
   */
  getAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  getActiveAlerts(): PerformanceAlert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = Date.now();
      return true;
    }
    return false;
  }

  clearResolvedAlerts(): void {
    this.alerts = this.alerts.filter(alert => !alert.resolved);
  }

  clearAllAlerts(): void {
    this.alerts = [];
  }

  onAlert(callback: (alert: PerformanceAlert) => void): () => void {
    this.alertCallbacks.add(callback);
    return () => this.alertCallbacks.delete(callback);
  }

  updateConfig(newConfig: Partial<AlertConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): AlertConfig {
    return { ...this.config };
  }
}

export default PerformanceAlertSystem;

/**
 * React hook for performance alerts
 */
export function usePerformanceAlerts() {
  const alertSystem = PerformanceAlertSystem.getInstance();

  return {
    getAlerts: () => alertSystem.getAlerts(),
    getActiveAlerts: () => alertSystem.getActiveAlerts(),
    resolveAlert: (alertId: string) => alertSystem.resolveAlert(alertId),
    clearResolvedAlerts: () => alertSystem.clearResolvedAlerts(),
    clearAllAlerts: () => alertSystem.clearAllAlerts(),
    onAlert: (callback: (alert: PerformanceAlert) => void) => alertSystem.onAlert(callback),
    updateConfig: (config: Partial<AlertConfig>) => alertSystem.updateConfig(config),
    getConfig: () => alertSystem.getConfig()
  };
}
