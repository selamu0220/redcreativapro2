'use client';

// Prevent static generation
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SimpleMainNavigation } from '../components/SimpleMainNavigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { SignUpButton, useUser } from '@clerk/nextjs';
import { useSubscription } from '../hooks/useSubscription';
import { toast } from 'sonner';

export default function PlanesPage() {
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();
  const { createCheckoutSession } = useSubscription();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubscribe = async (plan: any) => {
    if (!user) {
      toast.error("Por favor, inicia sesión para suscribirte");
      return;
    }

    setLoadingPlan(plan.name);
    try {
      const priceId = plan.name === "Pro Mensual" 
        ? process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY || 'price_placeholder_monthly'
        : process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY || 'price_placeholder_yearly';
      
      await createCheckoutSession(priceId, plan.name);
    } catch (error: any) {
      console.error("Error al iniciar suscripción:", error);
      toast.error("Error al iniciar el proceso de pago. Por favor intenta de nuevo.");
    } finally {
      setLoadingPlan(null);
    }
  };

  const plans = [
    {
      name: "Gratis",
      price: "€0",
      period: "/mes",
      description: "Ideal para probar nuestras herramientas de IA.",
      features: [
        "Acceso limitado a herramientas",
        "5 generaciones diarias",
        "Soporte básico vía email",
        "Acceso a modelos estándar"
      ],
      cta: "Comenzar Gratis",
      href: "signup",
      variant: "outline" as const
    },
    {
      name: "Pro Mensual",
      price: "€5",
      period: "/mes",
      description: "Para creadores que necesitan potencia ilimitada.",
      features: [
        "Acceso ilimitado a todas las herramientas",
        "Generaciones ilimitadas",
        "Soporte prioritario 24/7",
        "Acceso anticipado a nuevos modelos",
        "Exportación en múltiples formatos"
      ],
      cta: "Suscribirse",
      href: "#",
      popular: true,
      variant: "default" as const
    },
    {
      name: "Pro Anual",
      price: "€3",
      period: "/mes",
      description: "La mejor opción para profesionales y agencias.",
      subtitle: "Facturado anualmente (€36/año)",
      features: [
        "Todo lo incluido en el plan Pro",
        "Ahorra un 40% anual",
        "Configuración personalizada",
        "Consultoría básica de IA incluída"
      ],
      cta: "Suscribirse Anual",
      href: "#",
      badge: "Mejor valor",
      variant: "secondary" as const
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SimpleMainNavigation />
      
      <main className="flex-grow container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
          <Badge variant="outline" className="px-3 py-1 uppercase tracking-widest text-[10px]">Precios transparentes</Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Elige tu plan de <span className="italic font-serif">productividad</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Sin contratos ocultos ni complicaciones. Cancela en cualquier momento.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`relative flex flex-col ${plan.popular ? 'border-primary shadow-lg scale-105 z-10' : 'border-border'}`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground border-none">
                    {plan.badge}
                  </Badge>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="pt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                {plan.subtitle && (
                  <p className="text-xs text-muted-foreground font-mono mt-1 uppercase tracking-tighter">
                    {plan.subtitle}
                  </p>
                )}
              </CardHeader>
              
              <CardContent className="flex-grow">
                <ul className="space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-foreground mr-3 mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>

                <CardFooter>
                  {plan.href === 'signup' ? (
                    mounted ? (
                      <SignUpButton mode="modal">
                        <Button variant={plan.variant} className="w-full h-11">
                          {plan.cta}
                        </Button>
                      </SignUpButton>
                    ) : (
                      <Button variant={plan.variant} className="w-full h-11" disabled>
                        {plan.cta}
                      </Button>
                    )
                  ) : (
                    <Button 
                      variant={plan.variant} 
                      className="w-full h-11"
                      onClick={() => handleSubscribe(plan)}
                      disabled={loadingPlan === plan.name}
                    >
                      {loadingPlan === plan.name ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        plan.cta
                      )}
                    </Button>
                  )}
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
            © 2024 RED CREATIVA PRO — Todos los pagos son procesados de forma segura vía Stripe.
          </p>
        </div>
      </footer>
    </div>
  );
}

