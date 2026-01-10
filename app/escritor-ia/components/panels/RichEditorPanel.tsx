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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ModelSelector } from "./ModelSelector";

export function RichEditorPanel() {
    const {
        text, setText, setEditorInstance, improveText,
        isImproving, isLoading
    } = useEscritor();
    const { t } = useSimpleTranslations();

    // Auto-improvement state
    const [autoModeEnabled, setAutoModeEnabled] = useState(false);
    const [showAutoConfig, setShowAutoConfig] = useState(false);
    const [autoConfig, setAutoConfig] = useState({
        delay: 3000, // 3 seconds
        minWords: 5,
        improvementLevel: 'balanced' as 'conservative' | 'balanced' | 'creative'
    });
    const autoTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

    // Auto-improvement logic - usando event listener en vez de useEffect con 'text'
    useEffect(() => {
        if (!autoModeEnabled || !editor || isImproving) {
            // Limpiar timeout si se desactiva
            if (autoTimeoutRef.current) {
                clearTimeout(autoTimeoutRef.current);
                autoTimeoutRef.current = null;
            }
            return;
        }

        const handleUpdate = () => {
            const textContent = editor.getText().trim();
            const wordCount = textContent.split(/\s+/).filter(w => w.length > 0).length;

            // Clear existing timeout
            if (autoTimeoutRef.current) {
                clearTimeout(autoTimeoutRef.current);
            }

            // Only set timeout if we have enough words
            if (wordCount >= autoConfig.minWords) {
                autoTimeoutRef.current = setTimeout(async () => {
                    if (isImproving) return; // Double-check

                    try {
                        const improved = await improveText(true, textContent);

                        if (improved && typeof improved === 'string') {
                            editor.commands.setContent(`<p>${improved}</p>`);
                            toast.success("Mejora automática aplicada", { duration: 2000 });
                        }
                    } catch (error) {
                        console.error('[Auto-improvement] Error:', error);
                    }
                }, autoConfig.delay);
            }
        };

        // Registrar event listener
        editor.on('update', handleUpdate);

        return () => {
            editor.off('update', handleUpdate);
            if (autoTimeoutRef.current) {
                clearTimeout(autoTimeoutRef.current);
            }
        };
    }, [autoModeEnabled, editor, isImproving, improveText, autoConfig]);

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

                    {/* Auto Mode Toggle */}
                    <div className="flex items-center gap-2 px-2 py-1 bg-muted/50 rounded-md">
                        <Switch
                            id="auto-mode"
                            checked={autoModeEnabled}
                            onCheckedChange={setAutoModeEnabled}
                            disabled={isImproving}
                            className="data-[state=checked]:bg-green-500"
                        />
                        <Label
                            htmlFor="auto-mode"
                            className="text-xs font-medium cursor-pointer select-none"
                        >
                            Auto {autoModeEnabled && "✓"}
                        </Label>
                    </div>

                    {/* Auto Config Button */}
                    <Popover open={showAutoConfig} onOpenChange={setShowAutoConfig}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                title="Configurar modo automático"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80" align="end">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-medium">Delay</Label>
                                        <span className="text-xs text-muted-foreground">{autoConfig.delay / 1000}s</span>
                                    </div>
                                    <Slider
                                        value={[autoConfig.delay]}
                                        onValueChange={(v) => setAutoConfig({ ...autoConfig, delay: v[0] })}
                                        min={1000}
                                        max={10000}
                                        step={500}
                                        className="w-full"
                                    />
                                    <p className="text-xs text-muted-foreground">Tiempo de espera después de dejar de escribir</p>
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-medium">Palabras mínimas</Label>
                                        <span className="text-xs text-muted-foreground">{autoConfig.minWords}</span>
                                    </div>
                                    <Slider
                                        value={[autoConfig.minWords]}
                                        onValueChange={(v) => setAutoConfig({ ...autoConfig, minWords: v[0] })}
                                        min={3}
                                        max={20}
                                        step={1}
                                        className="w-full"
                                    />
                                    <p className="text-xs text-muted-foreground">Cantidad mínima de palabras para activar</p>
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Nivel de mejora</Label>
                                    <Select
                                        value={autoConfig.improvementLevel}
                                        onValueChange={(v: any) => setAutoConfig({ ...autoConfig, improvementLevel: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="conservative">Conservador</SelectItem>
                                            <SelectItem value="balanced">Balanceado</SelectItem>
                                            <SelectItem value="creative">Creativo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        {autoConfig.improvementLevel === 'conservative' && 'Solo errores evidentes'}
                                        {autoConfig.improvementLevel === 'balanced' && 'Mejora fluidez y tono'}
                                        {autoConfig.improvementLevel === 'creative' && 'Estilo creativo y atractivo'}
                                    </p>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

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
