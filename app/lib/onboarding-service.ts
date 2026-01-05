/**
 * Onboarding System
 * 
 * Guided tour for first-time users demonstrating key features:
 * - Prompting for writing samples
 * - Demonstrating real-time improvements
 * - Explaining agent mode and keyboard shortcuts
 * - Providing quick reference card
 * 
 * Requirements: 15.1, 15.2, 15.3, 15.4, 15.5
 */

export interface OnboardingStep {
    id: string;
    title: string;
    description: string;
    targetElement?: string; // CSS selector for spotlight
    action?: 'demo' | 'input' | 'click' | 'observe';
    demoContent?: string; // For demonstration steps
    completionCriteria?: string;
}

export interface OnboardingProgress {
    userId: string;
    currentStep: number;
    totalSteps: number;
    completedSteps: string[];
    startedAt: Date;
    completedAt?: Date;
    skipped: boolean;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
    {
        id: 'welcome',
        title: '¡Bienvenido a Red Creativa Pro!',
        description: 'Tu asistente de escritura con IA que aprende tu estilo único. Completa este tour de 3 minutos y estarás escribiendo mejor contenido inmediatamente.',
        action: 'observe',
    },
    {
        id: 'style-sample',
        title: 'Paso 1: Enséñame tu Estilo',
        description: 'Para que la IA escriba como tú, necesito analizar tu estilo de escritura. Pega un ejemplo de tu mejor trabajo (mínimo 500 palabras). Puede ser un artículo, blog post, o cualquier texto que represente tu voz.',
        targetElement: '#preprompt-area',
        action: 'input',
        completionCriteria: 'sample-added',
    },
    {
        id: 'style-analysis',
        title: 'Analizando tu Estilo...',
        description: 'Estoy estudiando tu tono, vocabulario, estructura de oraciones y preferencias estilísticas. Esto toma solo unos segundos.',
        action: 'observe',
        completionCriteria: 'analysis-complete',
    },
    {
        id: 'realtime-demo',
        title: 'Paso 2: Mejoras en Tiempo Real',
        description: 'Cada 2 segundos mientras escribes, analizo tu texto y sugiero mejoras. Observa cómo funciona:',
        targetElement: '#ai-editor',
        action: 'demo',
        demoContent: 'Este es un ejemplo de texto que podríamos mejorar para hacerlo más claro y efectivo',
        completionCriteria: 'demo-watched',
    },
    {
        id: 'accept-suggestions',
        title: 'Aceptar Sugerencias',
        description: 'Cuando veas una sugerencia, presiona TAB para aceptarla o ESC para rechazarla. Es así de simple.',
        targetElement: '#suggestion-display',
        action: 'click',
        completionCriteria: 'suggestion-accepted',
    },
    {
        id: 'agent-mode-intro',
        title: 'Paso 3: Modo Agente (Tu Arma Secreta)',
        description: 'El Modo Agente mejora párrafos completos automáticamente. Se activa cuando paras de escribir por 3 segundos, o presionando Shift+1.',
        targetElement: '#agent-mode-indicator',
        action: 'observe',
    },
    {
        id: 'agent-mode-demo',
        title: 'Demo del Modo Agente',
        description: 'Deja de escribir por 3 segundos y observa cómo el Modo Agente analiza y mejora todo tu contenido automáticamente.',
        action: 'demo',
        demoContent: 'Este párrafo será mejorado por el agente. Observa cómo se optimiza la estructura, claridad y SEO.',
        completionCriteria: 'agent-demo-complete',
    },
    {
        id: 'shortcuts-guide',
        title: 'Atajos de Teclado',
        description: 'Para máxima productividad:\n• TAB: Aceptar sugerencia\n• ESC: Rechazar sugerencia\n• Shift+1: Activar/desactivar Modo Agente\n• Ctrl+Z: Deshacer cambios del agente',
        action: 'observe',
    },
    {
        id: 'seo-features',
        title: 'Bonus: Optimización SEO',
        description: 'Además de mejorar tu escritura, analizo SEO en tiempo real y sugiero mejoras para aumentar tu tráfico.',
        targetElement: '#seo-score-display',
        action: 'observe',
    },
    {
        id: 'complete',
        title: '¡Listo para Escribir como un Pro!',
        description: 'Has completado el onboarding. Aquí tienes una tarjeta de referencia rápida que puedes guardar.',
        action: 'observe',
        completionCriteria: 'tour-complete',
    },
];

/**
 * Manages onboarding flow
 */
export class OnboardingService {
    /**
     * Initialize onboarding for a new user
     */
    async startOnboarding(userId: string): Promise<OnboardingProgress> {
        return {
            userId,
            currentStep: 0,
            totalSteps: ONBOARDING_STEPS.length,
            completedSteps: [],
            startedAt: new Date(),
            skipped: false,
        };
    }

    /**
     * Move to next step
     */
    async nextStep(progress: OnboardingProgress): Promise<OnboardingProgress> {
        const currentStepId = ONBOARDING_STEPS[progress.currentStep]?.id;

        if (currentStepId && !progress.completedSteps.includes(currentStepId)) {
            progress.completedSteps.push(currentStepId);
        }

        progress.currentStep = Math.min(
            progress.currentStep + 1,
            ONBOARDING_STEPS.length - 1
        );

        // Mark as completed if all steps done
        if (progress.currentStep === ONBOARDING_STEPS.length - 1) {
            progress.completedAt = new Date();
        }

        return progress;
    }

    /**
     * Skip onboarding
     */
    async skipOnboarding(progress: OnboardingProgress): Promise<OnboardingProgress> {
        return {
            ...progress,
            skipped: true,
            completedAt: new Date(),
        };
    }

    /**
     * Check if step is completed
     */
    isStepCompleted(progress: OnboardingProgress, stepId: string): boolean {
        return progress.completedSteps.includes(stepId);
    }

    /**
     * Get current step
     */
    getCurrentStep(progress: OnboardingProgress): OnboardingStep | null {
        return ONBOARDING_STEPS[progress.currentStep] || null;
    }

    /**
     * Check if user should see onboarding
     */
    async shouldShowOnboarding(userId: string): Promise<boolean> {
        // In production, check database for user's onboarding status
        // For now, check localStorage
        if (typeof window === 'undefined') return false;

        const completed = localStorage.getItem(`onboarding-completed-${userId}`);
        return !completed;
    }

    /**
     * Mark onboarding as completed
     */
    async markCompleted(userId: string): Promise<void> {
        if (typeof window === 'undefined') return;

        localStorage.setItem(`onboarding-completed-${userId}`, 'true');
        localStorage.setItem(`onboarding-completed-at-${userId}`, new Date().toISOString());
    }

    /**
     * Generate quick reference card content
     */
    getQuickReferenceCard(): {
        title: string;
        sections: Array<{
            title: string;
            items: string[];
        }>;
    } {
        return {
            title: 'Red Creativa Pro - Guía Rápida',
            sections: [
                {
                    title: 'Atajos de Teclado',
                    items: [
                        'TAB - Aceptar sugerencia',
                        'ESC - Rechazar sugerencia',
                        'Shift+1 - Toggle Modo Agente',
                        'Ctrl+Z - Deshacer cambios del agente',
                    ],
                },
                {
                    title: 'Mejoras en Tiempo Real',
                    items: [
                        'Análisis automático cada 2 segundos',
                        'Sugerencias de gramática, estilo y claridad',
                        'Optimización SEO integrada',
                        'Preserva tu estilo personal',
                    ],
                },
                {
                    title: 'Modo Agente',
                    items: [
                        'Se activa tras 3 segundos sin escribir',
                        'Mejora párrafos completos automáticamente',
                        'Genera mejoras estructurales y de SEO',
                        'Revisa cambios antes de aplicar',
                    ],
                },
                {
                    title: 'Aprendizaje de Estilo',
                    items: [
                        'Pega muestras de tu escritura (500+ palabras)',
                        'El sistema aprende tu tono y vocabulario',
                        'Las sugerencias se adaptan a tu estilo',
                        'Actualiza muestras en cualquier momento',
                    ],
                },
                {
                    title: 'Tips Pro',
                    items: [
                        'Escribe natural - la IA se adapta a ti',
                        'Revisa sugerencias antes de aceptar',
                        'Usa el Modo Agente para borradores rápidos',
                        'Actualiza tu perfil con nuevo contenido',
                    ],
                },
            ],
        };
    }
}

/**
 * Demo content generator for onboarding demonstrations
 */
export class OnboardingDemoService {
    /**
     * Simulate real-time analysis demo
     */
    async simulateRealtimeAnalysis(text: string): Promise<{
        original: string;
        suggestions: Array<{
            type: string;
            original: string;
            improved: string;
            reason: string;
        }>;
    }> {
        // Simulated suggestions for demo purposes
        return {
            original: text,
            suggestions: [
                {
                    type: 'clarity',
                    original: 'podríamos mejorar',
                    improved: 'deberíamos optimizar',
                    reason: 'Más directo y autoritativo',
                },
                {
                    type: 'grammar',
                    original: 'para hacerlo',
                    improved: 'para que sea',
                    reason: 'Mejor construcción gramatical',
                },
                {
                    type: 'style',
                    original: 'más claro y efectivo',
                    improved: 'más claro, conciso y efectivo',
                    reason: 'Mejora el ritmo con serie de tres',
                },
            ],
        };
    }

    /**
     * Simulate agent mode demo
     */
    async simulateAgentMode(text: string): Promise<{
        original: string;
        improved: string;
        changes: Array<{
            type: string;
            description: string;
        }>;
    }> {
        return {
            original: text,
            improved: 'Este párrafo ha sido optimizado por el agente inteligente. Observa cómo se ha mejorado la estructura para mayor claridad, se han incorporado keywords estratégicas para SEO, y se ha ajustado el tono para mayor impacto.',
            changes: [
                {
                    type: 'structure',
                    description: 'Reorganizadas frases para mejor flujo lógico',
                },
                {
                    type: 'seo',
                    description: 'Agregadas keywords relevantes naturalmente',
                },
                {
                    type: 'clarity',
                    description: 'Simplificada complejidad sintáctica',
                },
                {
                    type: 'impact',
                    description: 'Fortalecido el tono para mayor autoridad',
                },
            ],
        };
    }

    /**
     * Show typing simulation
     */
    async* simulateTyping(text: string, charsPerStep: number = 3): AsyncGenerator<string> {
        for (let i = 0; i <= text.length; i += charsPerStep) {
            yield text.substring(0, i);
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
}
