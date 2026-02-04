import { useEffect, useCallback, useRef } from 'react';
import { Editor } from '@tiptap/react';
import { db, LocalDocument } from '@/lib/db';

function useDebouncedCallback(callback: (...args: any[]) => void, delay: number) {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    return useCallback((...args: any[]) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            if (callbackRef.current) {
                callbackRef.current(...args);
            }
        }, delay);
    }, [delay]);
}

export function useEditorAutosave(editor: Editor | null, docId: string, title: string) {

    const lastVersionRef = useRef<number>(Date.now());

    const saveToLocal = useDebouncedCallback(async (currentEditor: Editor, currentTitle: string) => {
        if (!currentEditor) return;

        const contentJSON = currentEditor.getJSON();
        const contentString = JSON.stringify(contentJSON);

        try {
            // Check if exists
            const existing = await db.documents.get(docId);

            const docData: LocalDocument = {
                id: docId,
                title: currentTitle,
                content: contentString,
                tags: existing?.tags || [],
                folderId: existing?.folderId,
                createdAt: existing?.createdAt || new Date(),
                updatedAt: new Date(),
                isSynced: false,
            };

            await db.documents.put(docData);
            console.log(`[Phoenix] Auto-saved ${docId} to IndexedDB`);

            // --- VERSION SNAPSHOT LOGIC ---
            // Save a version every 5 minutes (300,000 ms) OR if it's the first save in a while
            const now = Date.now();
            if (now - lastVersionRef.current > 300000) {
                await db.versions.add({
                    docId: docId,
                    title: currentTitle,
                    content: contentString,
                    createdAt: new Date(),
                    autoSaved: true
                });
                lastVersionRef.current = now;
                console.log(`[Phoenix] Created version snapshot for ${docId}`);
            }

        } catch (error) {
            console.error("[Phoenix] Auto-save Failed:", error);
        }
    }, 2000); // 2 second debounce

    useEffect(() => {
        if (!editor) return;

        const handleUpdate = () => {
            saveToLocal(editor, title);
        };

        editor.on('update', handleUpdate);

        return () => {
            editor.off('update', handleUpdate);
        };
    }, [editor, title, saveToLocal]);

    return {
        forceSave: () => editor && saveToLocal(editor, title)
    };
}
