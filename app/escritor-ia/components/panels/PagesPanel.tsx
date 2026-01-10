"use client";

import { useEscritor } from "../../context/EscritorContext";
import { useSimpleTranslations } from "@/app/lib/simple-translations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, X } from "lucide-react";

export function PagesPanel() {
    const { pages, currentPageId, setCurrentPageId, addPage, removePage, updatePageTitle } = useEscritor();
    const { t } = useSimpleTranslations();

    return (
        <div className="h-full overflow-y-auto p-2">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">{t('documentPages')}</h3>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={addPage}
                    className="h-8 px-3"
                >
                    <Plus className="h-3 w-3 mr-1" />
                    {t('newPage')}
                </Button>
            </div>

            <div className="flex flex-col gap-2">
                {pages.map((page) => (
                    <div
                        key={page.id}
                        className={`flex items-center gap-2 px-3 py-3 rounded-lg border cursor-pointer transition-all ${currentPageId === page.id
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background hover:bg-muted border-border'
                            }`}
                        onClick={() => setCurrentPageId(page.id)}
                    >
                        <BookOpen className="h-4 w-4 shrink-0" />
                        <input
                            type="text"
                            value={page.title}
                            onChange={(e) => updatePageTitle(page.id, e.target.value)}
                            className="bg-transparent border-none outline-none text-sm min-w-0 flex-1 truncate"
                            onClick={(e) => e.stopPropagation()}
                        />
                        {pages.length > 1 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removePage(page.id);
                                }}
                                className="text-inherit opacity-70 hover:opacity-100 p-1"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
