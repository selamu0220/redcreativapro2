'use client';

/**
 * Onboarding Modal Component
 * 
 * Interactive guided tour for new users
 * Requirements: 15.1, 15.2, 15.3, 15.4, 15.5
 */

import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles, Keyboard, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    OnboardingService,
    OnboardingDemoService,
    ONBOARDING_STEPS,
    type OnboardingProgress,
} from '@/app/lib/onboarding-service';

interface OnboardingModalProps {
    userId: string;
    onComplete: () => void;
    onSkip: () => void;
}

export function OnboardingModal({ userId, onComplete, onSkip }: OnboardingModalProps) {
    const [open, setOpen] = useState(false);
    const [progress, setProgress] = useState<OnboardingProgress | null>(null);
    const [demoText, setDemoText] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const service = new OnboardingService();
    const demoService = new OnboardingDemoService();

    useEffect(() => {
        // Check if should show onboarding
        service.shouldShowOnboarding(userId).then(shouldShow => {
            if (shouldShow) {
                service.startOnboarding(userId).then(initialProgress => {
                    setProgress(initialProgress);
                    setOpen(true);
                });
            }
        });
    }, [userId]);

    const currentStep = progress ? service.getCurrentStep(progress) : null;
    const stepNumber = progress ? progress.currentStep + 1 : 0;
    const totalSteps = ONBOARDING_STEPS.length;

    const handleNext = async () => {
        if (!progress) return;

        // Handle demo steps
        if (currentStep?.action === 'demo' && currentStep.demoContent) {
            await runDemo(currentStep.demoContent);
        }

        const newProgress = await service.nextStep(progress);
        setProgress(newProgress);

        // If completed, close and mark as done
        if (newProgress.completedAt) {
            await service.markCompleted(userId);
            setOpen(false);
            onComplete();
        }
    };

    const handlePrevious = () => {
        if (!progress || progress.currentStep === 0) return;

        setProgress({
            ...progress,
            currentStep: progress.currentStep - 1,
        });
    };

    const handleSkip = async () => {
        if (progress) {
            await service.skipOnboarding(progress);
            await service.markCompleted(userId);
        }
        setOpen(false);
        onSkip();
    };

    const runDemo = async (text: string) => {
        setIsTyping(true);
        setDemoText('');

        // Simulate typing
        const generator = demoService.simulateTyping(text, 5);
        for await (const currentText of generator) {
            setDemoText(currentText);
        }

        setIsTyping(false);

        // Wait a bit before allowing next
        await new Promise(resolve => setTimeout(resolve, 1000));
    };

    if (!open || !progress || !currentStep) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {stepNumber === 1 && <Sparkles className="h-5 w-5 text-primary" />}
                            {stepNumber >= 6 && stepNumber <= 7 && <Zap className="h-5 w-5 text-primary" />}
                            {stepNumber === 8 && <Keyboard className="h-5 w-5 text-primary" />}

                            <DialogTitle>{currentStep.title}</DialogTitle>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                {stepNumber} / {totalSteps}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleSkip}
                                className="h-6 w-6"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-4 h-2 w-full rounded-full bg-muted">
                        <div
                            className="h-full rounded-full bg-primary transition-all duration-300"
                            style={{ width: `${(stepNumber / totalSteps) * 100}%` }}
                        />
                    </div>
                </DialogHeader>

                <div className="py-6">
                    <DialogDescription className="text-base whitespace-pre-line mb-6">
                        {currentStep.description}
                    </DialogDescription>

                    {/* Demo area */}
                    {currentStep.action === 'demo' && (
                        <div className="rounded-lg border bg-muted/50 p-4 font-mono text-sm">
                            {demoText || currentStep.demoContent}
                            {isTyping && (
                                <span className="inline-block w-2 h-5 bg-primary ml-1 animate-pulse" />
                            )}
                        </div>
                    )}

                    {/* Input area for style sample */}
                    {currentStep.id === 'style-sample' && (
                        <textarea
                            className="w-full min-h-[200px] rounded-lg border bg-background p-4 font-mono text-sm"
                            placeholder="Pega aquí un ejemplo de tu escritura (mínimo 500 palabras)..."
                        />
                    )}

                    {/* Quick reference card */}
                    {currentStep.id === 'complete' && (
                        <div className="rounded-lg border bg-gradient-to-br from-primary/10 to-primary/5 p-6">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <Keyboard className="h-5 w-5" />
                                Tarjeta de Referencia Rápida
                            </h3>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="font-medium mb-2">Atajos de Teclado</p>
                                    <ul className="space-y-1 text-muted-foreground">
                                        <li>• TAB - Aceptar sugerencia</li>
                                        <li>• ESC - Rechazar sugerencia</li>
                                        <li>• Shift+1 - Toggle Modo Agente</li>
                                        <li>• Ctrl+Z - Deshacer cambios</li>
                                    </ul>
                                </div>

                                <div>
                                    <p className="font-medium mb-2">Funcionalidades</p>
                                    <ul className="space-y-1 text-muted-foreground">
                                        <li>• Análisis cada 2 segundos</li>
                                        <li>• Modo Agente automático</li>
                                        <li>• Aprende tu estilo</li>
                                        <li>• Optimización SEO</li>
                                    </ul>
                                </div>
                            </div>

                            <Button className="w-full mt-4" variant="outline" asChild>
                                <a href="#" download="red-creativa-pro-shortcuts.pdf">
                                    Descargar Tarjeta PDF
                                </a>
                            </Button>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <div className="flex w-full items-center justify-between">
                        <Button
                            variant="ghost"
                            onClick={handleSkip}
                        >
                            Saltar Tour
                        </Button>

                        <div className="flex gap-2">
                            {progress.currentStep > 0 && (
                                <Button
                                    variant="outline"
                                    onClick={handlePrevious}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Anterior
                                </Button>
                            )}

                            <Button
                                onClick={handleNext}
                                disabled={isTyping}
                            >
                                {stepNumber === totalSteps ? 'Finalizar' : 'Siguiente'}
                                {stepNumber < totalSteps && <ChevronRight className="h-4 w-4 ml-1" />}
                            </Button>
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
