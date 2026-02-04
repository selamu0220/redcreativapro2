import { Editor } from '@tiptap/react';
import { useEffect, useState, useRef } from 'react';

interface UseGhostTextProps {
    editor: Editor | null;
    enabled?: boolean;
}

export const useGhostText = ({ editor, enabled = true }: UseGhostTextProps) => {
    const [isTyping, setIsTyping] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Mock prediction function - in real app, this calls an API
    const fetchPrediction = async (text: string): Promise<string | null> => {
        // Only predict for lines longer than 10 chars to avoid noise
        if (text.length < 10) return null;

        // SIMULATION: Simple predictive logic
        const lastWords = text.split(' ').slice(-3).join(' ');

        await new Promise(resolve => setTimeout(resolve, 600)); // Simulate API latency

        if (Math.random() > 0.7) return null; // No suggestion sometimes

        const predictions = [
            " is a game changer for content creators.",
            ", allowing for seamless integration.",
            " which improves productivity significantly.",
            " and that's why we built this tool.",
            ". This demonstrates the power of AI."
        ];

        return predictions[Math.floor(Math.random() * predictions.length)];
    };

    useEffect(() => {
        if (!editor || !enabled) return;

        const handleUpdate = () => {
            // Clear existing ghost text when typing
            if (editor.storage.ghostText.text) {
                editor.commands.clearGhostText();
            }

            // Reset debounce timer
            if (timeoutRef.current) clearTimeout(timeoutRef.current);

            timeoutRef.current = setTimeout(async () => {
                const selection = editor.state.selection;
                // Only predict if cursor is at end of line (simplified)
                const { $head } = selection;
                const node = $head.parent;
                const offset = $head.parentOffset;

                // Check if we are at the end of the text node (rough check)
                if (offset === node.textContent.length) {
                    const currentLineText = node.textContent;
                    const prediction = await fetchPrediction(currentLineText);

                    if (prediction && editor.view.hasFocus()) {
                        editor.commands.setGhostText(prediction);
                    }
                }
            }, 1000); // Wait 1s after typing stops
        };

        editor.on('update', handleUpdate);
        editor.on('selectionUpdate', () => {
            // Clear on cursor move
            if (editor.storage.ghostText.text) {
                editor.commands.clearGhostText();
            }
        });

        return () => {
            editor.off('update', handleUpdate);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [editor, enabled]);
};
