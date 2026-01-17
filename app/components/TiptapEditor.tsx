"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Bold, Italic, Underline as UnderlineIcon, List, Quote, Undo2, Redo2, Sparkles, Maximize2, Minimize2, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { useEffect, useState, useCallback } from 'react';

type AIAction = 'expand' | 'summarize' | 'rephrase' | 'improve';

interface TiptapEditorProps {
    content: string;
    onChange: (content: string) => void;
    editable?: boolean;
    onAIAction?: (action: AIAction, selectedText: string, onStreamUpdate?: (chunk: string) => void) => Promise<string | null>;
    isProcessing?: boolean;
}

interface FloatingMenuPosition {
    x: number;
    y: number;
    visible: boolean;
}

const TiptapEditor = ({ content, onChange, editable = true, onAIAction, isProcessing = false }: TiptapEditorProps) => {
    const [localProcessing, setLocalProcessing] = useState(false);
    const [floatingMenu, setFloatingMenu] = useState<FloatingMenuPosition>({ x: 0, y: 0, visible: false });
    const [selectedText, setSelectedText] = useState('');

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Placeholder.configure({
                placeholder: 'Empieza a escribir aquí...',
            }),
        ],
        content: content,
        editable: editable,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[500px] p-6'
            }
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        onSelectionUpdate: ({ editor }) => {
            const { from, to } = editor.state.selection;
            const text = editor.state.doc.textBetween(from, to, ' ');

            if (text.trim().length > 3 && onAIAction) {
                // Get selection coordinates
                const coords = editor.view.coordsAtPos(from);
                setFloatingMenu({
                    x: coords.left,
                    y: coords.top - 50, // Position above selection
                    visible: true
                });
                setSelectedText(text);
            } else {
                setFloatingMenu(prev => ({ ...prev, visible: false }));
                setSelectedText('');
            }
        },
        immediatelyRender: false,
    });

    // Update content if it changes externally
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            if (editor.getText() === '' && content === '') return;
            if (content === '' && editor.isEmpty) return;
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    // Hide menu when clicking outside editor
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.floating-ai-menu') && !target.closest('.ProseMirror')) {
                setFloatingMenu(prev => ({ ...prev, visible: false }));
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAIAction = useCallback(async (action: AIAction) => {
        if (!editor || !onAIAction || !selectedText) return;

        setLocalProcessing(true);
        setFloatingMenu(prev => ({ ...prev, visible: false }));

        try {
            // Store current selection range to delete it
            // Actually, if we want to stream, we should delete selection first, then stream insert.

            let accumulatedText = "";

            // Handler for streaming chunks
            const onStreamUpdate = (chunk: string) => {
                // For the FIRST chunk, we might want to ensure selection is gone? 
                // Actually the parent loop determines when chunks arrive.
                // We simply insert content at current position (which will advance).
                editor.chain().focus().insertContent(chunk).run();
            };

            // If we are about to stream, delete the selection NOW so we can replace it.
            // But we only know if it's streaming if the parent uses the callback.
            // Let's assume onAIAction will handle the "how".
            // Actually, passing `onStreamUpdate` implies we want to use it.

            // STRATEGY: 
            // 1. We delete the selection *before* calling the action? 
            //    Risk: If action fails, we lost text. 
            //    Better: Let parent return true/false or handle it?

            // Let's try this: We pass the callback. If the parent calls it, we know streaming started.
            // To avoid double text, on first chunk, we delete selection?
            let hasStartedStreaming = false;

            const streamHandler = (chunk: string) => {
                if (!hasStartedStreaming) {
                    // First chunk! Delete original selection now.
                    editor.chain().focus().deleteSelection().run();
                    hasStartedStreaming = true;
                }
                editor.chain().focus().insertContent(chunk).run();
            };

            const result = await onAIAction(action, selectedText, streamHandler);

            // If result returned (non-streaming legacy path), replace selection.
            if (result && !hasStartedStreaming) {
                editor.chain().focus().deleteSelection().insertContent(result).run();
            }
        } finally {
            setLocalProcessing(false);
        }
    }, [editor, onAIAction, selectedText]);

    if (!editor) {
        return null;
    }

    const showProcessing = isProcessing || localProcessing;

    return (
        <div className="flex flex-col w-full h-full relative">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2 p-2 border-b bg-muted/20">
                <TooltipProvider>
                    <ToggleGroup type="multiple" className="gap-1">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <ToggleGroupItem value="bold" aria-label="Bold" className="h-8 w-8 p-0"
                                    onClick={() => editor.chain().focus().toggleBold().run()}
                                    data-state={editor.isActive('bold') ? 'on' : 'off'}>
                                    <Bold className="w-4 h-4" />
                                </ToggleGroupItem>
                            </TooltipTrigger>
                            <TooltipContent>Negrita (Ctrl+B)</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <ToggleGroupItem value="italic" aria-label="Italic" className="h-8 w-8 p-0"
                                    onClick={() => editor.chain().focus().toggleItalic().run()}
                                    data-state={editor.isActive('italic') ? 'on' : 'off'}>
                                    <Italic className="w-4 h-4" />
                                </ToggleGroupItem>
                            </TooltipTrigger>
                            <TooltipContent>Cursiva (Ctrl+I)</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <ToggleGroupItem value="underline" aria-label="Underline" className="h-8 w-8 p-0"
                                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                                    data-state={editor.isActive('underline') ? 'on' : 'off'}>
                                    <UnderlineIcon className="w-4 h-4" />
                                </ToggleGroupItem>
                            </TooltipTrigger>
                            <TooltipContent>Subrayado (Ctrl+U)</TooltipContent>
                        </Tooltip>
                    </ToggleGroup>

                    <Separator orientation="vertical" className="h-6" />

                    <ToggleGroup type="multiple" className="gap-1">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <ToggleGroupItem value="bulletList" aria-label="Bullet List" className="h-8 w-8 p-0"
                                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                                    data-state={editor.isActive('bulletList') ? 'on' : 'off'}>
                                    <List className="w-4 h-4" />
                                </ToggleGroupItem>
                            </TooltipTrigger>
                            <TooltipContent>Lista</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <ToggleGroupItem value="blockquote" aria-label="Quote" className="h-8 w-8 p-0"
                                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                                    data-state={editor.isActive('blockquote') ? 'on' : 'off'}>
                                    <Quote className="w-4 h-4" />
                                </ToggleGroupItem>
                            </TooltipTrigger>
                            <TooltipContent>Cita</TooltipContent>
                        </Tooltip>
                    </ToggleGroup>

                    <Separator orientation="vertical" className="h-6" />

                    <div className="flex gap-1 ml-auto">
                        {showProcessing && (
                            <div className="flex items-center gap-2 px-2 text-sm text-primary animate-pulse">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="hidden sm:inline">IA...</span>
                            </div>
                        )}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8"
                                    onClick={() => editor.chain().focus().undo().run()}
                                    disabled={!editor.can().undo()}>
                                    <Undo2 className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Deshacer (Ctrl+Z)</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8"
                                    onClick={() => editor.chain().focus().redo().run()}
                                    disabled={!editor.can().redo()}>
                                    <Redo2 className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Rehacer (Ctrl+Y)</TooltipContent>
                        </Tooltip>
                    </div>
                </TooltipProvider>
            </div>

            {/* Floating AI Menu - appears on text selection */}
            {floatingMenu.visible && onAIAction && !showProcessing && (
                <div
                    className="floating-ai-menu fixed z-50 bg-background border shadow-xl rounded-lg p-1 flex items-center gap-1 animate-in fade-in-0 zoom-in-95 duration-100"
                    style={{
                        left: Math.max(10, floatingMenu.x),
                        top: Math.max(10, floatingMenu.y),
                    }}
                >
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs"
                        onClick={() => handleAIAction('expand')}>
                        <Maximize2 className="w-3 h-3 mr-1" /> Expandir
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs"
                        onClick={() => handleAIAction('summarize')}>
                        <Minimize2 className="w-3 h-3 mr-1" /> Resumir
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs"
                        onClick={() => handleAIAction('rephrase')}>
                        <RefreshCw className="w-3 h-3 mr-1" /> Reformular
                    </Button>
                    <Separator orientation="vertical" className="h-4 mx-1" />
                    <Button size="sm" className="h-7 px-2 text-xs"
                        onClick={() => handleAIAction('improve')}>
                        <Sparkles className="w-3 h-3 mr-1" /> Mejorar
                    </Button>
                </div>
            )}

            {/* Editor Area */}
            <EditorContent editor={editor} className="flex-1 overflow-y-auto" />
        </div>
    );
};

export default TiptapEditor;
