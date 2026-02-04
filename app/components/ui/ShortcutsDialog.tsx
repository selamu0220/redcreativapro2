"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Keyboard } from "lucide-react";
import { SHORTCUTS_LIST } from "@/app/hooks/useShortcuts";

export function ShortcutsDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title="Atajos de Teclado" className="rounded-full w-8 h-8">
                    <Keyboard className="w-4 h-4 text-muted-foreground" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Atajos de Teclado</DialogTitle>
                    <DialogDescription>
                        Optimiza tu flujo de trabajo con estos atajos.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {Object.entries(SHORTCUTS_LIST).map(([key, item]) => (
                        <div key={key} className="flex items-center justify-between pb-2 border-b last:border-0">
                            <span className="text-sm font-medium">{item.label}</span>
                            <kbd className="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                                <span className="text-xs">{item.keys}</span>
                            </kbd>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
