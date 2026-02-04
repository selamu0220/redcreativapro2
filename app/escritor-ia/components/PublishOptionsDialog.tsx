'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Globe, Image as ImageIcon, Tag, Loader2, FileText } from "lucide-react";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/app/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/app/components/ui/popover";
import { useSimpleTranslations } from '@/app/lib/simple-translations';

interface PublishOptionsDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onPublish: (metadata: PublishMetadata) => void;
    isPublishing: boolean;
    docTitle: string;
}

export interface PublishMetadata {
    category: string;
    tags: string[];
    image?: string;
    excerpt?: string;
    slug?: string;
    status: 'published' | 'draft';
    publishedAt?: Date; // Added field
}

const CATEGORIES_KEYS = [
    { key: "cat_ai", value: "Inteligencia Artificial" },
    { key: "cat_marketing", value: "Marketing Digital" },
    { key: "cat_seo", value: "SEO" },
    { key: "cat_copywriting", value: "Copywriting" },
    { key: "cat_productivity", value: "Productividad" },
    { key: "cat_tech", value: "Tecnología" },
    { key: "cat_business", value: "Negocios" },
    { key: "cat_tutorials", value: "Tutoriales" },
    { key: "cat_general", value: "General" }
] as const;

export function PublishOptionsDialog({ isOpen, onOpenChange, onPublish, isPublishing, docTitle }: PublishOptionsDialogProps) {
    const { t, currentLang } = useSimpleTranslations();
    const dateLocale = currentLang === 'es' ? es : enUS;

    const [category, setCategory] = useState<string>("Inteligencia Artificial");
    const [tagsInput, setTagsInput] = useState<string>("IA, Tecnología");
    const [image, setImage] = useState<string>("");
    const [excerpt, setExcerpt] = useState<string>("");
    const [slug, setSlug] = useState<string>("");
    const [date, setDate] = useState<Date | undefined>(new Date()); // Date state

    // Auto-generate slug from title if empty
    useEffect(() => {
        if (isOpen && !slug && docTitle) {
            setSlug(docTitle.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')
            );
        }
    }, [isOpen, docTitle, slug]);

    const handlePublishClick = (status: 'published' | 'draft') => {
        const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
        onPublish({
            category,
            tags,
            image: image || undefined,
            excerpt: excerpt || undefined,
            slug: slug || undefined,
            status,
            publishedAt: date // Pass date
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden gap-0">
                <div className="grid md:grid-cols-2 h-full max-h-[90vh] overflow-y-auto md:overflow-hidden">

                    {/* LEFT COLUMN: FORM */}
                    <div className="p-6 flex flex-col gap-6 overflow-y-auto">
                        <DialogHeader className="px-0">
                            <DialogTitle>{t('publish_title')}</DialogTitle>
                            <DialogDescription>
                                {t('publish_desc')}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="slug">{t('publish_slug_label')}</Label>
                                <Input
                                    id="slug"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    placeholder={t('publish_slug_placeholder')}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>{t('publish_date_label')}</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date ? format(date, "PPP", { locale: dateLocale }) : <span>{t('publish_date_placeholder')}</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={setDate}
                                            initialFocus
                                            locale={dateLocale}
                                        />
                                    </PopoverContent>
                                </Popover>
                                <p className="text-[10px] text-muted-foreground">{t('publish_date_future_hint')}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="category">{t('publish_category_label')}</Label>
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('publish_category_placeholder')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CATEGORIES_KEYS.map(cat => (
                                                <SelectItem key={cat.key} value={cat.value}>{t(cat.key)}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="tags">{t('publish_tags_label')}</Label>
                                    <Input
                                        id="tags"
                                        value={tagsInput}
                                        onChange={(e) => setTagsInput(e.target.value)}
                                        placeholder={t('publish_tags_placeholder')}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="image">{t('publish_image_label')}</Label>
                                <Input
                                    id="image"
                                    value={image}
                                    onChange={(e) => setImage(e.target.value)}
                                    placeholder={t('publish_image_placeholder')}
                                />
                                <p className="text-[10px] text-muted-foreground">{t('publish_image_hint')}</p>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="excerpt">{t('publish_excerpt_label')}</Label>
                                <Textarea
                                    id="excerpt"
                                    value={excerpt}
                                    onChange={(e) => setExcerpt(e.target.value)}
                                    placeholder={t('publish_excerpt_placeholder')}
                                    className="resize-none"
                                    rows={4}
                                />
                            </div>
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0 mt-auto pt-4 md:pt-0">
                            <Button variant="outline" onClick={() => handlePublishClick('draft')} disabled={isPublishing}>
                                {isPublishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                                {t('publish_save_draft')}
                            </Button>
                            <Button onClick={() => handlePublishClick('published')} disabled={isPublishing} className="bg-gradient-to-r from-red-600 to-orange-600 text-white">
                                {isPublishing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {t('publish_publishing')}
                                    </>
                                ) : (
                                    <>
                                        <Globe className="mr-2 h-4 w-4" />
                                        {t('publish_now')}
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </div>

                    {/* RIGHT COLUMN: PREVIEW */}
                    <div className="bg-muted/30 p-6 border-t md:border-t-0 md:border-l border-border/50 flex flex-col">
                        <div className="mb-4 flex items-center justify-between">
                            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <ImageIcon className="w-4 h-4" /> {t('publish_preview')}
                            </h4>
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/60">{t('publish_card_preview')}</span>
                        </div>

                        <div className="flex-1 flex items-center justify-center">
                            {/* BLOG CARD PREVIEW */}
                            <div className="w-full max-w-[350px] bg-background rounded-2xl shadow-xl overflow-hidden border border-border/40 group">
                                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                                    <img
                                        src={image || "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1000"}
                                        alt="Preview"
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-background/80 backdrop-blur-md text-foreground shadow-sm border border-border/50">
                                            {category}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5 flex flex-col gap-3">
                                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                        <span className="text-primary">Escritor IA</span>
                                        <span className="w-1 h-1 rounded-full bg-border" />
                                        <span>
                                            {date
                                                ? format(date, "d MMM", { locale: dateLocale })
                                                : new Date().toLocaleDateString(currentLang === 'es' ? 'es-ES' : 'en-US', { day: 'numeric', month: 'short' })
                                            }
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                        {docTitle || t('publish_card_title_placeholder')}
                                    </h3>

                                    <p className="text-muted-foreground text-sm line-clamp-2">
                                        {excerpt || t('publish_card_excerpt_placeholder')}
                                    </p>

                                    <div className="pt-4 mt-2 border-t border-border/40 flex items-center justify-between">
                                        <span className="text-xs font-medium text-muted-foreground">
                                            5 min
                                        </span>
                                        <span className="text-sm font-semibold text-primary flex items-center gap-1">
                                            {t('publish_read_more')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                            <p className="text-xs text-yellow-600 dark:text-yellow-400">
                                <strong>{t('publish_note')}</strong> {t('publish_note_desc')}
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

