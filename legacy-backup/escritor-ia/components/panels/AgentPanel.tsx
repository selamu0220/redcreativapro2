"use client";

import { useEscritor } from "../../context/EscritorContext";
import { useSimpleTranslations } from "@/app/lib/simple-translations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Play, Pause } from "lucide-react";
import { ModelSelector } from "./ModelSelector";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { WRITING_PROFILES } from "@/app/lib/writing-profiles";

export function AgentPanel() {
    const { settings, setSettings } = useEscritor();
    const { t } = useSimpleTranslations();

    return (
        <div className="h-full p-2 space-y-4">

            <ModelSelector />



            <Separator />

            <div className="space-y-2">
                <span className="text-sm font-medium">Perfil de Escritura</span>
                <Select
                    value={settings.profileId || 'journalism-general'}
                    onValueChange={(val) => setSettings(prev => ({ ...prev, profileId: val }))}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar perfil" />
                    </SelectTrigger>
                    <SelectContent>
                        {WRITING_PROFILES.map(profile => (
                            <SelectItem key={profile.id} value={profile.id}>
                                {profile.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                    {WRITING_PROFILES.find(p => p.id === (settings.profileId || 'journalism-general'))?.description}
                </p>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t('activateAgent')}</span>
                <Button
                    variant={settings.autoMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSettings(prev => ({ ...prev, autoMode: !prev.autoMode }))}
                    className="h-8 px-3"
                >
                    {settings.autoMode ? (
                        <>
                            <Pause className="h-3 w-3 mr-1" />
                            {t('active')}
                        </>
                    ) : (
                        <>
                            <Play className="h-3 w-3 mr-1" />
                            {t('inactive')}
                        </>
                    )}
                </Button>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{t('interval')}</span>
                    <Badge variant="outline">{settings.autoInterval}s</Badge>
                </div>
                <input
                    type="range"
                    min="2"
                    max="300"
                    step="1"
                    value={settings.autoInterval}
                    onChange={(e) => setSettings(prev => ({ ...prev, autoInterval: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-primary/20 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>2s</span>
                    <span>5min</span>
                </div>
            </div>
        </div>
    );
}
