"use client";

import { useEscritor, AIModelId } from "../../context/EscritorContext";
import { useSimpleTranslations } from "@/app/lib/simple-translations";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Zap, Brain, Sparkles, Rocket } from "lucide-react";

export function ModelSelector() {
    const { selectedModel, setSelectedModel } = useEscritor();
    const { t } = useSimpleTranslations(); // Optional

    const models: {
        id: AIModelId;
        name: string;
        icon: any;
        desc: string;
        provider: 'OpenRouter';
        badge?: string;
    }[] = [
            {
                id: 'xiaomi/mimo-v2-flash:free',
                name: 'Xiaomi MiMo V2',
                icon: Zap,
                desc: 'Rápido y gratuito',
                provider: 'OpenRouter',
                badge: 'FREE'
            },
            {
                id: 'meta-llama/llama-3.3-70b-instruct:free',
                name: 'Llama 3.3 70B',
                icon: Brain,
                desc: 'Potente y gratuito',
                provider: 'OpenRouter',
                badge: 'FREE'
            },
            {
                id: 'google/gemini-2.0-flash-exp:free',
                name: 'Gemini 2.0 Flash',
                icon: Rocket,
                desc: 'Último modelo de Google',
                provider: 'OpenRouter',
                badge: 'NEW'
            }
        ];

    return (
        <div className="space-y-2">
            <span className="text-sm font-medium">Modelo de IA</span>
            <Select value={selectedModel} onValueChange={(val) => setSelectedModel(val as AIModelId)}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Model" />
                </SelectTrigger>
                <SelectContent>
                    {models.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                            <div className="flex items-center justify-between gap-2 w-full">
                                <div className="flex items-center gap-2">
                                    <model.icon className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium text-sm">{model.name}</span>
                                </div>
                                <Badge variant="outline" className="text-xs ml-2">
                                    {model.provider}
                                </Badge>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
                {models.find(m => m.id === selectedModel)?.desc}
            </p>
        </div>
    );
}
