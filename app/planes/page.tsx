'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { SharedLayout } from '../components/SharedLayout';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useAuth } from '../hooks/useAuth';
import { useSimpleTranslations } from '../lib/simple-translations';
import { PricingCard } from './PricingCard';
import { motion } from 'framer-motion';
import { Check, Shield, Zap, Globe, Lock } from 'lucide-react';
import { PricingSchema } from '@/components/seo/PricingSchema';

const PRICE_MONTHLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY || 'price_placeholder_monthly';
const PRICE_YEARLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY || 'price_placeholder_yearly';

export default function PlanesPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);

  const { user, isAuthenticated, login } = useAuth();
  const { t } = useSimpleTranslations(); // Using unified translations

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

  const currentPrice = isAnnual ? '€10' : '€1';
  const currentPeriod = isAnnual ? t('pricing_card_period_year') : t('pricing_card_period_month');
  const billingText = isAnnual ? t('pricing_billed_annually') : t('pricing_billed_monthly');

  return (
    <SharedLayout>
      <PricingSchema />
      <div className="min-h-screen bg-background text-foreground selection:bg-emerald-100 selection:text-emerald-900">

        {/* HERO SECTION */}
        <section className="relative pt-24 pb-16 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50/50 via-background to-background opacity-70" />

          <div className="container relative mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200 mb-6 px-4 py-1.5 text-sm font-medium rounded-full">
                {t('pricing_hero_badge')}
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
                {t('pricing_hero_title_1')}<span className="text-emerald-600">{t('pricing_hero_title_2')}</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                {t('pricing_hero_desc')}
              </p>
            </motion.div>

            {/* TOGGLE */}
            <div className="flex items-center justify-center gap-4 mb-16">
              <Label htmlFor="billing-toggle" className={`text-sm font-medium cursor-pointer ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                {t('pricing_toggle_monthly')}
              </Label>
              <Switch
                id="billing-toggle"
                checked={isAnnual}
                onCheckedChange={setIsAnnual}
                className="data-[state=checked]:bg-emerald-600"
              />
              <Label htmlFor="billing-toggle" className={`text-sm font-medium cursor-pointer ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                {t('pricing_toggle_yearly')} <span className="text-emerald-600 text-xs ml-1 font-bold">{t('pricing_toggle_discount')}</span>
              </Label>
            </div>
          </div>
        </section>

        {/* PRICING CARDS */}
        <section className="container mx-auto px-4 pb-24">
          <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">

            {/* FREE PLAN */}
            <PricingCard
              title={t('pricing_card_free_title')}
              description={t('pricing_card_free_desc')}
              price="€0"
              period={t('pricing_card_period_forever')}
              buttonText={t('pricing_card_free_btn')}
              buttonLink="/escritor-ia"
              features={[
                { text: t('pricing_feature_5_articles'), included: true },
                { text: t('pricing_feature_basic_correction'), included: true },
                { text: t('pricing_feature_export_plain'), included: true },
                { text: t('pricing_feature_standard_mode'), included: true },
                { text: t('pricing_feature_stealth'), included: false },
                { text: t('pricing_feature_seo_advanced'), included: false },
              ]}
              testId="pricing-card-free"
            />

            {/* PRO PLAN */}
            <PricingCard
              popular={true}
              popularLabel={t('pricing_card_popular_badge')}
              title={t('pricing_card_pro_title')}
              description={t('pricing_card_pro_desc')}
              price={currentPrice}
              period={currentPeriod}
              buttonText={loading === PRICE_MONTHLY ? t('pricing_card_pro_processing') : t('pricing_card_pro_btn')}
              onButtonClick={() => handleSubscription(
                isAnnual ? PRICE_YEARLY : PRICE_MONTHLY,
                isAnnual
                  ? 'https://buy.stripe.com/fZueVc4TFegdaUW5PK8og0d'
                  : 'https://buy.stripe.com/14AcN43PBc857IK6TO8og0c'
              )}
              loading={loading === PRICE_MONTHLY}
              features={[
                { text: t('pricing_feature_unlimited'), included: true },
                { text: t('pricing_feature_stealth'), included: true },
                { text: t('pricing_feature_seo_score'), included: true },
                { text: t('pricing_feature_automation_vault'), included: true },
                { text: t('pricing_feature_preprompts'), included: true },
                { text: t('pricing_feature_support'), included: true },
              ]}
              testId="pricing-card-pro"
            />
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Lock className="w-3 h-3" /> {t('pricing_secure_payment')}
            </p>
          </div>
        </section>

        {/* FEATURE GRID / COMPARISON */}
        <section className="bg-muted/30 py-24 border-y border-border">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-4">{t('pricing_benefit_title')}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t('pricing_benefit_subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 mb-4">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">{t('pricing_benefit_1_title')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('pricing_benefit_1_desc')}
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">{t('pricing_benefit_2_title')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('pricing_benefit_2_desc')}
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-4">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">{t('pricing_benefit_3_title')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('pricing_benefit_3_desc')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-24 container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">{t('pricing_faq_title')}</h2>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>{t('pricing_faq_1_q')}</AccordionTrigger>
              <AccordionContent>
                {t('pricing_faq_1_a')}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>{t('pricing_faq_2_q')}</AccordionTrigger>
              <AccordionContent>
                {t('pricing_faq_2_a')}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>{t('pricing_faq_3_q')}</AccordionTrigger>
              <AccordionContent>
                {t('pricing_faq_3_a')}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>{t('pricing_faq_4_q')}</AccordionTrigger>
              <AccordionContent>
                {t('pricing_faq_4_a')}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

      </div>
    </SharedLayout>
  );
}
