'use client';

import React, { useState } from 'react';
import { useWriter } from '../context/WriterContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Card, CardContent } from "@/app/components/ui/card";
import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Slider } from "@/app/components/ui/slider";
import { Switch } from "@/app/components/ui/switch";
import { Button } from "@/app/components/ui/button";
import { Separator } from "@/app/components/ui/separator";
import { Loader2, Mail, Minimize2, Maximize2, Sparkles, LayoutDashboard } from "lucide-react";
import { ThemePicker } from "@/app/components/ThemePicker";
import { useLanguage } from '@/app/lib/language/context';
import { useSimpleTranslations } from "@/app/lib/simple-translations"; // Added hook

const EXPANSION_LABELS_MAP: Record<string, string[]> = {
  es: ['Muy Conciso', 'Conciso', 'Equilibrado', 'Detallado', 'Muy Detallado'],
  en: ['Very Concise', 'Concise', 'Balanced', 'Detailed', 'Very Detailed']
};

export default function SettingsPanel() {
  const { currentLocale } = useLanguage();
  const { t } = useSimpleTranslations(); // Hook usage
  const {
    prePrompt, setPrePrompt,
    context, setContext,
    expansionLevel, setExpansionLevel,
    speed, setSpeed,
    emailModeEnabled, setEmailModeEnabled,
    emailRecipient, setEmailRecipient,
    emailSubject, setEmailSubject,
    soundEnabled, setSoundEnabled,
    dailyGoal, setDailyGoal,
    focusMode, setFocusMode
  } = useWriter();

  const [isExtractingPdf, setIsExtractingPdf] = useState(false);

  // Safe label getter to prevent crashes
  const getExpansionLabel = () => {
    try {
      const safeLocale = (currentLocale && EXPANSION_LABELS_MAP[currentLocale]) ? currentLocale : 'es';
      const labels = EXPANSION_LABELS_MAP[safeLocale] || EXPANSION_LABELS_MAP['es'];

      // Safety check for labels array
      if (!labels || !Array.isArray(labels)) return 'Equilibrado';

      const safeLevel = (typeof expansionLevel === 'number') ? expansionLevel : 0;
      const index = safeLevel + 2;

      // Boundary checks
      if (index < 0) return labels[0];
      if (index >= labels.length) return labels[labels.length - 1];

      return labels[index] || 'Equilibrado';
    } catch (err) {
      console.error("Error getting expansion label", err);
      return 'Equilibrado';
    }
  };

  // Mock PDF upload - real implementation calls API
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsExtractingPdf(true);
      setTimeout(() => setIsExtractingPdf(false), 2000); // Fake delay
    }
  };

  return (
    <div className="h-full w-full overflow-hidden flex flex-col bg-background">
      <div className="p-2 border-b">
        <h3 className="font-semibold text-sm">{t('settings_title')}</h3>
      </div>

      <Tabs defaultValue="context" className="flex-1 w-full flex flex-col">
        <div className="px-2 pt-2">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="context">{t('settings_tab_context')}</TabsTrigger>
            <TabsTrigger value="general">{t('settings_tab_general')}</TabsTrigger>
            <TabsTrigger value="appearance">{t('settings_tab_appearance')}</TabsTrigger>
            <TabsTrigger value="advanced">{t('settings_tab_advanced')}</TabsTrigger>
          </TabsList>
        </div>

        {/* --- TAB: CONTEXT --- */}
        <TabsContent value="context" className="flex-1 overflow-y-auto p-2 space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">{t('settings_preprompt_label')}</Label>
            <Textarea
              value={prePrompt || ''}
              onChange={(e) => setPrePrompt(e.target.value)}
              placeholder={t('settings_preprompt_placeholder')}
              className="min-h-[100px] text-sm"
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="text-xs">{t('settings_add_pdf')}</Label>
            <div className="flex gap-2">
              <Input
                type="file"
                accept=".pdf"
                onChange={handlePdfUpload}
                disabled={isExtractingPdf}
                className="h-8 text-xs cursor-pointer"
              />
              {isExtractingPdf && <Loader2 className="animate-spin w-5 h-5 text-primary" />}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">{t('settings_context_active')}</Label>
            <Textarea
              value={context || ''}
              onChange={(e) => setContext(e.target.value)}
              placeholder={t('settings_context_placeholder')}
              className="min-h-[200px] font-mono text-xs bg-muted/20"
            />
          </div>
        </TabsContent>

        {/* --- TAB: GENERAL --- */}
        <TabsContent value="general" className="flex-1 overflow-y-auto p-2 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-xs">{t('settings_length')}</Label>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">
                {getExpansionLabel()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Minimize2 className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              <Slider
                value={[typeof expansionLevel === 'number' ? expansionLevel : 0]}
                onValueChange={(v) => setExpansionLevel(v[0])}
                min={-2}
                max={2}
                step={1}
                className="flex-1"
              />
              <Maximize2 className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-xs">{t('settings_quality_speed')}</Label>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-muted">
                {speed === 0 ? t('settings_quality_high') : speed === 1 ? t('settings_quality_balance') : t('settings_quality_flash')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">{t('settings_quality_high')}</span>
              <Slider
                value={[typeof speed === 'number' ? speed : 1]}
                onValueChange={(v) => setSpeed(v[0])}
                min={0}
                max={2}
                step={1}
                className="flex-1"
              />
              <span className="text-[10px] text-muted-foreground">{t('settings_quality_flash')}</span>
            </div>
          </div>
        </TabsContent>

        {/* --- TAB: ADVANCED --- */}
        <TabsContent value="advanced" className="flex-1 overflow-y-auto p-2 space-y-4">
          <Card className="border-muted shadow-sm">
            <CardContent className="p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2 text-xs">
                    <Mail className="w-3 h-3" />
                    {t('settings_email_mode')}
                  </Label>
                </div>
                <Switch
                  checked={!!emailModeEnabled}
                  onCheckedChange={setEmailModeEnabled}
                  id="email-mode"
                  className="scale-75 origin-right"
                />
              </div>

              {emailModeEnabled && (
                <div className="space-y-2 pt-1 border-t mt-2">
                  <div className="space-y-1">
                    <Label htmlFor="email-recipient" className="text-[10px]">{t('settings_email_recipient')}</Label>
                    <Input
                      id="email-recipient"
                      type="email"
                      value={emailRecipient || ''}
                      onChange={(e) => setEmailRecipient(e.target.value)}
                      placeholder="email@ejemplo.com"
                      className="h-7 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="email-subject" className="text-[10px]">{t('settings_email_subject')}</Label>
                    <Input
                      id="email-subject"
                      value={emailSubject || ''}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="..."
                      className="h-7 text-xs"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="h-auto py-2 flex flex-col gap-1 items-center justify-center text-center group">
              <LayoutDashboard className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs">{t('settings_templates')}</span>
            </Button>
          </div>
        </TabsContent>

        {/* --- TAB: APPEARANCE --- */}
        <TabsContent value="appearance" className="flex-1 overflow-y-auto p-2 space-y-4">
          <ThemePicker />
          <div className="p-4 rounded-lg bg-muted/20 border border-dashed border-border text-center">
            <p className="text-[10px] text-muted-foreground">{t('settings_more_themes')}</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
