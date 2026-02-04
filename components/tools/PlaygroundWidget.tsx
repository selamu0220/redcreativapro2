"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, RefreshCw, Wand2, AlertCircle, Lock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAIStream } from "@/app/escritor-ia/hooks/useAIStream";
import { useFreeAccess } from "@/app/hooks/useFreeAccess";
import Link from "next/link";
import { Card } from "@/components/ui/card";

export function PlaygroundWidget() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const { generate, isLoading } = useAIStream();
    const { trialsLeft, isBlocked, consumeToken } = useFreeAccess();

    const handleGenerate = async () => {
        if (!input.trim()) {
            toast.error("Por favor escribe un tema o prompt");
            return;
        }

        if (!consumeToken()) return;

        const prompt = `
    TASK: Escribe un texto breve y creativo sobre el siguiente tema.
    TOPIC: "${input}"
    TONE: Profesional pero accesible.
    LANGUAGE: Español.
    LENGTH: Aproximadamente 200 palabras.
    `;

        try {
            setOutput("");
            await generate(prompt, {
                onStream: (chunk) => setOutput((prev) => prev + chunk),
            });
            toast.success("Texto generado correctamente");
        } catch (e) {
            toast.error("Error al generar el texto");
            console.error(e);
        }
    };

    const copyToClipboard = () => {
        if (!output) return;
        navigator.clipboard.writeText(output);
        toast.success("Texto copiado al portapapeles");
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                {/* Input Section */}
                <Card className="p-6 bg-[#111] border-zinc-800 flex flex-col h-[500px]">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                            Tu Idea (Prompt)
                        </h3>
                        <div className="flex items-center gap-2 text-xs">
                            <span className={cn(
                                "px-2 py-1 rounded-full border",
                                trialsLeft > 0 ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"
                            )}>
                                {isBlocked ? "Límite Alcanzado" : `${trialsLeft} usos gratis hoy`}
                            </span>
                        </div>
                    </div>

                    <Textarea
                        disabled={isBlocked || isLoading}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ej: Escribe un artículo sobre los beneficios del café para programadores..."
                        className="flex-1 bg-zinc-900/50 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 resize-none focus:ring-purple-500/50"
                    />

                    <div className="mt-4">
                        {isBlocked ? (
                            <Button className="w-full h-12 bg-zinc-800 hover:bg-zinc-700 text-zinc-400" asChild>
                                <Link href="/api/auth/register">
                                    <Lock className="mr-2 h-4 w-4" /> Desbloquear Todo (Registro Gratis)
                                </Link>
                            </Button>
                        ) : (
                            <Button
                                onClick={handleGenerate}
                                disabled={isLoading || !input.trim()}
                                className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-lg shadow-purple-900/20"
                            >
                                {isLoading ? (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Escribiendo...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="mr-2 h-4 w-4" /> Generar Texto con IA
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </Card>

                {/* Output Section */}
                <Card className="p-6 bg-[#111] border-zinc-800 flex flex-col h-[500px] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <Button variant="ghost" size="icon" onClick={copyToClipboard} disabled={!output} className="hover:bg-zinc-800 text-zinc-400 hover:text-white">
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>

                    <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">
                        Resultado
                    </h3>

                    <div className="flex-1 bg-zinc-900/30 rounded-lg p-4 overflow-y-auto border border-zinc-800/50">
                        {output ? (
                            <div className="prose prose-invert max-w-none text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                {output}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-4 text-center p-8">
                                <div className="h-12 w-12 rounded-full bg-zinc-900 flex items-center justify-center">
                                    <Wand2 className="h-6 w-6 opacity-20" />
                                </div>
                                <p className="text-sm">El texto generado aparecerá aquí.</p>
                                {isBlocked && (
                                    <div className="p-3 rounded bg-purple-900/10 border border-purple-500/20 text-purple-400 text-xs max-w-xs">
                                        <AlertCircle className="h-3 w-3 inline mr-1" />
                                        Modo invitado limitado a 3 usos diarios.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Watermark */}
                    <div className="mt-4 pt-4 border-t border-zinc-800 text-center">
                        <p className="text-xs text-zinc-600">
                            Generado por <span className="font-bold text-zinc-500">RedCreativaPro AI</span>
                        </p>
                    </div>
                </Card>
            </div>

            <div className="flex justify-center mt-8">
                <p className="text-xs text-zinc-500 flex items-center gap-2">
                    <Lock className="h-3 w-3" /> Privado y Seguro. No guardamos tus textos en el modo invitado.
                </p>
            </div>
        </div>
    );
}
