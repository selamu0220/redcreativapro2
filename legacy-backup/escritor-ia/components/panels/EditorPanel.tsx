"use client";

import { useEscritor } from "../../context/EscritorContext";
import { useSimpleTranslations } from "@/app/lib/simple-translations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, RotateCcw, Sparkles, CheckCircle2, AlertCircle, FileText } from "lucide-react";

export function EditorPanel() {
    const {
        text, setText, isLoading, error, success, improveText,
        settings, timeLeft, currentPage
    } = useEscritor();
    const { t } = useSimpleTranslations();

    // Calculate word count for display
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 min-h-0 flex flex-col gap-4">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <Badge variant={wordCount >= 5 ? "default" : "secondary"} className="px-3 py-1">
                            {wordCount} {t('words')}
                        </Badge>
                        {settings.autoMode && timeLeft > 0 && (
                            <Badge variant="outline" className="px-3 py-1 text-blue-600 border-blue-200">
                                <Clock className="h-3 w-3 mr-1" />
                                {timeLeft}s
                            </Badge>
                        )}
                    </div>
                </div>

                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={t('writeYourText')}
                    className="flex-1 w-full p-6 border-2 border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary resize-none bg-white dark:bg-gray-900 text-foreground text-base leading-relaxed transition-all font-serif shadow-inner"
                    style={{
                        fontFamily: 'Georgia, "Times New Roman", serif',
                        lineHeight: '1.8',
                        letterSpacing: '0.01em'
                    }}
                    disabled={isLoading}
                />

                {error && (
                    <Card className="border-destructive/50 bg-destructive/5 shrink-0">
                        <CardContent className="p-4 flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                            <p className="text-destructive font-medium">{error}</p>
                        </CardContent>
                    </Card>
                )}

                {success && (
                    <Card className="border-green-500/50 bg-green-50 dark:bg-green-950/20 shrink-0">
                        <CardContent className="p-4 flex items-center gap-3">
                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                            <p className="text-green-700 dark:text-green-300 font-medium">{success}</p>
                        </CardContent>
                    </Card>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                    <Button
                        size="lg"
                        variant="outline"
                        onClick={() => setText("")}
                        disabled={isLoading || !text.trim()}
                        className="flex-1"
                    >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        {t('clean')}
                    </Button>

                    <Button
                        size="lg"
                        onClick={() => improveText(false)}
                        disabled={isLoading || !text.trim() || wordCount < 5}
                        className="flex-[2] rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30"
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2"></div>
                                {t('improving')}
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4 mr-2" />
                                {t('improveWithAI')}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
