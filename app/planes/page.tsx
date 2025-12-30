'use client';

// Prevent static generation
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SimpleMainNavigation } from '../components/SimpleMainNavigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Loader2 } from 'lucide-react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const PRICE_MONTHLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY || 'price_placeholder_monthly';
const PRICE_YEARLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY || 'price_placeholder_yearly';

const plans = [
  {
    name: 'Plan Mensual',
    description: 'Perfecto para empezar y probar todas las herramientas.',
    priceId: PRICE_MONTHLY,
    directLink: 'https://buy.stripe.com/14AcN43PBc857IK6TO8og0c',
    price: '4.99',
    period: 'mes',
    features: [
      'Acceso completo a Escritor IA',
      'Generador de Correos IA',
      'Asistente de Prompts',
      'Exportación ilimitada',
      'Soporte prioritario',
    ],
    buttonText: 'Empezar ahora',
    popular: false,
  },
  {
    name: 'Plan Anual',
    description: 'La mejor opción para profesionales con un gran ahorro.',
    priceId: PRICE_YEARLY,
    directLink: 'https://buy.stripe.com/fZueVc4TFegdaUW5PK8og0d',
    price: '2.99',
    period: 'mes',
    features: [
      'Todo lo del plan mensual',
      'Ahorro máximo garantizado',
      'Acceso anticipado a nuevas funciones',
      'Consultoría SEO básica',
      'Soporte 24/7',
    ],
    buttonText: 'Ahorrar ahora',
    popular: true,
  },
];

export default function PlanesPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubscription = async (priceId: string, planName: string, directLink: string) => {
    if (!userId) {
      router.push('/auth');
      return;
    }

    setLoading(priceId);
    
    // Si tenemos un enlace directo, lo usamos con el email pre-rellenado
    if (directLink) {
      const email = user?.primaryEmailAddress?.emailAddress;
      const checkoutUrl = new URL(directLink);
      
      if (email) {
        checkoutUrl.searchParams.append('prefilled_email', email);
      }
      
      // Añadimos el ID de usuario para seguimiento en el webhook si es posible
      // Aunque buy.stripe.com no siempre soporta client_reference_id vía URL params directamente 
      // para todos los tipos de enlaces, es buena práctica intentar o usar el email como clave.
      if (userId) {
        checkoutUrl.searchParams.append('client_reference_id', userId);
      }

      window.location.href = checkoutUrl.toString();
      return;
    }

    try {
      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId, planName }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Error creating checkout session:', data.error);
        setLoading(null);
      }
    } catch (error) {
      console.error('Error:', error);
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
          <Badge variant="outline" className="px-3 py-1 uppercase tracking-widest text-[10px]">Precios transparentes</Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Apoyar <span className="italic font-serif">Red Creativa Pro</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Tu suscripción nos ayuda a seguir mejorando y manteniendo la plataforma. Cancela en cualquier momento.
            </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {plans.map((plan) => (
            <Card key={plan.priceId} className={`relative flex flex-col ${plan.popular ? 'border-primary shadow-lg ring-1 ring-primary' : 'border-border'}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="px-3 py-1 bg-primary text-primary-foreground font-semibold">MÁS POPULAR</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">€{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? 'default' : 'outline'}
                    size="lg"
                    disabled={loading !== null}
                    onClick={() => handleSubscription(plan.priceId, plan.name, plan.directLink)}
                  >
                  {loading === plan.priceId ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-20 text-center text-sm text-muted-foreground max-w-2xl mx-auto">
          <p>
            ¿Necesitas un plan personalizado para tu equipo? 
            <Link href="/contacto" className="text-foreground underline underline-offset-4 ml-1">Contacta con nosotros</Link>
          </p>
        </div>
      </main>

      <footer className="border-t py-12 bg-muted/20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 RED CREATIVA PRO — Gestión de suscripciones segura vía Stripe.
          </p>
        </div>
      </footer>
    </div>
  );
}
