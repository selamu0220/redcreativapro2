import {
    Zap,
    Target,
    ShieldCheck,
    AlertTriangle,
    RefreshCw,
    Search,
    CheckCircle2,
    XCircle,
    Hash
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface WriterAssistantPanelProps {
    seoScore: number;
    aiRisk: 'low' | 'medium' | 'high';
    keywords: string[];
    isAnalyzing: boolean;
    wordCount: number;
    readabilityScore: number;
}

export default function WriterAssistantPanel({
    seoScore,
    aiRisk,
    keywords,
    isAnalyzing,
    wordCount,
    readabilityScore
}: WriterAssistantPanelProps) {

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'low': return 'text-green-500 bg-green-500/10 border-green-500/20';
            case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            case 'high': return 'text-red-500 bg-red-500/10 border-red-500/20';
            default: return 'text-muted-foreground';
        }
    };

    const getRiskLabel = (risk: string) => {
        switch (risk) {
            case 'low': return 'Muy Humano';
            case 'medium': return 'Posible IA';
            case 'high': return 'Alta Probabilidad IA';
            default: return 'Analizando...';
        }
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            {/* SEO Score Card */}
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-primary" />
                            <CardTitle className="text-sm font-bold uppercase tracking-wider">SEO Score</CardTitle>
                        </div>
                        {isAnalyzing && <RefreshCw className="w-3 h-3 animate-spin text-muted-foreground" />}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-end justify-between mb-2">
                        <span className="text-3xl font-bold">{seoScore}</span>
                        <span className="text-sm text-muted-foreground mb-1">/ 100</span>
                    </div>
                    <Progress value={seoScore} className="h-2 mb-4" />

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Legibilidad</span>
                            <span className="font-medium">{readabilityScore}/100</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Palabras clave</span>
                            <span className="font-medium">{keywords.length > 0 ? 'Detectadas' : 'Pendiente'}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* AI Detection Card */}
            <Card className={`border shadow-sm transition-colors ${aiRisk === 'high' ? 'border-red-200 dark:border-red-900/30' :
                    aiRisk === 'medium' ? 'border-yellow-200 dark:border-yellow-900/30' :
                        'border-zinc-200 dark:border-zinc-800'
                }`}>
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-primary" />
                            <CardTitle className="text-sm font-bold uppercase tracking-wider">Detector IA</CardTitle>
                        </div>
                        <Badge variant="outline" className={`${getRiskColor(aiRisk)} capitalize`}>
                            {getRiskLabel(aiRisk)}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-3 mb-3">
                        <div className={`w-3 h-3 rounded-full ${aiRisk === 'low' ? 'bg-green-500' : 'bg-zinc-200 dark:bg-zinc-700'}`} />
                        <div className={`w-3 h-3 rounded-full ${aiRisk === 'medium' ? 'bg-yellow-500' : 'bg-zinc-200 dark:bg-zinc-700'}`} />
                        <div className={`w-3 h-3 rounded-full ${aiRisk === 'high' ? 'bg-red-500' : 'bg-zinc-200 dark:bg-zinc-700'}`} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {aiRisk === 'high'
                            ? "Tu texto parece generado por IA. Usa 'Humanizar' para variarlo."
                            : aiRisk === 'medium'
                                ? "Algunas frases parecen robóticas. Intenta usar más anécdotas."
                                : "¡Genial! Tu texto tiene un tono natural y humano."}
                    </p>
                </CardContent>
            </Card>

            {/* Keywords Card */}
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm flex-grow">
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-primary" />
                        <CardTitle className="text-sm font-bold uppercase tracking-wider">Meta Keywords</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    {keywords.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {keywords.map((kw, i) => (
                                <Badge key={i} variant="secondary" className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200">
                                    <Hash className="w-3 h-3 mr-1 opacity-50" />
                                    {kw}
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <Search className="w-8 h-8 mx-auto mb-2 opacity-20" />
                            <p className="text-xs">Escribe más para detectar keywords...</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border bg-background text-center hover:bg-muted/50 cursor-pointer transition-colors">
                    <div className="font-medium text-xs mb-1">Palabras</div>
                    <div className="text-xl font-bold">{wordCount}</div>
                </div>
                <div className="p-3 rounded-lg border bg-background text-center hover:bg-muted/50 cursor-pointer transition-colors">
                    <div className="font-medium text-xs mb-1">Lectura</div>
                    <div className="text-xl font-bold">~{Math.ceil(wordCount / 200)} min</div>
                </div>
            </div>
        </div>
    );
}
