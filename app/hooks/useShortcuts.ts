"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useWriter } from "../escritor-ia/context/WriterContext";

export type ShortcutAction = {
    key: string;
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    meta?: boolean;
    action: () => void;
    description: string;
    id: string;
};

export const SHORTCUTS_LIST: Record<string, { label: string, keys: string }> = {
    SAVE: { label: "Guardar", keys: "Ctrl + S" },
    IMPORT: { label: "Importar", keys: "Alt + I" },
    EXPORT: { label: "Exportar PDF", keys: "Alt + E" },
    COPY: { label: "Copiar Todo", keys: "Alt + C" },
    PUBLISH: { label: "Publicar", keys: "Alt + P" },
    ZEN: { label: "Modo Zen", keys: "F11 / Alt + Z" },
};

export function useShortcuts(actions: {
    onSave?: () => void;
    onImport?: () => void;
    onExport?: () => void;
    onCopy?: () => void;
    onPublish?: () => void;
    onZenToggle?: () => void;
}) {
    const { zenMode, setZenMode } = useWriter();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const isCtrl = e.metaKey || e.ctrlKey;
            const isAlt = e.altKey;

            if (isCtrl && (e.key === 's' || e.key === 'S')) {
                e.preventDefault();
                actions.onSave?.();
            }

            if (isAlt && (e.key === 'i' || e.key === 'I')) {
                e.preventDefault();
                actions.onImport?.();
            }

            if (isAlt && (e.key === 'e' || e.key === 'E')) {
                e.preventDefault();
                actions.onExport?.();
            }

            if (isAlt && (e.key === 'c' || e.key === 'C')) {
                e.preventDefault();
                actions.onCopy?.();
            }

            if (isAlt && (e.key === 'p' || e.key === 'P')) {
                e.preventDefault();
                actions.onPublish?.();
            }

            // Zen Mode Toggle
            if ((isAlt && (e.key === 'z' || e.key === 'Z')) || e.key === 'F11') {
                e.preventDefault();
                if (actions.onZenToggle) {
                    actions.onZenToggle();
                } else {
                    // Default fallback if not provided but context is available?
                    // Usually we pass it in, but here we can just do nothing if not provided.
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [actions]);
}
