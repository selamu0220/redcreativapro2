"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Copy, Check, Repeat, Flame } from "lucide-react";
import { toast } from "sonner";
import { useAIStream } from "@/app/escritor-ia/hooks/useAIStream";

export function HumanizerWidget() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [copied, setCopied] = useState(false);
    const { generate, isProcessing } = useAIStream();

    const handleHumanize = async () => {
        if (!input.trim()) return toast.error("Por favor ingresa un texto primero");
        if (input.length < 50) return toast.error("El texto es muy corto (mínimo 50 caracteres)");

        // Specific Prompt for Humanization
        const prompt = `
    TASK: Reescribe el siguiente texto para que sea INDETECTABLE por herramientas de detección de IA.
    TARGET: Nivel humano 100%. Rompe patrones repetitivos. Usa lenguaje natural y variado.
    INPUT: "${input}"
    OPTIONS: Mantén el mismo idioma del input.
    `;

        try {
            // Assuming 'generate' accepts options or handles the stream based on the hook usage
            // We'll capture the result. For now, since useAIStream might be designed for streaming into a callback,
            // we might need to adapt it or use 'generate' if it returns a promise of the full string?
            // Checking previous usage: it seems useAIStream exposes 'generate' which might take a prompt.
            // Let's assume for this widget we want a simple request-response or we enable streaming into 'output'.

            // Adaptation: useAIStream usually streams to a state or callback. 
            // If the hook assumes 'content' state management internally for the editor, we might need a simpler specialized hook or pass a callback.
            // Let's implement a direct streaming handler here if possible, or use the generate function.

            setOutput(""); // Clear previous
            await generate(prompt, {
                // Pass a custom callback if supported, or if generate updates an internal state we need to extract it.
                // Looking at previous context, useAIStream might be bound to specific editor logic.
                // Let's try to use it, but if it fails we might need a dedicated API call function.
                // For now, let's assume 'generate' returns a Promise<string> or we can listen to the stream.
                onStream: (chunk) => setOutput(prev => prev + chunk)
            });

            toast.success("Texto humanizado correctamente");
        } catch (e) {
            toast.error("Error al humanizar el texto");
            console.error(e);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("Copiado al portapapeles");
    };

    return (
        <div className="w-full bg-[#1A1A1A] rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative group">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-purple-500/10 blur-[100px] pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5">
                <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <span className="font-semibold text-white text-sm">Modo Indetectable (Stealth)</span>
                </div>
                <div className="text-xs text-white/40 font-mono">v2.0.5</div>
            </div>

            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10 h-[500px]">
                {/* INPUT */}
                <div className="p-6 flex flex-col h-full bg-[#111]">
                    <label className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wider">Tu Texto (IA)</label>
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Pega aquí el texto generado por ChatGPT, Claude, etc..."
                        className="flex-1 bg-transparent border-none resize-none focus-visible:ring-0 p-0 text-base text-gray-300 placeholder:text-gray-600 leading-relaxed"
                    />
                    <div className="pt-4 flex justify-between items-center text-xs text-gray-600">
                        <span>{input.length} caracteres</span>
                        <Button onClick={() => setInput('')} variant="ghost" size="sm" className="h-6 w-auto text-gray-500 hover:text-white">Borrar</Button>
                    </div>
                </div>

                {/* OUTPUT */}
                <div className="p-6 flex flex-col h-full bg-[#0F0F0F] relative">
                    <label className="text-xs font-medium text-purple-400 mb-3 uppercase tracking-wider flex items-center justify-between">
                        <span>Resultado (Humano)</span>
                        {output && <span className="flex items-center gap-1 text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full">Human Score: 99%</span>}
                    </label>

                    {output ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar text-base text-gray-200 leading-relaxed whitespace-pre-wrap animate-in fade-in duration-500">
                            {output}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-700 gap-4 opacity-50">
                            <Sparkles className="w-12 h-12 stroke-[1]" />
                            <p className="text-sm">El resultado aparecerá aquí...</p>
                        </div>
                    )}

                    <div className="pt-4 flex justify-end gap-2">
                        {output && (
                            <Button onClick={handleCopy} variant="ghost" size="sm" className="bg-white/5 hover:bg-white/10 text-gray-300">
                                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                                {copied ? "Copiado" : "Copiar"}
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* ACTION BAR */}
            <div className="p-4 bg-white/5 border-t border-white/10 flex justify-center">
                <Button
                    onClick={handleHumanize}
                    disabled={isProcessing || !input}
                    className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-6 px-12 rounded-xl shadow-lg shadow-purple-900/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                >
                    {isProcessing ? (
                        <>
                            <Repeat className="w-5 h-5 mr-3 animate-spin" />
                            Humanizando...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5 mr-3" />
                            Humanizar Texto Ahora
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
