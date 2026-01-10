"use client";

import { useEscritor } from "../../context/EscritorContext";
import { useSimpleTranslations } from "@/app/lib/simple-translations";

export function PromptPanel() {
    const { settings, setSettings } = useEscritor();
    const { t } = useSimpleTranslations(); // Might not need t if placeholder is hardcoded or comes from prop, but good to have.

    return (
        <div className="h-full p-2 flex flex-col">
            <textarea
                value={settings.customPrompt}
                onChange={(e) => setSettings(prev => ({ ...prev, customPrompt: e.target.value }))}
                placeholder="Instrucciones para la IA..."
                className="flex-1 w-full p-3 border-2 border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none bg-background text-foreground text-sm"
            />
        </div>
    );
}
