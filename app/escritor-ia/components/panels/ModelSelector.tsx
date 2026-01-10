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
        provider: 'Google AI' | 'OpenRouter';
    }[] = [
            {
                id: 'gemini-2.5-flash',
                name: 'Gemini 2.5 Flash',
                icon: Zap,
                desc: 'Rápido y eficiente',
                provider: 'Google AI'
            },
            {
                id: 'gemini-1.5-pro',
                name: 'Gemini 1.5 Pro',
                icon: Brain,
                desc: 'Mayor razonamiento',
                provider: 'Google AI'
            },
            {
                id: 'gemini-1.5-flash',
                name: 'Gemini 1.5 Flash',
                icon: Sparkles,
                desc: 'Versión anterior',
                provider: 'Google AI'
            },
            {
                id: 'minimax-m2.1',
                name: 'MiniMax M2.1',
                icon: Rocket,
                desc: 'Modelo avanzado de OpenRouter',
                provider: 'OpenRouter'
            },
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
