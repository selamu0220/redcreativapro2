"use client";

import { Monitor, Moon, Sun, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/app/components/ui/label";

export function ThemePicker() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="h-20 bg-muted/20 animate-pulse rounded-lg" />;
    }

    const themes = [
        { value: "light", label: "Claro", icon: Sun },
        { value: "dark", label: "Oscuro", icon: Moon },
        { value: "system", label: "Sistema", icon: Monitor },
    ];

    return (
        <div className="space-y-3">
            <Label className="text-xs font-semibold text-muted-foreground">Tema de la Interfaz</Label>
            <div className="grid grid-cols-3 gap-2">
                {themes.map((t) => {
                    const Icon = t.icon;
                    const isActive = theme === t.value;
                    return (
                        <button
                            key={t.value}
                            onClick={() => setTheme(t.value)}
                            className={cn(
                                "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200",
                                isActive
                                    ? "bg-primary/5 border-primary/50 text-primary ring-1 ring-primary/20"
                                    : "bg-background border-border/50 hover:bg-muted/50 hover:border-border text-muted-foreground"
                            )}
                        >
                            <div className={cn("p-2 rounded-full", isActive ? "bg-background" : "bg-muted/30")}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-medium">{t.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
