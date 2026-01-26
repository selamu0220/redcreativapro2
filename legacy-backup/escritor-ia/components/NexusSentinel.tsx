import { useState, useEffect, useCallback } from "react";
import { useNexusAutoImprove } from "@/app/nexus-ai/hooks/useNexusAutoImprove";
import { NexusStatusIndicator } from "./NexusStatusIndicator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Editor } from "@tiptap/react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

interface NexusSentinelProps {
    editor: Editor;
}

export function NexusSentinel({ editor }: NexusSentinelProps) {
    const [isEnabled, setIsEnabled] = useState(false);

    // Core Improvement Function passed to hook
    const handleImprove = useCallback(async (contentHTML: string) => {
        // toast.info("Sentinel: Optimizando..."); // Optional verbose

        try {
            const response = await fetch('/api/improve-text-stream', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: contentHTML, // Sending raw HTML
                    profileId: 'active-sentinel',
                    customInstructions: 'Mejora redacción manteniendo formato HTML exacto. Devuelve HTML.'
                })
            });

            if (!response.ok) throw new Error('API Error');

            // For now simple text response, but we expect HTML string
            const improvedHTML = await response.text();

            if (improvedHTML && improvedHTML.length > 5) {
                // Apply to editor strictly
                // Compare to avoid phantom updates? Hook handles basic compare.
                // We just return it.

                // Diff check: simple length or content check
                if (editor.getHTML() !== improvedHTML) {
                    editor.commands.setContent(improvedHTML);
                    toast.success("✨ Sentinel: Texto mejorado");
                    return improvedHTML;
                }
            }
        } catch (e) {
            console.error(e);
            toast.error("Sentinel Error: No se pudo conectar");
        }
    }, [editor]);

    const { status, notifyTyping } = useNexusAutoImprove({
        enabled: isEnabled,
        delay: 2500, // 2.5s pause
        minWords: 5,
        onImprove: handleImprove
    });

    // Wire up Editor Events
    useEffect(() => {
        if (!editor || !isEnabled) return;

        const onUpdate = () => {
            // Pass HTML to preserve formatting context
            notifyTyping(editor.getHTML());
        };

        editor.on('update', onUpdate);
        return () => {
            editor.off('update', onUpdate);
        };
    }, [editor, isEnabled, notifyTyping]);

    // Map internal hook status to UI status for Indicator
    const uiStatus = status === 'pending' ? 'scanning'
        : status === 'improving' ? 'improving'
            : 'idle';

    return (
        <div className="flex items-center gap-3 bg-muted/30 px-3 py-1.5 rounded-lg border border-border/50">
            {/* Status Indicator */}
            <NexusStatusIndicator
                status="healthy"
                isActive={status === 'improving'}
                autoImproveStatus={uiStatus}
                // Mock progress for 'scanning' if needed, or just pulse
                scanProgress={status === 'pending' ? 100 : 0}
            />

            <Separator orientation="vertical" className="h-4" />

            {/* Toggle Switch */}
            <div className="flex items-center gap-2">
                <Switch
                    id="sentinel-mode"
                    checked={isEnabled}
                    onCheckedChange={setIsEnabled}
                    className="data-[state=checked]:bg-indigo-500 scale-90"
                />
                <Label
                    htmlFor="sentinel-mode"
                    className="text-xs font-semibold text-muted-foreground cursor-pointer select-none"
                >
                    Sentinel
                </Label>
            </div>
        </div>
    );
}
