'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Sparkles, Copy, Check, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface MetaTagsGeneratorProps {
    content?: string;
    targetKeyword?: string;
    className?: string;
    onGenerate?: (metaTags: GeneratedMeta) => void;
}

export interface GeneratedMeta {
    title: string;
    description: string;
    ogTitle?: string;
    ogDescription?: string;
    twitterCard?: string;
}

export function MetaTagsGenerator({
    content = '',
    targetKeyword = '',
    className,
    onGenerate
}: MetaTagsGeneratorProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [metaTitle, setMetaTitle] = useState('');
    const [metaDescription, setMetaDescription] = useState('');
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const titleCharCount = metaTitle.length;
    const descCharCount = metaDescription.length;

    const getTitleStatus = () => {
        if (titleCharCount === 0) return 'neutral';
        if (titleCharCount < 30) return 'short';
        if (titleCharCount <= 60) return 'optimal';
        return 'long';
    };

    const getDescStatus = () => {
        if (descCharCount === 0) return 'neutral';
        if (descCharCount < 120) return 'short';
        if (descCharCount <= 160) return 'optimal';
        return 'long';
    };

    const statusColors = {
        neutral: 'text-muted-foreground',
        short: 'text-amber-600',
        optimal: 'text-emerald-600',
        long: 'text-red-600'
    };

    const handleGenerate = async () => {
        if (!content.trim()) return;

        setIsGenerating(true);
        try {
            const response = await fetch('/api/generate-meta', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, keyword: targetKeyword })
            });

            if (response.ok) {
                const data = await response.json();
                setMetaTitle(data.title || '');
                setMetaDescription(data.description || '');
                onGenerate?.({
                    title: data.title,
                    description: data.description,
                    ogTitle: data.title,
                    ogDescription: data.description
                });
            }
        } catch (error) {
            console.error('Meta generation failed:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = async (text: string, field: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const generateHtmlSnippet = () => {
        return `<title>${metaTitle}</title>
<meta name="description" content="${metaDescription}" />
<meta property="og:title" content="${metaTitle}" />
<meta property="og:description" content="${metaDescription}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${metaTitle}" />
<meta name="twitter:description" content="${metaDescription}" />`;
    };

    return (
        <Card className={cn('w-full', className)}>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span>Generador de Meta Tags</span>
                    </div>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleGenerate}
                        disabled={isGenerating || !content.trim()}
                        className="h-7 text-xs"
                    >
                        {isGenerating ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                            <RefreshCw className="h-3 w-3 mr-1" />
                        )}
                        Generar
                    </Button>
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Meta Title */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium">Meta Title</Label>
                        <div className="flex items-center gap-2">
                            <span className={cn('text-xs tabular-nums', statusColors[getTitleStatus()])}>
                                {titleCharCount}/60
                            </span>
                            {getTitleStatus() === 'optimal' && (
                                <Badge variant="outline" className="text-[10px] h-4 border-emerald-500 text-emerald-600">
                                    Óptimo
                                </Badge>
                            )}
                        </div>
                    </div>
                    <div className="relative">
                        <Input
                            value={metaTitle}
                            onChange={(e) => setMetaTitle(e.target.value)}
                            placeholder="Título SEO de tu página..."
                            className="pr-8 h-9"
                        />
                        <Button
                            size="icon"
                            variant="ghost"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                            onClick={() => copyToClipboard(metaTitle, 'title')}
                        >
                            {copiedField === 'title' ? (
                                <Check className="h-3 w-3 text-emerald-500" />
                            ) : (
                                <Copy className="h-3 w-3" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Meta Description */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium">Meta Description</Label>
                        <div className="flex items-center gap-2">
                            <span className={cn('text-xs tabular-nums', statusColors[getDescStatus()])}>
                                {descCharCount}/160
                            </span>
                            {getDescStatus() === 'optimal' && (
                                <Badge variant="outline" className="text-[10px] h-4 border-emerald-500 text-emerald-600">
                                    Óptimo
                                </Badge>
                            )}
                        </div>
                    </div>
                    <div className="relative">
                        <Textarea
                            value={metaDescription}
                            onChange={(e) => setMetaDescription(e.target.value)}
                            placeholder="Descripción atractiva para buscadores..."
                            className="pr-8 min-h-[80px] resize-none"
                        />
                        <Button
                            size="icon"
                            variant="ghost"
                            className="absolute right-1 top-2 h-6 w-6"
                            onClick={() => copyToClipboard(metaDescription, 'desc')}
                        >
                            {copiedField === 'desc' ? (
                                <Check className="h-3 w-3 text-emerald-500" />
                            ) : (
                                <Copy className="h-3 w-3" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* SERP Preview */}
                {(metaTitle || metaDescription) && (
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">Vista previa en Google</Label>
                        <div className="p-3 rounded-lg border bg-white dark:bg-zinc-900">
                            <div className="text-blue-600 dark:text-blue-400 text-sm font-medium truncate hover:underline cursor-pointer">
                                {metaTitle || 'Título de tu página'}
                            </div>
                            <div className="text-emerald-700 dark:text-emerald-500 text-xs mt-0.5">
                                https://tusitio.com/pagina
                            </div>
                            <div className="text-zinc-600 dark:text-zinc-400 text-xs mt-1 line-clamp-2">
                                {metaDescription || 'Tu meta descripción aparecerá aquí...'}
                            </div>
                        </div>
                    </div>
                )}

                {/* Copy HTML Snippet */}
                {metaTitle && metaDescription && (
                    <Button
                        variant="secondary"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => copyToClipboard(generateHtmlSnippet(), 'html')}
                    >
                        {copiedField === 'html' ? (
                            <>
                                <Check className="h-3 w-3 mr-1 text-emerald-500" />
                                ¡Copiado!
                            </>
                        ) : (
                            <>
                                <Copy className="h-3 w-3 mr-1" />
                                Copiar HTML completo
                            </>
                        )}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
