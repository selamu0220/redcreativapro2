"use client";

import { useEscritor } from "../../context/EscritorContext";
import { useSimpleTranslations } from "@/app/lib/simple-translations";
import { Badge } from "@/components/ui/badge";

export function CreativityPanel() {
    const { settings, setSettings } = useEscritor();
    const { t } = useSimpleTranslations();

    return (
        <div className="h-full p-2 space-y-4">
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{t('level')}</span>
                    <Badge variant="outline">
                        {settings.creativity} {settings.creativity <= 0.3 ? `(${t('conservative')})` : settings.creativity <= 0.7 ? `(${t('balanced')})` : `(${t('creative')})`}
                    </Badge>
                </div>
                <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={settings.creativity}
                    onChange={(e) => setSettings(prev => ({ ...prev, creativity: parseFloat(e.target.value) }))}
                    className="w-full h-2 bg-primary/20 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Conservador</span>
                    <span>Creativo</span>
                </div>
            </div>
        </div>
    );
}
