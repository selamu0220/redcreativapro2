"use client";

import { useEscritor } from "../../context/EscritorContext";
import { useSimpleTranslations } from "@/app/lib/simple-translations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Eye, Hash } from "lucide-react";

export function SeoPanel() {
    const { seoAnalysis } = useEscritor();
    const { t } = useSimpleTranslations();

    if (!seoAnalysis) {
        return (
            <div className="flex items-center justify-center h-full text-muted-foreground p-4 text-center">
                <p>{t('writeToSeeAnalysis')}</p>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto p-2 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b">
                <div className="flex items-center gap-2 font-semibold">
                    <BarChart3 className="h-5 w-5 text-purple-500" />
                    {t('seoAnalysis')}
                </div>
                <Badge variant="outline">
                    {seoAnalysis.seoScore}/100
                </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>{t('wordCount')}:</span>
                        <span className="font-medium">{seoAnalysis.wordCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span>{t('charactersCount')}:</span>
                        <span className="font-medium">{seoAnalysis.characterCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span>{t('paragraphs')}:</span>
                        <span className="font-medium">{seoAnalysis.paragraphCount}</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>{t('readability')}:</span>
                        <span className="font-medium">{seoAnalysis.readabilityScore}/100</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span>{t('readingTime')}:</span>
                        <span className="font-medium">{seoAnalysis.readingTime} min</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span>{t('keywords')}:</span>
                        <span className="font-medium">{seoAnalysis.keywords.length}</span>
                    </div>
                </div>
            </div>

            {seoAnalysis.metaKeywords.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                        <Hash className="h-3 w-3" />
                        Meta Keywords
                    </h4>
                    <div className="flex flex-wrap gap-1">
                        {seoAnalysis.metaKeywords.map((keyword, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                                {keyword}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            {seoAnalysis.suggestions.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                        <Eye className="h-3 w-3" />
                        {t('suggestions')}
                    </h4>
                    <div className="space-y-1">
                        {seoAnalysis.suggestions.slice(0, 3).map((suggestion, index) => (
                            <p key={index} className="text-xs text-muted-foreground">
                                • {suggestion}
                            </p>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
