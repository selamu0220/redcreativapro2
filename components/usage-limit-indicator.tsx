"use client";

import { useSubscription } from "@/contexts/subscription-context";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";


export function UsageLimitIndicator({ className }: { className?: string }) {
    const { isPro, wordsUsed, planLimit, isLoading } = useSubscription();

    if (isLoading) return null;

    // Pro users don't see limits, maybe just "Unlimited" badge
    if (isPro) {
        return (
            <div className={cn("p-4 rounded-lg bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-200 dark:border-blue-900", className)}>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> redcreativa.pro v3.0
                    </span>

                    <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">ILIMITADO</span>
                </div>
                <p className="text-xs text-muted-foreground">Estás disfrutando de generación de contenido sin límites.</p>
            </div>
        );
    }

    // Free users see progress bar
    const percentage = Math.min(100, Math.round((wordsUsed / planLimit) * 100));
    const isNearLimit = percentage >= 80;
    const isLimitReached = wordsUsed >= planLimit;

    return (
        <div className={cn("p-4 rounded-lg bg-card border shadow-sm", className)}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Uso Mensual</span>
                <span className={cn("text-xs font-bold", isNearLimit ? "text-red-500" : "text-muted-foreground")}>
                    {wordsUsed} / {planLimit} palabras
                </span>
            </div>

            <Progress value={percentage} className={cn("h-2 mb-4", isNearLimit ? "bg-red-100 dark:bg-red-900/30 [&>div]:bg-red-500" : "")} />

            {isLimitReached ? (
                <div className="space-y-3">
                    <p className="text-xs text-red-600 dark:text-red-400 font-medium text-center">
                        Has alcanzado el límite de redcreativa.pro v1.0.
                    </p>

                    <Link href="/planes" className="block">
                        <Button size="sm" className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white border-0">
                            <Sparkles className="w-3 h-3 mr-2" /> Upgrade a v3.0 (1€)
                        </Button>

                    </Link>
                </div>
            ) : (
                <div className="text-center">
                    <Link href="/planes" className="block">
                        <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-primary">
                            Aumentar límite a Ilimitado
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    );
}
