"use client";

import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, LocalVersion } from '@/lib/db';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { Clock, RotateCcw, Calendar, FileText } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from 'date-fns';
import { es, enUS } from 'date-fns/locale'; // Import enUS
import { useSimpleTranslations } from "@/app/lib/simple-translations"; // Added hook

interface VersionHistoryDialogProps {
    docId: string;
    isOpen: boolean;
    onClose: () => void;
    onRestore: (content: string) => void;
}

export function VersionHistoryDialog({ docId, isOpen, onClose, onRestore }: VersionHistoryDialogProps) {
    const { t, currentLang } = useSimpleTranslations(); // Hook usage
    // Live query to get versions for this document associated with docId
    const versions = useLiveQuery(
        () => db.versions.where('docId').equals(docId).reverse().sortBy('createdAt'),
        [docId]
    );

    const handleRestore = async (version: LocalVersion) => {
        if (confirm(t('history_restore_confirm'))) {
            onRestore(version.content);
            onClose();
            toast.success(t('history_restored_success'));
        }
    };

    // Determine date-fns locale based on currentLang
    const dateLocale = currentLang === 'en' ? enUS : es;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] h-[80vh] flex flex-col p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-white/20">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Clock className="w-5 h-5 text-primary" />
                        {t('history_title')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('history_description')}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden p-6 pt-2">
                    <ScrollArea className="h-full pr-4">
                        <div className="space-y-4 relative">
                            {/* Vertical Line */}
                            <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border/50 -z-10" />

                            {versions?.map((version, index) => (
                                <div key={version.id} className="relative group">
                                    <div className="flex items-start gap-4 p-3 rounded-lg border border-transparent hover:border-border/60 hover:bg-muted/30 transition-all cursor-pointer">
                                        {/* Dot */}
                                        <div className={`mt-1.5 w-3 h-3 rounded-full border-2 border-background z-10 ${index === 0 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-muted-foreground/30 group-hover:bg-primary/70'}`} />

                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-semibold text-foreground">
                                                    {index === 0 ? t('history_current_version') : `${t('history_version_prefix')} ${versions.length - index}`}
                                                </span>
                                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                                                    {version.autoSaved ? t('history_auto') : t('history_manual')}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Calendar className="w-3 h-3" />
                                                <span>
                                                    {formatDistanceToNow(version.createdAt, { addSuffix: true, locale: dateLocale })}
                                                </span>
                                            </div>
                                            <div className="pt-2">
                                                <div className="text-xs text-muted-foreground line-clamp-2 bg-muted/20 p-2 rounded border border-border/20 font-mono">
                                                    {version.content.substring(0, 100)}...
                                                </div>
                                            </div>
                                            <div className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button size="sm" variant="outline" className="w-full h-7 text-xs gap-2 hover:bg-primary hover:text-white" onClick={() => handleRestore(version)}>
                                                    <RotateCcw className="w-3 h-3" /> {t('history_restore_action')}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {(!versions || versions.length === 0) && (
                                <div className="text-center py-10 text-muted-foreground">
                                    <Clock className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                    <p>{t('history_empty')}</p>
                                    <p className="text-xs opacity-70">{t('history_empty_desc')}</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
}
