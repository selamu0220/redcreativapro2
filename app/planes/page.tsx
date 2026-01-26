'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SharedLayout } from '../components/SharedLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSimpleTranslations } from '../lib/simple-translations';

const PRICE_MONTHLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY || 'price_placeholder_monthly';
const PRICE_YEARLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY || 'price_placeholder_yearly';

export default function PlanesPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const { user, isAuthenticated, login } = useAuth();
  const { t } = useSimpleTranslations();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubscription = async (priceId: string, directLink: string) => {
    if (priceId === 'free') {
      window.location.href = '/escritor-ia';
      return;
    }

    if (!mounted || !isAuthenticated) {
      if (confirm('Necesitas iniciar sesión para suscribirte. ¿Quieres iniciar sesión ahora?')) {
        await login();
      }
      return;
    }

    setLoading(priceId);

    const email = user?.email;
    const checkoutUrl = new URL(directLink);
    if (email) checkoutUrl.searchParams.append('prefilled_email', email);
    if (user?.id) checkoutUrl.searchParams.append('client_reference_id', user.id);
    window.location.href = checkoutUrl.toString();
  };

  return (
    <SharedLayout>
      <div className="min-h-screen bg-white text-zinc-900 flex flex-col">
        <main className="flex-grow container mx-auto px-4 py-16">

          {/* ENEMY COMMON SECTION - El dolor real */}
          <div className="max-w-3xl mx-auto mb-16 text-center">
            <Badge variant="destructive" className="mb-6 text-xs uppercase tracking-wider">
              ⚠️ Advertencia para creadores de contenido
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">
              <span className="text-red-600">El 73% de los editores</span> ya usan detectores de IA.
              <br />
              <span className="text-zinc-900">¿Cuánto tiempo antes de que te pillen?</span>
            </h1>
            <p className="text-xl text-zinc-600 mb-8">
              El contenido IA genérico deja patrones reconocibles que los detectores identifican en segundos.
            </p>

            {/* Consecuencias */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-2xl mb-2">💼</div>
                <p className="text-sm text-red-800 font-medium">Pérdida de credibilidad profesional</p>
              </div>
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-2xl mb-2">🚫</div>
                <p className="text-sm text-red-800 font-medium">Cancelación de contratos</p>
              </div>
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-2xl mb-2">📉</div>
                <p className="text-sm text-red-800 font-medium">Google penaliza contenido "robótico"</p>
              </div>
            </div>
          </div>

          {/* MECHANISM - StealthWrite™ */}
          <div className="max-w-4xl mx-auto mb-16 bg-zinc-900 text-white rounded-2xl p-8 md:p-12">
            <div className="text-center mb-8">
              <Badge className="mb-4 bg-emerald-500 hover:bg-emerald-600 text-white">
                ✨ LA SOLUCIÓN
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Sistema StealthWrite™
              </h2>
              <p className="text-zinc-400 text-lg">
                La única IA que <strong className="text-white">optimiza TU texto</strong>, no lo genera desde cero.
                <br />
                Por eso es indetectable.
              </p>
            </div>

            {/* Comparison Table */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-red-900/30 border border-red-500/30 rounded-xl">
                <h3 className="text-lg font-bold text-red-400 mb-4">❌ Contenido IA Genérico</h3>
                <ul className="space-y-3 text-sm text-zinc-300">
                  <li className="flex gap-2"><span className="text-red-400">✗</span> Patrones repetitivos detectables</li>
                  <li className="flex gap-2"><span className="text-red-400">✗</span> Estilo genérico y robótico</li>
                  <li className="flex gap-2"><span className="text-red-400">✗</span> Sin estructura SEO optimizada</li>
                  <li className="flex gap-2"><span className="text-red-400">✗</span> Pierdes tu voz única</li>
                </ul>
              </div>
              <div className="p-6 bg-emerald-900/30 border border-emerald-500/30 rounded-xl">
                <h3 className="text-lg font-bold text-emerald-400 mb-4">✓ StealthWrite™</h3>
                <ul className="space-y-3 text-sm text-zinc-300">
                  <li className="flex gap-2"><span className="text-emerald-400">✓</span> Mejora TU borrador = indetectable</li>
                  <li className="flex gap-2"><span className="text-emerald-400">✓</span> Mantiene tu estilo personal</li>
                  <li className="flex gap-2"><span className="text-emerald-400">✓</span> H2/Meta/Schema automáticos</li>
                  <li className="flex gap-2"><span className="text-emerald-400">✓</span> Tu voz, amplificada</li>
                </ul>
              </div>
            </div>
          </div>

          {/* VALUE STACK */}
          <div className="max-w-3xl mx-auto mb-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Todo lo que incluye:</h2>
              <p className="text-zinc-500">Valor total de mercado vs. tu inversión</p>
            </div>

            <div className="bg-gradient-to-b from-zinc-50 to-white border-2 border-zinc-200 rounded-2xl overflow-hidden">
              <div className="divide-y divide-zinc-200">
                <div className="flex justify-between items-center p-4 hover:bg-zinc-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-600" />
                    <span className="font-medium">Escritor IA con StealthWrite™</span>
                  </div>
                  <span className="text-zinc-400 line-through">€297</span>
                </div>
                <div className="flex justify-between items-center p-4 hover:bg-zinc-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-600" />
                    <span className="font-medium">+50 Pre-prompts SEO listos para usar</span>
                  </div>
                  <span className="text-zinc-400 line-through">€97</span>
                </div>
                <div className="flex justify-between items-center p-4 hover:bg-zinc-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-600" />
                    <span className="font-medium">Guía: Aparecer en Gemini y ChatGPT</span>
                  </div>
                  <span className="text-zinc-400 line-through">€47</span>
                </div>
                <div className="flex justify-between items-center p-4 hover:bg-zinc-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-600" />
                    <span className="font-medium">Bóveda de Automatización (Make.com)</span>
                  </div>
                  <span className="text-zinc-400 line-through">€197</span>
                </div>
                <div className="flex justify-between items-center p-4 hover:bg-zinc-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-600" />
                    <span className="font-medium">Soporte 1-a-1 con el creador</span>
                  </div>
                  <span className="text-zinc-400 line-through">€147</span>
                </div>
              </div>

              {/* Total */}
              <div className="bg-zinc-900 text-white p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-zinc-400">Valor total:</span>
                  <span className="text-2xl font-bold line-through text-zinc-500">€785</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold">Tu inversión hoy:</span>
                  <div className="text-right">
                    <span className="text-4xl font-black text-emerald-400">€1</span>
                    <span className="text-zinc-400">/mes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PRICING - 2 COLUMNS */}
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-16">

            {/* FREE */}
            <Card className="border border-zinc-200">
              <CardHeader>
                <CardTitle className="text-xl">redcreativa.pro v1.0</CardTitle>

                <p className="text-zinc-500 text-sm">Para probar sin compromiso</p>
                <div className="mt-2">
                  <span className="text-3xl font-bold">€0</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-zinc-600">
                  <li className="flex gap-2"><Check className="h-4 w-4 text-emerald-600" /> 5 artículos al mes</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-emerald-600" /> Corrección de estilo básica</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-emerald-600" /> Exportar a texto plano</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/escritor-ia">Probar Gratis</Link>
                </Button>
              </CardFooter>
            </Card>

            {/* PRO */}
            <Card className="border-2 border-zinc-900 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                785x VALOR
              </div>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">redcreativa.pro v3.0</CardTitle>

                  <Badge>StealthWrite™</Badge>
                </div>
                <p className="text-zinc-500 text-sm">Todo desbloqueado + indetectable</p>
                <div className="mt-2">
                  <span className="text-3xl font-bold">€1</span>
                  <span className="text-zinc-500">/mes</span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">Precio de lanzamiento. Solo para los primeros 1000 usuarios.</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-zinc-600">
                  <li className="flex gap-2"><Check className="h-4 w-4 text-emerald-600" /> Artículos ilimitados</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-emerald-600" /> Sistema StealthWrite™ (indetectable)</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-emerald-600" /> SEO Score + Meta Tags automáticos</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-emerald-600" /> +50 Pre-prompts SEO</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-emerald-600" /> Bóveda de Automatización</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-emerald-600" /> Soporte 1-a-1 con el creador</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-zinc-900 hover:bg-zinc-800"
                  onClick={() => handleSubscription(PRICE_MONTHLY, 'https://buy.stripe.com/14AcN43PBc857IK6TO8og0c')}
                  disabled={loading !== null}
                >
                  {loading === PRICE_MONTHLY ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Empezar por €1/mes
                </Button>
              </CardFooter>
            </Card>

          </div>

          {/* ANTI-DETECTION GUARANTEE */}
          <div className="max-w-xl mx-auto mb-12 bg-emerald-50 border-2 border-emerald-300 rounded-xl p-8 text-center">
            <div className="text-4xl mb-4">🛡️</div>
            <h3 className="text-xl font-bold text-emerald-900 mb-3">Garantía Anti-Detección</h3>
            <p className="text-emerald-800 mb-4">
              Usa StealthWrite™ durante 30 días. Si alguna herramienta de IA detecta tu contenido como "generado por máquina",
              te devolvemos el dinero <strong>+ €10 por hacerte perder el tiempo</strong>.
            </p>
            <p className="text-sm text-emerald-600">
              Sin preguntas. Sin letra pequeña. Porque estamos seguros de que funciona.
            </p>
          </div>

          {/* URGENCY */}
          <div className="text-center max-w-xl mx-auto text-sm text-zinc-500 mb-8">
            <p className="mb-2">
              <strong>⏰ Los detectores de IA mejoran cada día.</strong>
            </p>
            <p>
              Cuanto antes empieces a usar StealthWrite™, antes protegerás tu reputación.
              <br />
              No esperes a que sea demasiado tarde.
            </p>
          </div>

        </main>

        <footer className="border-t py-8">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-zinc-400">
              © 2025 Red Creativa Pro
            </p>
          </div>
        </footer>
      </div>
    </SharedLayout>
  );
}
