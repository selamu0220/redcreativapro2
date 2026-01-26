"use client";

import { useEscritor } from "../../context/EscritorContext";
import { useSimpleTranslations } from "@/app/lib/simple-translations";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from "@/components/ui/button";
import {
    Bold, Italic, Underline as UnderlineIcon,
    AlignLeft, AlignCenter, AlignRight,
    List, ListOrdered, Quote, Heading1, Heading2,
    Sparkles, Undo, Redo, Eraser
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { ModelSelector } from "./ModelSelector";
import { NexusSentinel } from "../NexusSentinel";

export function RichEditorPanel() {
    const {
        text, setText, setEditorInstance, improveText,
        isImproving, isLoading
    } = useEscritor();
    const { t } = useSimpleTranslations();

    // Auto-improvement state removed (Moved to NexusSentinel)

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Typography,
            Highlight.configure({
                multicolor: true,
            }),
            Placeholder.configure({
                placeholder: t('writeYourText'),
            }),
        ],
        content: text,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base dark:prose-invert focus:outline-none max-w-none min-h-[500px] p-6',
            },
        },
        onUpdate: ({ editor }) => {
            setText(editor.getHTML());
        },
    });

    // Sync editor instance with context
    useEffect(() => {
        if (editor) {
            setEditorInstance(editor);
        }
    }, [editor, setEditorInstance]);

    // Update content if text changes externally (e.g. from page switch)
    useEffect(() => {
        if (editor && text !== editor.getHTML()) {
            const currentContent = editor.getHTML();
            if (currentContent !== text) {
                editor.commands.setContent(text);
            }
        }
    }, [text, editor]);

    // Nexus Sentinel (Auto-Improvement) logic is now self-contained in <NexusSentinel /> component 
    // to avoid logic pollution here.

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (autoTimeoutRef.current) {
                clearTimeout(autoTimeoutRef.current);
            }
        };
    }, []);

    // Full Text Improvement Handler
    const handleFullTextImprove = async () => {
        if (!editor || isImproving) return;

        const fullText = editor.getText();
        if (!fullText.trim()) {
            toast.error("Escribe algo antes de mejorar.");
            return;
        }

        const toastId = toast.loading("Mejorando texto completo...");

        try {
            const improved = await improveText(false, fullText);

            if (improved && typeof improved === 'string') {
                // Replace all content
                editor.commands.setContent(`<p>${improved}</p>`);
                toast.dismiss(toastId);
                toast.success("✨ Texto mejorado exitosamente");
            } else {
                toast.dismiss(toastId);
                toast.warning("El texto no necesita mejoras");
            }
        } catch (error) {
            toast.dismiss(toastId);
            toast.error("Error al mejorar el texto");
        }
    };

    // Selection Improvement Handler (existing functionality)
    const handleSelectionImprove = async () => {
        if (!editor || isImproving) return;

        const { from, to, empty } = editor.state.selection;
        if (empty) {
            toast.info("Selecciona texto para mejorar solo una parte");
            return;
        }

        const selectedText = editor.state.doc.textBetween(from, to, ' ');
        if (!selectedText.trim()) return;

        // Visual Feedback: Mark as pending (Yellow highlight for working)
        editor.chain().focus().setHighlight({ color: '#fef08a' }).run(); // Yellow-200

        // Call Async
        improveText(false, selectedText).then((improved) => {
            if (improved && typeof improved === 'string') {
                editor.chain().focus()
                    .unsetHighlight()
                    .insertContentAt({ from, to }, improved)
                    .setTextSelection({ from, to: from + improved.length }) // Select new text
                    .setHighlight({ color: '#bbf7d0' }) // Green success
                    .run();

                // Remove success highlight after 2s
                setTimeout(() => {
                    editor.chain().unsetHighlight().run();
                }, 2000);

                toast.success("Selección mejorada", { duration: 2000 });
            }
        }).catch(() => {
            editor.chain().unsetHighlight().run();
            toast.error("Error al mejorar selección");
        });
    };

    if (!editor) {
        return <div className="flex items-center justify-center h-full">Cargando editor...</div>;
    }

    return (
        <div className="flex flex-col h-full bg-background rounded-lg border shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center flex-wrap gap-1 p-2 border-b bg-muted/30">
                <ToggleGroup type="multiple" className="justify-start">
                    <ToggleGroupItem value="bold" aria-label="Toggle bold"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        data-state={editor.isActive('bold') ? 'on' : 'off'}>
                        <Bold className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="italic" aria-label="Toggle italic"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        data-state={editor.isActive('italic') ? 'on' : 'off'}>
                        <Italic className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="underline" aria-label="Toggle underline"
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        data-state={editor.isActive('underline') ? 'on' : 'off'}>
                        <UnderlineIcon className="h-4 w-4" />
                    </ToggleGroupItem>
                </ToggleGroup>

                <Separator orientation="vertical" className="h-6 mx-1" />

                <ToggleGroup type="single" className="justify-start">
                    <ToggleGroupItem value="heading1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        data-state={editor.isActive('heading', { level: 1 }) ? 'on' : 'off'}>
                        <Heading1 className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="heading2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        data-state={editor.isActive('heading', { level: 2 }) ? 'on' : 'off'}>
                        <Heading2 className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="bulletList" onClick={() => editor.chain().focus().toggleBulletList().run()}
                        data-state={editor.isActive('bulletList') ? 'on' : 'off'}>
                        <List className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="orderedList" onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        data-state={editor.isActive('orderedList') ? 'on' : 'off'}>
                        <ListOrdered className="h-4 w-4" />
                    </ToggleGroupItem>
                </ToggleGroup>

                <Separator orientation="vertical" className="h-6 mx-1" />

                <div className="ml-auto flex items-center gap-2">
                    {/* Model Selector */}
                    <div className="w-48">
                        <ModelSelector />
                    </div>

                    <Separator orientation="vertical" className="h-6" />

                    {/* Nexus Active Sentinel (Dedicated Component) */}
                    <div className="flex justify-end">
                        <NexusSentinel editor={editor} />
                    </div>

                    <Separator orientation="vertical" className="h-6" />

                    {/* Config removed - Sentinel handles defaults */}

                    <Separator orientation="vertical" className="h-6" />

                    {/* Full Text Improve Button */}
                    <Button
                        variant="default"
                        size="sm"
                        onClick={handleFullTextImprove}
                        disabled={isImproving}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                        title="Mejorar todo el texto con IA"
                    >
                        <Sparkles className={cn("h-4 w-4 mr-1", isImproving && "animate-pulse")} />
                        <span className="text-xs font-semibold">Mejorar con IA</span>
                    </Button>

                    {/* Selection Improve Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSelectionImprove}
                        disabled={isImproving || !editor.state.selection || editor.state.selection.empty}
                        className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        title="Mejorar solo selección"
                    >
                        <Sparkles className={cn("h-4 w-4", isImproving && "animate-pulse")} />
                    </Button>

                    <Separator orientation="vertical" className="h-6" />
                    <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
                        <Undo className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
                        <Redo className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-y-auto bg-white dark:bg-zinc-950 cursor-text scrollbar-hide" onClick={() => editor.chain().focus().run()}>
                <EditorContent editor={editor} className="h-full min-h-[500px]" />
            </div>


        </div>
    );
}
