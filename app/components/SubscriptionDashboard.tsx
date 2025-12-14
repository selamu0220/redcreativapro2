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
import { useTranslation } from '@/app/lib/language/context';
import { formatDate } from '@/app/lib/localization';
import { useLocalization, usePaymentMethods, useCurrency } from '@/app/contexts/LocalizationContext';
import { paymentAdapterManager } from '@/lib/payment-adapter-manager';

export default function SubscriptionDashboard() {
  const { subscriptionStatus, loading, refreshSubscription } = useSubscription();
  const { t, currentLanguage } = useTranslation('dashboard');
  const [cancelling, setCancelling] = useState(false);
  
  // Localization hooks
  const { country, currency, formatCurrency, isLatinAmerica } = useLocalization();
  const { paymentMethods, hasOxxo, hasPix, hasMercadoPago, hasPse } = usePaymentMethods();
  const { format } = useCurrency();
  
  // Get available payment methods for current country
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<any[]>([]);
  
  React.useEffect(() => {
    const getPaymentMethods = async () => {
      try {
        const methods = paymentAdapterManager.getAvailablePaymentMethods({
          country,
          currency,
          amount: 100 // Default amount for method availability
        });
        setAvailablePaymentMethods(methods);
      } catch (error) {
        console.error('Error getting payment methods:', error);
      }
    };
    
    getPaymentMethods();
  }, [country, currency]);

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
            {t('subscription.errors.subscriptionError')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">{t('subscription.errors.loadError')}</p>
          <Button onClick={refreshSubscription} className="w-full">
            {t('subscription.errors.retry')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleCancelSubscription = async () => {
    if (!subscriptionStatus.subscription?.id) {
      toast.error(t('subscription.errors.noActiveSubscription'));
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
        toast.success(t('subscription.errors.cancelSuccess'));
        await refreshSubscription();
      } else {
        const error = await response.json();
        toast.error(error.error || t('subscription.errors.cancelError'));
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error(t('subscription.errors.cancelError'));
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
            {t('subscription.status')}
          </CardTitle>
          <CardDescription>
            {t('subscription.statusDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="h-6 w-6 text-yellow-500" />
              <div>
                <p className="font-medium">{t('subscription.currentPlan')}</p>
                <Badge className={getPlanBadgeColor(subscriptionStatus.planType)}>
                  {t(`subscription.plans.${subscriptionStatus.planType}`) || t('subscription.plans.unknown')}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">{t('subscription.toolAccess')}</p>
              <p className={`font-medium ${subscriptionStatus.canAccessTools ? 'text-green-600' : 'text-red-600'}`}>
                {subscriptionStatus.canAccessTools ? t('subscription.active') : t('subscription.blocked')}
              </p>
            </div>
          </div>

          {/* Days Remaining Counter */}
          {subscriptionStatus.planType === 'free' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">{t('subscription.daysRemaining')}</span>
                </div>
                <span className="text-2xl font-bold text-blue-600">
                  {subscriptionStatus.daysRemaining || 0}
                </span>
              </div>
              <Progress value={getProgressValue()} className="h-2" />
              <p className="text-xs text-gray-500">
                {subscriptionStatus.daysRemaining && subscriptionStatus.daysRemaining > 0
                  ? t('subscription.daysRemainingMessage', { days: subscriptionStatus.daysRemaining })
                  : t('subscription.expiredMessage')}
              </p>
            </div>
          )}

          {/* Expiration Date */}
          {subscriptionStatus.expirationDate && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>
                {subscriptionStatus.planType === 'free' 
                  ? t('subscription.freeExpires', { date: formatDate(new Date(subscriptionStatus.expirationDate), currentLanguage) })
                  : t('subscription.nextRenewal', { date: formatDate(new Date(subscriptionStatus.expirationDate), currentLanguage) })
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
              {subscriptionStatus.planType === 'free' ? t('subscription.actions.upgrade') : t('subscription.actions.manage')}
            </CardTitle>
            <CardDescription>
              {subscriptionStatus.planType === 'free' 
                ? t('subscription.actions.upgradeDescription')
                : t('subscription.actions.manageDescription')
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
                  {t('subscription.actions.viewPremiumPlans')}
                </Button>
                {subscriptionStatus.daysRemaining && subscriptionStatus.daysRemaining <= 1 && (
                  <p className="text-sm text-red-600 text-center">
                    {t('subscription.actions.upgradeNow')}
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
                  {t('subscription.actions.viewBillingDetails')}
                </Button>
                {subscriptionStatus.subscription && subscriptionStatus.planType !== 'lifetime' && (
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={handleCancelSubscription}
                    disabled={cancelling}
                  >
                    {cancelling ? t('subscription.actions.cancelling') : t('subscription.actions.cancelSubscription')}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Support & Contact */}
        <Card>
          <CardHeader>
            <CardTitle>{t('subscription.support.title')}</CardTitle>
            <CardDescription>
              {t('subscription.support.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.location.href = '/contact'}
            >
              {t('subscription.support.contactCreator')}
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.location.href = '/support'}
            >
              {t('subscription.support.helpCenter')}
            </Button>
            <p className="text-xs text-gray-500 text-center">
              {t('subscription.support.cancelPhone')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Regional Payment Methods */}
      {isLatinAmerica && availablePaymentMethods.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-500" />
              Métodos de Pago Disponibles ({country})
            </CardTitle>
            <CardDescription>
              Métodos de pago populares en tu región
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {availablePaymentMethods.map((method, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    {method.type === 'oxxo' && '🏪'}
                    {method.type === 'pix' && '💳'}
                    {method.type === 'pse' && '🏦'}
                    {method.type === 'mercadopago' && '💰'}
                    {method.type === 'spei' && '🏛️'}
                    {method.type === 'card' && '💳'}
                    {!['oxxo', 'pix', 'pse', 'mercadopago', 'spei', 'card'].includes(method.type) && '💳'}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{method.displayName}</p>
                    <p className="text-xs text-gray-500">{method.processingTime}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Regional Payment Method Highlights */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-2">
                💡 Métodos populares en {country}:
              </p>
              <div className="text-xs text-blue-700 space-y-1">
                {hasOxxo && <p>• OXXO - Pago en efectivo en tiendas</p>}
                {hasPix && <p>• PIX - Transferencia instantánea (Brasil)</p>}
                {hasPse && <p>• PSE - Débito online (Colombia)</p>}
                {hasMercadoPago && <p>• Mercado Pago - Billetera digital</p>}
                <p>• Tarjetas de crédito/débito internacionales</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription Details */}
      {subscriptionStatus.subscription && (
        <Card>
          <CardHeader>
            <CardTitle>{t('subscription.details.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-600">{t('subscription.details.subscriptionId')}</p>
                <p className="font-mono text-xs">{subscriptionStatus.subscription.id}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">{t('subscription.details.status')}</p>
                <Badge variant={subscriptionStatus.subscription.status === 'active' ? 'default' : 'secondary'}>
                  {subscriptionStatus.subscription.status}
                </Badge>
              </div>
              <div>
                <p className="font-medium text-gray-600">{t('subscription.details.startDate')}</p>
                <p>{formatDate(new Date(subscriptionStatus.subscription.created_at), currentLanguage)}</p>
              </div>
              {subscriptionStatus.subscription.current_period_end && (
                <div>
                  <p className="font-medium text-gray-600">{t('subscription.details.nextRenewal')}</p>
                  <p>{formatDate(new Date(subscriptionStatus.subscription.current_period_end), currentLanguage)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}