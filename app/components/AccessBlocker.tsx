'use client';

import { useEffect, useState } from 'react';
import { Lock, Clock, Crown, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SubscriptionStatus, checkSubscriptionStatus, shouldBlockAccess, getAccessMessage, getBlockingMessageColor } from '@/app/lib/subscription-middleware';

interface AccessBlockerProps {
  userId: string;
  children: React.ReactNode;
  toolName?: string;
}

export default function AccessBlocker({ userId, children, toolName = 'esta herramienta' }: AccessBlockerProps) {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchStatus() {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const status = await checkSubscriptionStatus(userId);
        setSubscriptionStatus(status);
      } catch (error) {
        console.error('Error fetching subscription status:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStatus();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!subscriptionStatus || !shouldBlockAccess(subscriptionStatus)) {
    return <>{children}</>;
  }

  const message = getAccessMessage(subscriptionStatus);
  const colorClasses = getBlockingMessageColor(subscriptionStatus);

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className={`max-w-md w-full rounded-lg border-2 p-8 text-center ${colorClasses}`}>
        <div className="mb-6">
          {subscriptionStatus.planType === 'expired' ? (
            <Lock className="h-16 w-16 mx-auto mb-4 text-red-500" />
          ) : (
            <Clock className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
          )}
        </div>

        <h2 className="text-2xl font-bold mb-4">
          {subscriptionStatus.planType === 'expired' ? 'Acceso Bloqueado' : 'Tiempo Limitado'}
        </h2>

        <p className="text-lg mb-6 leading-relaxed">
          {message}
        </p>

        {subscriptionStatus.planType === 'trial' && subscriptionStatus.daysRemaining > 0 && (
          <div className="mb-6 p-4 bg-white/50 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-lg font-semibold">
              <Clock className="h-5 w-5" />
              {subscriptionStatus.daysRemaining} día{subscriptionStatus.daysRemaining === 1 ? '' : 's'} restante{subscriptionStatus.daysRemaining === 1 ? '' : 's'}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => router.push('/planes')}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Crown className="h-5 w-5" />
            Ver Planes Premium
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
          >
            Ir al Dashboard
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-current/20">
          <p className="text-sm opacity-75">
            ¿Necesitas ayuda? <button 
              onClick={() => router.push('/contacto')}
              className="underline hover:no-underline font-medium"
            >
              Contacta al creador
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
