'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
    Search,
    X,
    Sparkles,
    Copy,
    Check,
    ChevronRight,
    Filter,
    Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import {
    SEO_PROMPTS,
    SEO_PROMPT_CATEGORIES,
    SEOPrompt,
    SEOPromptCategory,
    searchPrompts,
    getPromptsByCategory
} from '@/app/data/seo-prompts-data';

interface PromptPickerDrawerProps {
    onSelectPrompt: (prompt: string) => void;
    trigger?: React.ReactNode;
    className?: string;
}

export function PromptPickerDrawer({
    onSelectPrompt,
    trigger,
    className
}: PromptPickerDrawerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<SEOPromptCategory | 'all'>('all');
    const [selectedPrompt, setSelectedPrompt] = useState<SEOPrompt | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const filteredPrompts = useMemo(() => {
        let prompts = SEO_PROMPTS;

        if (selectedCategory !== 'all') {
            prompts = getPromptsByCategory(selectedCategory);
        }

        if (searchQuery.trim()) {
            const searchResults = searchPrompts(searchQuery);
            prompts = prompts.filter(p => searchResults.includes(p));
        }

        return prompts;
    }, [selectedCategory, searchQuery]);

    const categoryOptions = Object.entries(SEO_PROMPT_CATEGORIES) as [SEOPromptCategory, { label: string; icon: string; color: string }][];

    const handleSelectPrompt = (prompt: SEOPrompt) => {
        setSelectedPrompt(prompt);
    };

    const handleInsertPrompt = () => {
        if (selectedPrompt) {
            onSelectPrompt(selectedPrompt.prompt);
            setIsOpen(false);
            setSelectedPrompt(null);
        }
    };

    const handleCopyPrompt = async (prompt: SEOPrompt) => {
        await navigator.clipboard.writeText(prompt.prompt);
        setCopiedId(prompt.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const getDifficultyColor = (difficulty: SEOPrompt['difficulty']) => {
        switch (difficulty) {
            case 'beginner': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300';
            case 'intermediate': return 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300';
            case 'advanced': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className={className}>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Prompts SEO
                    </Button>
                )}
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-2xl p-0 flex flex-col">
                <SheetHeader className="p-4 border-b shrink-0">
                    <SheetTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Biblioteca de Prompts SEO
                        <Badge variant="secondary" className="ml-2">
                            {SEO_PROMPTS.length}+ prompts
                        </Badge>
                    </SheetTitle>
                </SheetHeader>

                {/* Search & Filters */}
                <div className="p-4 border-b space-y-3 shrink-0">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar prompts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-9"
                        />
                        {searchQuery && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                                onClick={() => setSearchQuery('')}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        )}
                    </div>

                    {/* Category Pills */}
                    <div className="flex flex-wrap gap-1.5">
                        <Button
                            size="sm"
                            variant={selectedCategory === 'all' ? 'default' : 'outline'}
                            className="h-7 text-xs"
                            onClick={() => setSelectedCategory('all')}
                        >
                            <Filter className="h-3 w-3 mr-1" />
                            Todos
                        </Button>
                        {categoryOptions.map(([key, { label, icon }]) => (
                            <Button
                                key={key}
                                size="sm"
                                variant={selectedCategory === key ? 'default' : 'outline'}
                                className="h-7 text-xs"
                                onClick={() => setSelectedCategory(key)}
                            >
                                <span className="mr-1">{icon}</span>
                                {label}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Prompt List */}
                    <ScrollArea className={cn(
                        "flex-1 border-r",
                        selectedPrompt && "hidden sm:block sm:w-1/2"
                    )}>
                        <div className="p-2 space-y-1">
                            {filteredPrompts.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p>No se encontraron prompts</p>
                                    <p className="text-xs">Intenta con otros términos</p>
                                </div>
                            ) : (
                                filteredPrompts.map((prompt) => {
                                    const category = SEO_PROMPT_CATEGORIES[prompt.category];
                                    return (
                                        <button
                                            key={prompt.id}
                                            onClick={() => handleSelectPrompt(prompt)}
                                            className={cn(
                                                "w-full text-left p-3 rounded-lg border transition-all",
                                                "hover:bg-muted/50 hover:border-primary/50",
                                                selectedPrompt?.id === prompt.id && "border-primary bg-primary/5"
                                            )}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-sm">{category.icon}</span>
                                                        <span className="font-medium text-sm truncate">{prompt.name}</span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                                        {prompt.description}
                                                    </p>
                                                    <div className="flex items-center gap-1.5 mt-2">
                                                        <Badge variant="outline" className="text-[10px] h-4">
                                                            {category.label}
                                                        </Badge>
                                                        <Badge className={cn("text-[10px] h-4", getDifficultyColor(prompt.difficulty))}>
                                                            {prompt.difficulty}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </ScrollArea>

                    {/* Prompt Detail */}
                    {selectedPrompt && (
                        <div className={cn(
                            "flex-1 flex flex-col",
                            "sm:w-1/2"
                        )}>
                            <div className="p-4 border-b shrink-0">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-semibold">{selectedPrompt.name}</h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {selectedPrompt.description}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="sm:hidden"
                                        onClick={() => setSelectedPrompt(null)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Variables */}
                                {selectedPrompt.variables && selectedPrompt.variables.length > 0 && (
                                    <div className="mt-3">
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                                            <Tag className="h-3 w-3" />
                                            Variables a completar:
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {selectedPrompt.variables.map((v) => (
                                                <code key={v} className="text-xs px-1.5 py-0.5 bg-muted rounded">
                                                    {`{{${v}}}`}
                                                </code>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Prompt Content */}
                            <ScrollArea className="flex-1">
                                <div className="p-4">
                                    <pre className="text-sm whitespace-pre-wrap font-mono bg-muted p-3 rounded-lg">
                                        {selectedPrompt.prompt}
                                    </pre>
                                </div>
                            </ScrollArea>

                            {/* Actions */}
                            <div className="p-4 border-t flex gap-2 shrink-0">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => handleCopyPrompt(selectedPrompt)}
                                >
                                    {copiedId === selectedPrompt.id ? (
                                        <>
                                            <Check className="h-4 w-4 mr-2 text-emerald-500" />
                                            Copiado
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-4 w-4 mr-2" />
                                            Copiar
                                        </>
                                    )}
                                </Button>
                                <Button className="flex-1" onClick={handleInsertPrompt}>
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Insertar en Editor
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
