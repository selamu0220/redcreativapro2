'use client';

import React, { useState } from 'react';
import { useSubscriptionManagement } from '../hooks/useSubscriptionManagement';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { 
  Crown, 
  Calendar, 
  CreditCard, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  ExternalLink,
  Zap,
  FileText,
  BarChart3,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface SubscriptionDashboardProps {
  className?: string;
}

export function SubscriptionDashboard({ className }: SubscriptionDashboardProps) {
  const {
    subscription,
    subscriptionStatus,
    usageStats,
    billingInfo,
    loading,
    error,
    isActive,
    isPremium,
    planType,
    daysUntilExpiry,
    cancelSubscription,
    reactivateSubscription,
    updatePaymentMethod,
    getPlanLimitsForUser,
    hasReachedLimit
  } = useSubscriptionManagement();

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleCancelSubscription = async () => {
    if (!confirm('¿Estás seguro de que quieres cancelar tu suscripción?')) {
      return;
    }

    setActionLoading('cancel');
    try {
      const success = await cancelSubscription();
      if (success) {
        toast.success('Suscripción cancelada exitosamente');
      } else {
        toast.error('Error al cancelar la suscripción');
      }
    } catch (error) {
      toast.error('Error al cancelar la suscripción');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivateSubscription = async () => {
    setActionLoading('reactivate');
    try {
      const success = await reactivateSubscription();
      if (success) {
        toast.success('Suscripción reactivada exitosamente');
      } else {
        toast.error('Error al reactivar la suscripción');
      }
    } catch (error) {
      toast.error('Error al reactivar la suscripción');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdatePaymentMethod = async () => {
    setActionLoading('payment');
    try {
      const portalUrl = await updatePaymentMethod();
      if (portalUrl) {
        window.open(portalUrl, '_blank');
      } else {
        toast.error('Error al abrir el portal de facturación');
      }
    } catch (error) {
      toast.error('Error al abrir el portal de facturación');
    } finally {
      setActionLoading(null);
    }
  };

  const getPlanDisplayName = (plan: string) => {
    switch (plan) {
      case 'monthly': return 'Red Creativa Pro (Mensual)';
      case 'lifetime': return 'Red Creativa Pro (De por vida)';
      case 'discounted': return 'Red Creativa Pro (30% off)';
      default: return 'Plan Gratuito';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'lifetime': return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 'monthly': return 'bg-gradient-to-r from-blue-500 to-blue-600';
      case 'discounted': return 'bg-gradient-to-r from-green-500 to-green-600';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'canceled': return 'text-orange-600';
      case 'expired': return 'text-red-600';
      case 'past_due': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'canceled': return <AlertTriangle className="h-4 w-4" />;
      case 'expired': return <XCircle className="h-4 w-4" />;
      case 'past_due': return <Clock className="h-4 w-4" />;
      default: return <XCircle className="h-4 w-4" />;
    }
  };

  const limits = getPlanLimitsForUser();

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-24 bg-gray-200 rounded-lg"></div>
          <div className="h-24 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span>Error al cargar la información de suscripción: {error}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Estado de la suscripción */}
      <Card className={isPremium ? 'border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isPremium ? (
                <Crown className="h-6 w-6 text-yellow-600" />
              ) : (
                <Settings className="h-6 w-6 text-gray-600" />
              )}
              <div>
                <CardTitle className="text-xl">
                  {getPlanDisplayName(planType)}
                </CardTitle>
                <CardDescription>
                  {subscription ? (
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={getStatusColor(subscription.status)}>
                        {getStatusIcon(subscription.status)}
                      </span>
                      <span className="capitalize">
                        {subscription.status === 'active' ? 'Activa' :
                         subscription.status === 'canceled' ? 'Cancelada' :
                         subscription.status === 'expired' ? 'Expirada' :
                         subscription.status === 'past_due' ? 'Pago pendiente' : subscription.status}
                      </span>
                    </div>
                  ) : (
                    'Sin suscripción activa'
                  )}
                </CardDescription>
              </div>
            </div>
            <Badge className={getPlanColor(planType)} variant="secondary">
              {planType === 'free' ? 'Gratuito' : 'Premium'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {subscription && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subscription.current_period_end && (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    {planType === 'lifetime' ? 'Válido de por vida' :
                     `Próxima facturación: ${new Date(subscription.current_period_end).toLocaleDateString()}`}
                  </span>
                </div>
              )}
              {daysUntilExpiry !== null && daysUntilExpiry > 0 && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    {daysUntilExpiry} días restantes
                  </span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estadísticas de uso */}
      {usageStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Uso Actual</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Generaciones diarias */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium flex items-center space-x-2">
                  <Zap className="h-4 w-4" />
                  <span>Generaciones diarias</span>
                </span>
                <span className="text-sm text-gray-600">
                  {usageStats.dailyGenerations} / {limits.dailyGenerations === -1 ? '∞' : limits.dailyGenerations}
                </span>
              </div>
              {limits.dailyGenerations !== -1 && (
                <Progress 
                  value={(usageStats.dailyGenerations / limits.dailyGenerations) * 100} 
                  className={hasReachedLimit('dailyGenerations') ? 'bg-red-100' : ''}
                />
              )}
            </div>

            {/* Documentos mensuales */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Documentos mensuales</span>
                </span>
                <span className="text-sm text-gray-600">
                  {usageStats.documentsPerMonth} / {limits.documentsPerMonth === -1 ? '∞' : limits.documentsPerMonth}
                </span>
              </div>
              {limits.documentsPerMonth !== -1 && (
                <Progress 
                  value={(usageStats.documentsPerMonth / limits.documentsPerMonth) * 100} 
                  className={hasReachedLimit('documentsPerMonth') ? 'bg-red-100' : ''}
                />
              )}
            </div>

            <Separator />
            
            <div className="text-sm text-gray-600">
              Total de generaciones: {usageStats.totalGenerations.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información de facturación */}
      {billingInfo && subscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Información de Facturación</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {billingInfo.nextBillingDate && (
              <div className="flex justify-between">
                <span>Próxima facturación:</span>
                <span>{billingInfo.nextBillingDate.toLocaleDateString()}</span>
              </div>
            )}
            {billingInfo.amount && (
              <div className="flex justify-between">
                <span>Importe:</span>
                <span>{billingInfo.amount} {billingInfo.currency?.toUpperCase()}</span>
              </div>
            )}
            {billingInfo.paymentMethod && (
              <div className="flex justify-between">
                <span>Método de pago:</span>
                <span>
                  {billingInfo.paymentMethod.brand} •••• {billingInfo.paymentMethod.last4}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Acciones */}
      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle>Gestionar Suscripción</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={handleUpdatePaymentMethod}
              disabled={actionLoading === 'payment'}
              className="w-full"
              variant="outline"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {actionLoading === 'payment' ? 'Abriendo...' : 'Gestionar Facturación'}
            </Button>
            
            {subscription.status === 'active' && (
              <Button
                onClick={handleCancelSubscription}
                disabled={actionLoading === 'cancel'}
                className="w-full"
                variant="destructive"
              >
                {actionLoading === 'cancel' ? 'Cancelando...' : 'Cancelar Suscripción'}
              </Button>
            )}
            
            {subscription.status === 'canceled' && (
              <Button
                onClick={handleReactivateSubscription}
                disabled={actionLoading === 'reactivate'}
                className="w-full"
              >
                {actionLoading === 'reactivate' ? 'Reactivando...' : 'Reactivar Suscripción'}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Plan gratuito - Upgrade */}
      {!isPremium && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-blue-600" />
              <span>Actualizar a Premium</span>
            </CardTitle>
            <CardDescription>
              Desbloquea todas las características avanzadas y obtén acceso ilimitado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.href = '/planes'}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              Ver Planes Premium
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default SubscriptionDashboard;