'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, PenTool, Sparkles, Zap, Download, Play } from 'lucide-react';
import { Button } from './ui/button';
import Link from 'next/link';

interface WriterTutorialModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const tutorialSteps = [
    {
        id: 1,
        title: 'Escribe tu contenido',
        description: 'Comienza escribiendo tu texto en el editor. La interfaz es simple e intuitiva.',
        icon: PenTool,
    },
    {
        id: 2,
        title: 'Activa Auto-Mejora',
        description: 'Enciende el modo automático y la IA mejorará tu texto cada 2 segundos mientras escribes.',
        icon: Zap,
    },
    {
        id: 3,
        title: 'Recibe sugerencias',
        description: 'La IA analiza tu texto y te sugiere mejoras. Acepta o rechaza con un click.',
        icon: Sparkles,
    },
    {
        id: 4,
        title: 'Exporta tu trabajo',
        description: 'Descarga tu documento en PDF, Word o Markdown cuando estés listo.',
        icon: Download,
    },
];

// Simulated editor content for animations
const typingTexts = [
    '',
    'El ',
    'El mar',
    'El marketing ',
    'El marketing digit',
    'El marketing digital ',
    'El marketing digital es ',
    'El marketing digital es fund',
    'El marketing digital es fundamental',
    'El marketing digital es fundamental para',
    'El marketing digital es fundamental para el ',
    'El marketing digital es fundamental para el crecimiento',
];

const improvedText = 'El marketing digital constituye un pilar fundamental para impulsar el crecimiento empresarial en la era moderna.';

export default function WriterTutorialModal({ isOpen, onClose }: WriterTutorialModalProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [typingIndex, setTypingIndex] = useState(0);
    const [showImprovement, setShowImprovement] = useState(false);
    const [autoModeOn, setAutoModeOn] = useState(false);

    // Reset animation state when modal opens or step changes
    useEffect(() => {
        if (isOpen) {
            setTypingIndex(0);
            setShowImprovement(false);
            setAutoModeOn(false);
        }
    }, [isOpen, currentStep]);

    // Typing animation for step 1
    useEffect(() => {
        if (!isOpen || currentStep !== 0) return;

        const interval = setInterval(() => {
            setTypingIndex(prev => {
                if (prev >= typingTexts.length - 1) {
                    clearInterval(interval);
                    return prev;
                }
                return prev + 1;
            });
        }, 150);

        return () => clearInterval(interval);
    }, [isOpen, currentStep]);

    // Auto-mode animation for step 2
    useEffect(() => {
        if (!isOpen || currentStep !== 1) return;

        const timeout = setTimeout(() => setAutoModeOn(true), 800);
        return () => clearTimeout(timeout);
    }, [isOpen, currentStep]);

    // Improvement animation for step 3
    useEffect(() => {
        if (!isOpen || currentStep !== 2) return;

        const timeout = setTimeout(() => setShowImprovement(true), 1000);
        return () => clearTimeout(timeout);
    }, [isOpen, currentStep]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, tutorialSteps.length - 1));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

    const step = tutorialSteps[currentStep];
    const StepIcon = step.icon;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={handleBackdropClick}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-2xl bg-background rounded-2xl shadow-2xl overflow-hidden border"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b bg-muted/30">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-lg">
                            <Play className="h-4 w-4 text-primary" />
                        </div>
                        <h3 className="font-semibold">Tutorial Interactivo</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-muted rounded-full transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Animation Area */}
                <div className="p-6 min-h-[300px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            {/* Simulated Editor */}
                            <div className="bg-muted/50 rounded-xl border p-4 space-y-3">
                                {/* Editor Header */}
                                <div className="flex items-center justify-between pb-3 border-b border-border/50">
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1.5">
                                            <div className="w-3 h-3 rounded-full bg-red-500/70" />
                                            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                                            <div className="w-3 h-3 rounded-full bg-green-500/70" />
                                        </div>
                                        <span className="text-xs text-muted-foreground ml-2">Escritor IA</span>
                                    </div>

                                    {/* Auto-Mode Toggle (Step 2) */}
                                    {currentStep >= 1 && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex items-center gap-2"
                                        >
                                            <span className="text-xs text-muted-foreground">Auto-mejora</span>
                                            <motion.div
                                                className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${autoModeOn ? 'bg-primary' : 'bg-muted-foreground/30'
                                                    }`}
                                                animate={currentStep === 1 ? { scale: [1, 1.1, 1] } : {}}
                                                transition={{ duration: 0.3, delay: 0.5 }}
                                            >
                                                <motion.div
                                                    className="w-4 h-4 rounded-full bg-white shadow-sm"
                                                    animate={{ x: autoModeOn ? 20 : 0 }}
                                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                                />
                                            </motion.div>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Editor Content */}
                                <div className="min-h-[120px] relative">
                                    {currentStep === 0 && (
                                        <div className="font-mono text-sm">
                                            {typingTexts[typingIndex]}
                                            <motion.span
                                                className="inline-block w-0.5 h-4 bg-primary ml-0.5"
                                                animate={{ opacity: [1, 0] }}
                                                transition={{ duration: 0.5, repeat: Infinity }}
                                            />
                                        </div>
                                    )}

                                    {currentStep === 1 && (
                                        <div className="font-mono text-sm">
                                            El marketing digital es fundamental para el crecimiento
                                            {autoModeOn && (
                                                <motion.span
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="ml-3 inline-flex items-center gap-1 text-primary text-xs"
                                                >
                                                    <Zap className="h-3 w-3" />
                                                    Analizando...
                                                </motion.span>
                                            )}
                                        </div>
                                    )}

                                    {currentStep === 2 && (
                                        <div className="space-y-3">
                                            <div className={`font-mono text-sm transition-opacity ${showImprovement ? 'opacity-40 line-through' : ''}`}>
                                                El marketing digital es fundamental para el crecimiento
                                            </div>
                                            {showImprovement && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="p-3 bg-primary/10 border border-primary/20 rounded-lg"
                                                >
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Sparkles className="h-4 w-4 text-primary" />
                                                        <span className="text-xs font-medium text-primary">Sugerencia de mejora</span>
                                                    </div>
                                                    <p className="font-mono text-sm text-foreground">{improvedText}</p>
                                                    <div className="flex gap-2 mt-3">
                                                        <Button size="sm" className="h-7 text-xs">Aceptar</Button>
                                                        <Button size="sm" variant="ghost" className="h-7 text-xs">Rechazar</Button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>
                                    )}

                                    {currentStep === 3 && (
                                        <div className="space-y-4">
                                            <p className="font-mono text-sm">{improvedText}</p>
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.5 }}
                                                className="flex gap-2"
                                            >
                                                {['PDF', 'Word', 'MD'].map((format, i) => (
                                                    <motion.div
                                                        key={format}
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: 0.7 + i * 0.2 }}
                                                    >
                                                        <Button variant="outline" size="sm" className="h-8 gap-1.5">
                                                            <Download className="h-3 w-3" />
                                                            {format}
                                                        </Button>
                                                    </motion.div>
                                                ))}
                                            </motion.div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Step Info */}
                            <div className="text-center space-y-2">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
                                    <StepIcon className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-medium text-primary">Paso {currentStep + 1}</span>
                                </div>
                                <h4 className="text-xl font-bold">{step.title}</h4>
                                <p className="text-muted-foreground max-w-md mx-auto">{step.description}</p>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer Navigation */}
                <div className="p-4 border-t bg-muted/30">
                    <div className="flex items-center justify-between">
                        {/* Progress Dots */}
                        <div className="flex gap-2">
                            {tutorialSteps.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentStep(idx)}
                                    className={`w-2 h-2 rounded-full transition-colors ${idx === currentStep ? 'bg-primary' : 'bg-muted-foreground/30'
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex gap-2">
                            {currentStep > 0 && (
                                <Button variant="ghost" size="sm" onClick={prevStep} className="gap-1">
                                    <ChevronLeft className="h-4 w-4" />
                                    Anterior
                                </Button>
                            )}

                            {currentStep < tutorialSteps.length - 1 ? (
                                <Button size="sm" onClick={nextStep} className="gap-1">
                                    Siguiente
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            ) : (
                                <Button size="sm" asChild className="gap-1">
                                    <Link href="/escritor-ia">
                                        <PenTool className="h-4 w-4" />
                                        Empezar a Escribir
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
