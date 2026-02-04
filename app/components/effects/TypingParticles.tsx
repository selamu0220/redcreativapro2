"use client";

import { useEffect, useState, useCallback } from "react";
import { Editor } from "@tiptap/react";
import { motion, AnimatePresence } from "framer-motion";

interface Particle {
    id: number;
    x: number;
    y: number;
    color: string;
}

interface TypingParticlesProps {
    editor: Editor | null;
    enabled?: boolean;
}

const COLORS = [
    "#f472b6", // pink-400
    "#c084fc", // purple-400
    "#818cf8", // indigo-400
    "#60a5fa", // blue-400
    "#34d399", // emerald-400
    "#fbbf24", // amber-400
];

export const TypingParticles = ({ editor, enabled = true }: TypingParticlesProps) => {
    const [particles, setParticles] = useState<Particle[]>([]);

    const spawnParticles = useCallback((x: number, y: number) => {
        if (!enabled) return;

        // Low usage mode: only 1-2 particles per keypress to keep it subtle
        const count = 1 + Math.floor(Math.random() * 2);
        const newParticles: Particle[] = [];

        for (let i = 0; i < count; i++) {
            newParticles.push({
                id: Date.now() + i + Math.random(),
                x,
                y,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
            });
        }

        setParticles((prev) => [...prev, ...newParticles]);

        // Cleanup logic (handled by animation onComplete normally, but safety check)
        setTimeout(() => {
            setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
        }, 1000);
    }, [enabled]);

    useEffect(() => {
        if (!editor) return;

        const handleUpdate = () => {
            // We only want to spawn on selection update usually implies cursor move/typing
            // But better trigger is 'transaction' checking for doc changes, but 'update' is simpler for "typing" distinction
            // Actually, we need coordinates.

            try {
                const { view } = editor;
                if (!view) return;

                const { state } = view;
                const { selection } = state;

                // @ts-ignore - view.coordsAtPos is standard but sometimes typescript complains with different versions
                const startCoords = view.coordsAtPos(selection.from);

                // Adjust for relative positioning if needed, but 'fixed' particles work best for overlays
                // We'll render fixed particles.

                // We need to verify if this update was a content change (typing) vs just cursor move.
                // Tiptap doesn't give easy "isTyping" flag in 'update'.
                // Simple heuristic: compare doc size or listen to keydown manually.
                // Let's hook into `on('update')` implies content changed usually in standard useEditor usage if we use `onUpdate`.
                // But here we are passing editor instance.

                // Let's just spawn.
                spawnParticles(startCoords.left, startCoords.top - 10);
            } catch (e) {
                // Ignore coord errors
            }
        };

        // We only want to listen to content changes
        if (editor) {
            editor.on('update', handleUpdate);
        }

        return () => {
            if (editor) {
                editor.off('update', handleUpdate);
            }
        };
    }, [editor, spawnParticles]);

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            <AnimatePresence>
                {particles.map((particle) => (
                    <motion.div
                        key={particle.id}
                        initial={{ opacity: 1, x: particle.x, y: particle.y, scale: 0.5 }}
                        animate={{
                            opacity: 0,
                            x: particle.x + (Math.random() - 0.5) * 60,
                            y: particle.y - 30 - Math.random() * 50,
                            scale: 0,
                            rotate: (Math.random() - 0.5) * 90,
                        }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        style={{
                            position: "absolute",
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            backgroundColor: particle.color,
                            boxShadow: `0 0 4px ${particle.color}`,
                        }}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};
