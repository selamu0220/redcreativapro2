"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useMemoryManager } from '../lib/performance/MemoryManager';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Trash2, 
  RefreshCw,
  BarChart3,
  Clock,
  HardDrive,
  Zap
} from 'lucide-react';

interface PerformanceMonitorProps {
  className?: string;
  showDetails?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export default function PerformanceMonitor({
  className = '',
  showDetails = true,
  autoRefresh = true,
  refreshInterval = 5000
}: PerformanceMonitorProps) {
  const memoryManager = useMemoryManager();
  const [metrics, setMetrics] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  // Refresh metrics
  const refreshMetrics = useCallback(async () => {
    setIsRefreshing(true);
    
    try {
      const memoryMetrics = memoryManager.getMemoryMetrics();
      const audit = memoryManager.performMemoryAudit();
      const performanceAlerts = memoryManager.getPerformanceAlerts();
      
      setMetrics({
        memory: memoryMetrics,
        audit,
        timestamp: Date.now()
      });
      
      setAlerts(performanceAlerts.slice(-10)); // Show last 10 alerts
      setLastRefresh(Date.now());
    } catch (error) {
      console.error('Failed to refresh performance metrics:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [memoryManager]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(refreshMetrics, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshMetrics]);

  // Initial load
  useEffect(() => {
    refreshMetrics();
  }, [refreshMetrics]);

  // Handle cleanup actions
  const handleCleanup = useCallback(async () => {
    setIsRefreshing(true);
    
    try {
      memoryManager.cleanupLocalStorage();
      memoryManager.clearPerformanceAlerts();
      
      // Force garbage collection if available
      const gcSuccess = memoryManager.forceGarbageCollection();
      
      if (gcSuccess) {
        console.log('Garbage collection forced successfully');
      }
      
      // Refresh metrics after cleanup
      await refreshMetrics();
    } catch (error) {
      console.error('Cleanup failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [memoryManager, refreshMetrics]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatPercentage = (value: number): string => {
    return `${Math.round(value * 100)}%`;
  };

  const getStatusColor = (percentage: number): string => {
    if (percentage > 0.9) return 'text-red-600';
    if (percentage > 0.7) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusIcon = (percentage: number) => {
    if (percentage > 0.9) return AlertTriangle;
    if (percentage > 0.7) return Activity;
    return CheckCircle;
  };

  if (!metrics) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">Cargando métricas...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { memory, audit } = metrics;
  const memoryPercentage = memory?.memoryUsagePercentage || 0;
  const StatusIcon = getStatusIcon(memoryPercentage);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Monitor de Rendimiento
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={refreshMetrics}
              disabled={isRefreshing}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Actualizando...' : 'Actualizar'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCleanup}
              disabled={isRefreshing}
              className="flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Limpiar
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Memory Usage */}
        {memory && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4" />
                <span className="text-sm font-medium">Uso de Memoria</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusIcon className={`w-4 h-4 ${getStatusColor(memoryPercentage)}`} />
                <span className={`text-sm font-medium ${getStatusColor(memoryPercentage)}`}>
                  {formatPercentage(memoryPercentage)}
                </span>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  memoryPercentage > 0.9 ? 'bg-red-500' :
                  memoryPercentage > 0.7 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(100, memoryPercentage * 100)}%` }}
              />
            </div>
            
            {showDetails && (
              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  <span className="font-medium">Usado:</span> {formatBytes(memory.usedJSHeapSize)}
                </div>
                <div>
                  <span className="font-medium">Total:</span> {formatBytes(memory.totalJSHeapSize)}
                </div>
                <div>
                  <span className="font-medium">Límite:</span> {formatBytes(memory.jsHeapSizeLimit)}
                </div>
                <div>
                  <span className="font-medium">Disponible:</span> {formatBytes(memory.jsHeapSizeLimit - memory.usedJSHeapSize)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Resource Usage */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-lg font-semibold text-blue-600">{audit.activeTimeouts}</div>
            <div className="text-xs text-muted-foreground">Timeouts Activos</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Zap className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-lg font-semibold text-purple-600">{audit.activeIntervals}</div>
            <div className="text-xs text-muted-foreground">Intervalos Activos</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Activity className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-lg font-semibold text-green-600">{audit.activeListeners}</div>
            <div className="text-xs text-muted-foreground">Listeners Activos</div>
          </div>
        </div>

        {/* Performance Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              Alertas de Rendimiento ({alerts.length})
            </h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {alerts.map((alert, index) => (
                <div 
                  key={index}
                  className={`text-xs p-2 rounded border-l-2 ${
                    alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
                    alert.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                    alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                    'border-blue-500 bg-blue-50'
                  }`}
                >
                  <div className="font-medium">{alert.message}</div>
                  <div className="text-muted-foreground">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Last Update */}
        <div className="text-xs text-muted-foreground text-center">
          Última actualización: {new Date(lastRefresh).toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
}

// Compact version for dashboard
export function PerformanceIndicator({ className = '' }: { className?: string }) {
  const memoryManager = useMemoryManager();
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [status, setStatus] = useState<'good' | 'warning' | 'critical'>('good');

  useEffect(() => {
    const updateStatus = () => {
      const metrics = memoryManager.getMemoryMetrics();
      if (metrics) {
        const usage = metrics.memoryUsagePercentage;
        setMemoryUsage(usage);
        
        if (usage > 0.9) setStatus('critical');
        else if (usage > 0.7) setStatus('warning');
        else setStatus('good');
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 10000); // Update every 10 seconds
    
    return () => clearInterval(interval);
  }, [memoryManager]);

  const getStatusColor = () => {
    switch (status) {
      case 'critical': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-green-600';
    }
  };

  const StatusIcon = status === 'critical' ? AlertTriangle : 
                   status === 'warning' ? Activity : CheckCircle;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <StatusIcon className={`w-4 h-4 ${getStatusColor()}`} />
      <span className={`text-sm ${getStatusColor()}`}>
        {Math.round(memoryUsage * 100)}%
      </span>
    </div>
  );
}
