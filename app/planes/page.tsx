'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SharedLayout } from '../components/SharedLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Check, Loader2, Sparkles, ArrowUpRight, Coffee, Heart } from 'lucide-react';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import { useRouter } from 'next/navigation';

const PRICE_MONTHLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY || 'price_placeholder_monthly';
const PRICE_YEARLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY || 'price_placeholder_yearly';


const plans = [
  {
    name: 'Plan Gratuito',
    description: 'Prueba sin riesgo. Perfecto para descubrir si Red Creativa Pro es para ti.',
    priceId: 'free',
    directLink: '/escritor-ia',
    price: '0',
    period: 'siempre',
    dreamOutcome: 'Prueba el sistema',
    features: [
      '✅ 5 artículos por mes',
      '✅ IA Anti-Detección activada',
      '✅ SEO Score Básico',
      '✅ Exportación en texto plano',
      '❌ Sin consultoría SEO',
      '❌ Sin historial de versiones',
      '❌ Sin Traffic Accelerator',
      '❌ Sin análisis avanzado',
    ],
    valueProps: [
      { icon: '🎯', title: 'Sin riesgos', desc: 'prueba antes de pagar' },
      { icon: '⚡', title: 'Activación', desc: 'instantánea' },
      { icon: '🔒', title: 'Sin tarjeta', desc: 'requerida' },
    ],
    buttonText: 'Empezar Gratis',
    popular: false,
    isFree: true,
  },
  {
    name: 'Plan Mensual Pro',
    description: 'Perfecto para periodistas que quieren contenido irresistible con IA que aprende tu estilo.',
    priceId: PRICE_MONTHLY,
    directLink: 'https://buy.stripe.com/14AcN43PBc857IK6TO8og0c',
    price: '4.99',
    period: 'mes',
    dreamOutcome: '+300% tráfico orgánico',
    features: [
      '🚀 Escritor IA con Modo Agente Autónomo',
      '🎨 Aprendizaje de tu Estilo Personal',
      '🔍 Análisis SEO en Tiempo Real (score 0-100)',
      '🛡️ Detección Anti-IA (evita ser detectado)',
      '📊 Herramientas de Código Personalizadas',
      '💬 2 Sesiones de Consultoría SEO al mes',
      '⚡ Mejoras Sugeridas cada 2 Segundos',
      '📝 Exportación Ilimitada + Historial',
      '🎯 Generador de Meta Tags Automático',
      '✅ Soporte Prioritario Garantizado',
    ],
    valueProps: [
      { icon: '⏱️', title: 'Ahorra 10 horas', desc: 'por semana en redacción' },
      { icon: '📈', title: '+300% tráfico', desc: 'en 90 días garantizado' },
      { icon: '🎯', title: 'SEO perfecto', desc: 'cada artículo optimizado' },
    ],
    buttonText: 'Empezar ahora',
    popular: false,
    isFree: false,
  },
  {
    name: 'Plan Anual Elite',
    description: 'Máximo ahorro + estrategia de tráfico hecha por ti para periodistas serios.',
    priceId: PRICE_YEARLY,
    directLink: 'https://buy.stripe.com/fZueVc4TFegdaUW5PK8og0d',
    price: '2.99',
    period: 'mes',
    dreamOutcome: '+500% ROI en tráfico',
    features: [
      '⭐ Todo del Plan Mensual Pro',
      '🚀 Ahorro Máximo: 40% de descuento',
      '🎁 Acceso Anticipado a Nuevas Features',
      '📊 Traffic Accelerator Service (EXCLUSIVO)',
      '🔧 Optimización Técnica SEO Hecha por Ti',
      '📈 Estrategia de Tráfico Personalizada',
      '💎 Consultoría Ilimitada (incluye implementación)',
      '🎯 Análisis de Oportunidades de Enlaces Internos',
      '📱 Soporte 24/7 con Respuesta <2h',
      '🏆 Reporte Mensual de Crecimiento + ROI',
    ],
    valueProps: [
      { icon: '💰', title: 'ROI 500%+', desc: 'inversión recuperada en tráfico' },
      { icon: '🚀', title: 'Done-for-you', desc: 'hacemos el SEO técnico' },
      { icon: '📊', title: '+10K visitas', desc: 'mensuales en 6 meses' },
    ],
    buttonText: 'Maximizar Tráfico',
    popular: true,
    isFree: false,
  },
];


export default function PlanesPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const { user, isAuthenticated } = useKindeBrowserClient();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubscription = async (priceId: string, planName: string, directLink: string) => {
    // Si es plan gratuito, redirigir directamente
    if (priceId === 'free') {
      window.location.href = directLink;
      return;
    }

    // Verificar autenticación primero para planes de pago
    if (!mounted || !isAuthenticated) {
      // Mostrar alerta amigable
      if (confirm('Necesitas iniciar sesión para suscribirte. ¿Quieres iniciar sesión ahora?')) {
        window.location.href = '/api/auth/login?post_login_redirect_url=/planes';
      }
      return;
    }

    setLoading(priceId);

    if (directLink) {
      const email = user?.email;
      const checkoutUrl = new URL(directLink);

      if (email) {
        checkoutUrl.searchParams.append('prefilled_email', email);
      }

      if (user?.id) {
        checkoutUrl.searchParams.append('client_reference_id', user.id);
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
    <SharedLayout>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <main className="flex-grow container mx-auto px-4 py-20">

          {/* Hero con mensaje directo */}
          <div className="max-w-3xl mx-auto text-center mb-16 space-y-6">
            <div className="inline-block">
              <Badge variant="outline" className="px-3 py-1 uppercase tracking-widest text-[10px]">Un momento...</Badge>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
              ¿Por Qué Estás Aquí?
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              En serio, ¿ya probaste la herramienta o solo vienes a ver precios? 🤔
            </p>

            <div className="bg-muted/30 border-2 border-dashed border-primary/30 rounded-2xl p-8 mt-8">
              <h2 className="text-2xl font-bold mb-4">Consejo del creador:</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Red Creativa Pro es <span className="font-semibold text-foreground">100% gratis</span>.
                Literalmente todo funciona sin pagar. Las "membresías" son solo para
                <span className="font-semibold text-foreground"> apoyar el proyecto</span> si te gusta y quieres que siga mejorando.
              </p>
              <div className="space-y-3 text-left max-w-xl mx-auto">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">
                    Primero <strong className="text-foreground">usa la herramienta gratis</strong>
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">
                    Si te sirve y quieres <strong className="text-foreground">apoyar el desarrollo</strong>
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">
                    Envíame un DM a <Link href="https://instagram.com/sela_gb" target="_blank" className="font-semibold text-primary hover:underline">@sela_gb</Link> y hablamos
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button size="lg" className="h-14 px-10 text-lg" asChild>
                <Link href="/escritor-ia">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Ir a Probar Gratis
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-10 text-lg" asChild>
                <Link href="https://instagram.com/sela_gb" target="_blank">
                  Escribirle a Sela
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <Separator className="my-16 max-w-3xl mx-auto" />

          {/* Sección "Pero si insistes..." */}
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Pero Si <span className="italic font-serif">Insistes</span> en Pagar...
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Estas son las formas en las que puedes apoyar el proyecto. Pero en serio, primero úsalo gratis.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Opción 1: Apoyo casual */}
              <Card className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Coffee className="h-5 w-5 text-primary" />
                    <CardTitle>Invítame un Café</CardTitle>
                  </div>
                  <CardDescription>
                    Para que siga estudiando y mejorando esto
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-3xl font-bold">€4.99<span className="text-sm font-normal text-muted-foreground">/mes</span></div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary mt-0.5" />
                        <span>Acceso a TODO (que ya es gratis 😅)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary mt-0.5" />
                        <span>Tu nombre en la lista de apoyadores</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary mt-0.5" />
                        <span>Ayudas a mantener los servidores</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary mt-0.5" />
                        <span>Buenas vibras ✨</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => handleSubscription(PRICE_MONTHLY, 'Plan Mensual Pro', 'https://buy.stripe.com/14AcN43PBc857IK6TO8og0c')}
                    disabled={loading !== null}
                  >
                    {loading === PRICE_MONTHLY ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Apoyar Mensualmente
                  </Button>
                </CardFooter>
              </Card>

              {/* Opción 2: Apoyo comprometido */}
              <Card className="relative overflow-hidden border-primary shadow-lg ring-1 ring-primary">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="px-3 py-1 bg-primary text-primary-foreground font-semibold">MÁS POPULAR</Badge>
                </div>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="h-5 w-5 text-primary fill-primary" />
                    <CardTitle>Creo en Esto</CardTitle>
                  </div>
                  <CardDescription>
                    Apoyo anual + te ayudo personalmente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-3xl font-bold">€2.99<span className="text-sm font-normal text-muted-foreground">/mes</span></div>
                    <p className="text-xs text-muted-foreground">Facturado anualmente (€35.88/año)</p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary mt-0.5" />
                        <span>Todo del plan anterior</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary mt-0.5" />
                        <span>40% de descuento</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary mt-0.5" />
                        <span>Reunión mensual conmigo (en serio)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary mt-0.5" />
                        <span>Te ayudo con SEO técnico si me escribes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary mt-0.5" />
                        <span>Apoyas un proyecto independiente 🚀</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => handleSubscription(PRICE_YEARLY, 'Plan Anual Elite', 'https://buy.stripe.com/fZueVc4TFegdaUW5PK8og0d')}
                    disabled={loading !== null}
                  >
                    {loading === PRICE_YEARLY ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Apoyar Anualmente
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Mensaje final honesto */}
            <Card className="mt-12 max-w-3xl mx-auto bg-muted/30 border-2 border-primary/20">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-bold mb-4">💬 La Mejor Forma de Apoyar</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Más que dinero, lo que realmente ayuda es que <strong className="text-foreground">uses la herramienta</strong>,
                  me <strong className="text-foreground">cuentes qué mejorar</strong>, y si te sirve,
                  que se lo <strong className="text-foreground">recomiendes a otros periodistas</strong>.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="outline" asChild>
                    <Link href="https://instagram.com/sela_gb" target="_blank">
                      Escribirme sugerencias
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="https://es.trustpilot.com/review/redcreativa.pro" target="_blank">
                      Dejar reseña en Trustpilot
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

        </main>

        <footer className="border-t py-12 bg-muted/20">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-muted-foreground">
              © 2024 RED CREATIVA PRO — Proyecto indie para periodistas profesionales.
            </p>
          </div>
        </footer>
      </div>
    </SharedLayout>
  );
}
