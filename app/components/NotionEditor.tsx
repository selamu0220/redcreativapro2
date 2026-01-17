"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import { common, createLowlight } from 'lowlight';

import { useEffect, useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import {
    Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Quote,
    Undo2, Redo2, Code, Table as TableIcon, CheckSquare, Image as ImageIcon,
    Link as LinkIcon, Highlighter, Heading1, Heading2, Heading3,
    AlignLeft, AlignCenter, AlignRight, Trash2, Plus, GripVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// Create lowlight instance with common languages
const lowlight = createLowlight(common);

interface NotionEditorProps {
    content: string;
    onChange: (content: string) => void;
    editable?: boolean;
    placeholder?: string;
    className?: string;
}

export default function NotionEditor({
    content,
    onChange,
    editable = true,
    placeholder = 'Escribe aquí o arrastra un documento...',
    className
}: NotionEditorProps) {
    const [mounted, setMounted] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                codeBlock: false, // We use CodeBlockLowlight instead
            }),
            Underline,
            Placeholder.configure({
                placeholder,
            }),
            CodeBlockLowlight.configure({
                lowlight,
                defaultLanguage: 'javascript',
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableCell,
            TableHeader,
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-lg max-w-full h-auto mx-auto',
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline hover:text-primary/80',
                },
            }),
            Highlight.configure({
                multicolor: true,
            }),
            Typography,
        ],
        content,
        editable,
        editorProps: {
            attributes: {
                class: cn(
                    'prose prose-sm sm:prose lg:prose-lg dark:prose-invert',
                    'max-w-none focus:outline-none min-h-[400px] p-6',
                    'prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl',
                    'prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm',
                    'prose-pre:bg-slate-900 prose-pre:text-slate-50 prose-pre:rounded-lg prose-pre:p-4',
                    'prose-table:border-collapse prose-td:border prose-td:p-2 prose-th:border prose-th:p-2 prose-th:bg-muted',
                    'prose-li:marker:text-primary',
                    '[&_ul[data-type=taskList]]:list-none [&_ul[data-type=taskList]]:pl-0',
                    '[&_ul[data-type=taskList]_li]:flex [&_ul[data-type=taskList]_li]:gap-2 [&_ul[data-type=taskList]_li]:items-start',
                    '[&_ul[data-type=taskList]_li_input]:mt-1 [&_ul[data-type=taskList]_li_input]:accent-primary',
                )
            },
            handleDrop: (view, event, slice, moved) => {
                if (!moved && event.dataTransfer?.files?.length) {
                    const file = event.dataTransfer.files[0];
                    if (file.type.startsWith('image/')) {
                        // Handle image drop
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const src = e.target?.result as string;
                            editor?.chain().focus().setImage({ src }).run();
                        };
                        reader.readAsDataURL(file);
                        return true;
                    }
                }
                return false;
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    // Update content if it changes externally
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            if (content === '' && editor.isEmpty) return;
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    const addTable = useCallback(() => {
        editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    }, [editor]);

    const addCodeBlock = useCallback(() => {
        editor?.chain().focus().toggleCodeBlock().run();
    }, [editor]);

    const addTaskList = useCallback(() => {
        editor?.chain().focus().toggleTaskList().run();
    }, [editor]);

    const addImage = useCallback(() => {
        const url = window.prompt('URL de la imagen:');
        if (url) {
            editor?.chain().focus().setImage({ src: url }).run();
        }
    }, [editor]);

    const addLink = useCallback(() => {
        const url = window.prompt('URL del enlace:');
        if (url) {
            editor?.chain().focus().setLink({ href: url }).run();
        }
    }, [editor]);

    if (!mounted || !editor) {
        return (
            <div className="animate-pulse bg-muted rounded-lg h-[400px]" />
        );
    }

    return (
        <div className={cn("flex flex-col w-full border rounded-lg bg-background", className)}>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/30">
                <TooltipProvider delayDuration={300}>
                    {/* Text Format */}
                    <div className="flex items-center gap-0.5">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn("h-8 w-8", editor.isActive('bold') && "bg-muted")}
                                    onClick={() => editor.chain().focus().toggleBold().run()}
                                >
                                    <Bold className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Negrita (Ctrl+B)</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn("h-8 w-8", editor.isActive('italic') && "bg-muted")}
                                    onClick={() => editor.chain().focus().toggleItalic().run()}
                                >
                                    <Italic className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Cursiva (Ctrl+I)</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn("h-8 w-8", editor.isActive('underline') && "bg-muted")}
                                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                                >
                                    <UnderlineIcon className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Subrayado (Ctrl+U)</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn("h-8 w-8", editor.isActive('highlight') && "bg-muted")}
                                    onClick={() => editor.chain().focus().toggleHighlight().run()}
                                >
                                    <Highlighter className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Resaltar</TooltipContent>
                        </Tooltip>
                    </div>

                    <Separator orientation="vertical" className="h-6 mx-1" />

                    {/* Headings */}
                    <div className="flex items-center gap-0.5">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn("h-8 w-8", editor.isActive('heading', { level: 1 }) && "bg-muted")}
                                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                                >
                                    <Heading1 className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Título 1</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn("h-8 w-8", editor.isActive('heading', { level: 2 }) && "bg-muted")}
                                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                                >
                                    <Heading2 className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Título 2</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn("h-8 w-8", editor.isActive('heading', { level: 3 }) && "bg-muted")}
                                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                                >
                                    <Heading3 className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Título 3</TooltipContent>
                        </Tooltip>
                    </div>

                    <Separator orientation="vertical" className="h-6 mx-1" />

                    {/* Lists */}
                    <div className="flex items-center gap-0.5">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn("h-8 w-8", editor.isActive('bulletList') && "bg-muted")}
                                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                                >
                                    <List className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Lista</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn("h-8 w-8", editor.isActive('orderedList') && "bg-muted")}
                                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                                >
                                    <ListOrdered className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Lista numerada</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn("h-8 w-8", editor.isActive('taskList') && "bg-muted")}
                                    onClick={addTaskList}
                                >
                                    <CheckSquare className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Lista de tareas</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn("h-8 w-8", editor.isActive('blockquote') && "bg-muted")}
                                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                                >
                                    <Quote className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Cita</TooltipContent>
                        </Tooltip>
                    </div>

                    <Separator orientation="vertical" className="h-6 mx-1" />

                    {/* Blocks */}
                    <div className="flex items-center gap-0.5">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn("h-8 w-8", editor.isActive('codeBlock') && "bg-muted")}
                                    onClick={addCodeBlock}
                                >
                                    <Code className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Bloque de código</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={addTable}
                                >
                                    <TableIcon className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Insertar tabla</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={addImage}
                                >
                                    <ImageIcon className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Insertar imagen</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn("h-8 w-8", editor.isActive('link') && "bg-muted")}
                                    onClick={addLink}
                                >
                                    <LinkIcon className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Insertar enlace</TooltipContent>
                        </Tooltip>
                    </div>

                    <Separator orientation="vertical" className="h-6 mx-1" />

                    {/* Undo/Redo */}
                    <div className="flex items-center gap-0.5 ml-auto">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => editor.chain().focus().undo().run()}
                                    disabled={!editor.can().undo()}
                                >
                                    <Undo2 className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Deshacer (Ctrl+Z)</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => editor.chain().focus().redo().run()}
                                    disabled={!editor.can().redo()}
                                >
                                    <Redo2 className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Rehacer (Ctrl+Y)</TooltipContent>
                        </Tooltip>
                    </div>
                </TooltipProvider>
            </div>

            {/* Editor Area */}
            <EditorContent editor={editor} className="flex-1 overflow-y-auto" />

            {/* Footer stats */}
            <div className="flex items-center justify-between px-4 py-2 border-t text-xs text-muted-foreground bg-muted/20">
                <span>
                    {editor.storage.characterCount?.characters?.() || editor.getText().length} caracteres
                </span>
                <span>
                    {editor.storage.characterCount?.words?.() || editor.getText().split(/\s+/).filter(Boolean).length} palabras
                </span>
            </div>
        </div>
    );
}
