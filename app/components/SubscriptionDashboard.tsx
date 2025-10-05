'use client';

import React, { useState } from 'react';
import { useSubscription } from '@/app/contexts/SubscriptionContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { 
  Calendar, 
  Crown, 
  Clock, 
  CreditCard, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

export default function SubscriptionDashboard() {
  const { subscriptionStatus, loading, refreshSubscription } = useSubscription();
  const [cancelling, setCancelling] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!subscriptionStatus) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            Error de Suscripción
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">No se pudo cargar el estado de tu suscripción.</p>
          <Button onClick={refreshSubscription} className="w-full">
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleCancelSubscription = async () => {
    if (!subscriptionStatus.subscription?.id) {
      toast.error('No hay suscripción activa para cancelar');
      return;
    }

    setCancelling(true);
    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: subscriptionStatus.subscription.id,
          feedback: 'Cancelación desde dashboard'
        }),
      });

      if (response.ok) {
        toast.success('Suscripción cancelada exitosamente');
        await refreshSubscription();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al cancelar la suscripción');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Error al cancelar la suscripción');
    } finally {
      setCancelling(false);
    }
  };

  const getPlanBadgeColor = (planType: string) => {
    switch (planType) {
      case 'monthly':
      case 'yearly':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'lifetime':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white';
      case 'trial':
        return 'bg-gradient-to-r from-green-500 to-blue-500 text-white';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'free':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusIcon = () => {
    if (subscriptionStatus.canAccessTools) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <AlertTriangle className="h-5 w-5 text-red-500" />;
  };

  const getProgressValue = () => {
    if (subscriptionStatus.planType === 'free' && subscriptionStatus.trialInfo) {
      const totalDays = 3; // 3-day trial
      const remaining = subscriptionStatus.daysRemaining || 0;
      return Math.max(0, (remaining / totalDays) * 100);
    }
    return subscriptionStatus.canAccessTools ? 100 : 0;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Estado de tu Suscripción
          </CardTitle>
          <CardDescription>
            Información detallada sobre tu plan actual y acceso a herramientas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="h-6 w-6 text-yellow-500" />
              <div>
                <p className="font-medium">Plan Actual</p>
                <Badge className={getPlanBadgeColor(subscriptionStatus.planType)}>
                  {subscriptionStatus.planType === 'free' ? 'Gratuito' :
                   subscriptionStatus.planType === 'monthly' ? 'Mensual' :
                   subscriptionStatus.planType === 'yearly' ? 'Anual' :
                   subscriptionStatus.planType === 'lifetime' ? 'Vitalicio' :
                   subscriptionStatus.planType === 'trial' ? 'Prueba' :
                   subscriptionStatus.planType === 'expired' ? 'Expirado' :
                   'Desconocido'}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Acceso a Herramientas</p>
              <p className={`font-medium ${subscriptionStatus.canAccessTools ? 'text-green-600' : 'text-red-600'}`}>
                {subscriptionStatus.canAccessTools ? 'Activo' : 'Bloqueado'}
              </p>
            </div>
          </div>

          {/* Days Remaining Counter */}
          {subscriptionStatus.planType === 'free' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Días Restantes del Período Gratuito</span>
                </div>
                <span className="text-2xl font-bold text-blue-600">
                  {subscriptionStatus.daysRemaining || 0}
                </span>
              </div>
              <Progress value={getProgressValue()} className="h-2" />
              <p className="text-xs text-gray-500">
                {subscriptionStatus.daysRemaining && subscriptionStatus.daysRemaining > 0
                  ? `Te quedan ${subscriptionStatus.daysRemaining} días de acceso gratuito`
                  : 'Tu período gratuito ha expirado'}
              </p>
            </div>
          )}

          {/* Expiration Date */}
          {subscriptionStatus.expirationDate && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>
                {subscriptionStatus.planType === 'free' 
                  ? `Período gratuito expira: ${new Date(subscriptionStatus.expirationDate).toLocaleDateString('es-ES')}`
                  : `Próxima renovación: ${new Date(subscriptionStatus.expirationDate).toLocaleDateString('es-ES')}`
                }
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Upgrade/Manage Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              {subscriptionStatus.planType === 'free' ? 'Actualizar Plan' : 'Gestionar Suscripción'}
            </CardTitle>
            <CardDescription>
              {subscriptionStatus.planType === 'free' 
                ? 'Accede a todas las herramientas premium sin límites'
                : 'Administra tu suscripción actual'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {subscriptionStatus.planType === 'free' ? (
              <>
                <Button 
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  onClick={() => window.location.href = '/pricing'}
                >
                  Ver Planes Premium
                </Button>
                {subscriptionStatus.daysRemaining && subscriptionStatus.daysRemaining <= 1 && (
                  <p className="text-sm text-red-600 text-center">
                    ⚠️ Tu acceso expira pronto. ¡Actualiza ahora!
                  </p>
                )}
              </>
            ) : (
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = '/pricing'}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Ver Detalles de Facturación
                </Button>
                {subscriptionStatus.subscription && subscriptionStatus.planType !== 'lifetime' && (
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={handleCancelSubscription}
                    disabled={cancelling}
                  >
                    {cancelling ? 'Cancelando...' : 'Cancelar Suscripción'}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Support & Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Soporte y Contacto</CardTitle>
            <CardDescription>
              ¿Necesitas ayuda? Contacta con nuestro equipo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.location.href = '/contact'}
            >
              Contactar al Creador
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.location.href = '/support'}
            >
              Centro de Ayuda
            </Button>
            <p className="text-xs text-gray-500 text-center">
              Para cancelaciones: +34 686887074
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Details */}
      {subscriptionStatus.subscription && (
        <Card>
          <CardHeader>
            <CardTitle>Detalles de la Suscripción</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-600">ID de Suscripción</p>
                <p className="font-mono text-xs">{subscriptionStatus.subscription.id}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Estado</p>
                <Badge variant={subscriptionStatus.subscription.status === 'active' ? 'default' : 'secondary'}>
                  {subscriptionStatus.subscription.status}
                </Badge>
              </div>
              <div>
                <p className="font-medium text-gray-600">Fecha de Inicio</p>
                <p>{new Date(subscriptionStatus.subscription.created_at).toLocaleDateString('es-ES')}</p>
              </div>
              {subscriptionStatus.subscription.current_period_end && (
                <div>
                  <p className="font-medium text-gray-600">Próxima Renovación</p>
                  <p>{new Date(subscriptionStatus.subscription.current_period_end).toLocaleDateString('es-ES')}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}