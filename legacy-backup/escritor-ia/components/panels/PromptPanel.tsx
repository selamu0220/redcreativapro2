"use client";

import { useEscritor } from "../../context/EscritorContext";
import { useSimpleTranslations } from "@/app/lib/simple-translations";
import { getProfile } from "@/app/lib/writing-profiles";
import { Info } from "lucide-react";

export function PromptPanel() {
    const { settings, setSettings } = useEscritor();
    const { t } = useSimpleTranslations();

    const currentProfileId = settings.profileId || 'journalism-general';
    const isCustom = currentProfileId === 'custom';
    const profile = getProfile(currentProfileId);

    return (
        <div className="h-full p-2 flex flex-col space-y-2">
            {!isCustom && (
                <div className="bg-muted p-2 rounded-md flex items-start gap-2 text-xs text-muted-foreground">
                    <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>
                        Estás usando el perfil <strong>{profile.name}</strong>.
                        Cambia a "Personalizado" en el panel de Agente para escribir tus propias instrucciones.
                    </span>
                </div>
            )}
            <textarea
                value={isCustom ? settings.customPrompt : profile.systemInstruction}
                onChange={(e) => {
                    if (isCustom) {
                        setSettings(prev => ({ ...prev, customPrompt: e.target.value }));
                    }
                }}
                readOnly={!isCustom}
                placeholder="Instrucciones para la IA..."
                className={`flex-1 w-full p-3 border-2 border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none bg-background text-foreground text-sm ${!isCustom ? 'opacity-70 cursor-not-allowed bg-muted/50' : ''
                    }`}
            />
        </div>
    );
}
