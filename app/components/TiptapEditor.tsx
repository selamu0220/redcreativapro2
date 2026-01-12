"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Bold, Italic, Underline as UnderlineIcon, List, Quote, Undo2, Redo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { useEffect } from 'react';

interface TiptapEditorProps {
    content: string;
    onChange: (content: string) => void;
    editable?: boolean;
}

const TiptapEditor = ({ content, onChange, editable = true }: TiptapEditorProps) => {
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
    });

    // Update content if it changes externally (e.g. loading a document)
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            // Only emit if significantly different to avoid cursor jumps loops
            // Ideally we compare text content or use a more robust sync, but for now:
            if (editor.getText() === '' && content === '') return;
            // This is tricky with Tiptap control vs implementation. 
            // We will simple setContent only if the editor is completely empty or strictly distinct
            // Better approach: Let parent handle 'initialContent' and only update if doc ID changes
            // For simplicity in this drop-in replacement:

            // Check if content is just wrapped in p tags vs empty
            if (content === '' && editor.isEmpty) return;

            // Force update
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className="flex flex-col w-full h-full">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2 p-2 border-b bg-muted/20">
                <TooltipProvider>
                    <ToggleGroup type="multiple" className="gap-1">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <ToggleGroupItem
                                    value="bold"
                                    aria-label="Bold"
                                    className="h-8 w-8 p-0"
                                    onClick={() => editor.chain().focus().toggleBold().run()}
                                    data-state={editor.isActive('bold') ? 'on' : 'off'}
                                >
                                    <Bold className="w-4 h-4" />
                                </ToggleGroupItem>
                            </TooltipTrigger>
                            <TooltipContent>Negrita</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <ToggleGroupItem
                                    value="italic"
                                    aria-label="Italic"
                                    className="h-8 w-8 p-0"
                                    onClick={() => editor.chain().focus().toggleItalic().run()}
                                    data-state={editor.isActive('italic') ? 'on' : 'off'}
                                >
                                    <Italic className="w-4 h-4" />
                                </ToggleGroupItem>
                            </TooltipTrigger>
                            <TooltipContent>Cursiva</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <ToggleGroupItem
                                    value="underline"
                                    aria-label="Underline"
                                    className="h-8 w-8 p-0"
                                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                                    data-state={editor.isActive('underline') ? 'on' : 'off'}
                                >
                                    <UnderlineIcon className="w-4 h-4" />
                                </ToggleGroupItem>
                            </TooltipTrigger>
                            <TooltipContent>Subrayado</TooltipContent>
                        </Tooltip>
                    </ToggleGroup>

                    <Separator orientation="vertical" className="h-6" />

                    <ToggleGroup type="multiple" className="gap-1">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <ToggleGroupItem
                                    value="bulletList"
                                    aria-label="Bullet List"
                                    className="h-8 w-8 p-0"
                                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                                    data-state={editor.isActive('bulletList') ? 'on' : 'off'}
                                >
                                    <List className="w-4 h-4" />
                                </ToggleGroupItem>
                            </TooltipTrigger>
                            <TooltipContent>Lista</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <ToggleGroupItem
                                    value="blockquote"
                                    aria-label="Quote"
                                    className="h-8 w-8 p-0"
                                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                                    data-state={editor.isActive('blockquote') ? 'on' : 'off'}
                                >
                                    <Quote className="w-4 h-4" />
                                </ToggleGroupItem>
                            </TooltipTrigger>
                            <TooltipContent>Cita</TooltipContent>
                        </Tooltip>
                    </ToggleGroup>

                    <Separator orientation="vertical" className="h-6" />

                    <div className="flex gap-1 ml-auto">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
                                    <Undo2 className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Deshacer</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
                                    <Redo2 className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Rehacer</TooltipContent>
                        </Tooltip>
                    </div>
                </TooltipProvider>
            </div>

            {/* Editor Area */}
            <EditorContent editor={editor} className="flex-1 overflow-y-auto" />
        </div>
    );
};

export default TiptapEditor;
