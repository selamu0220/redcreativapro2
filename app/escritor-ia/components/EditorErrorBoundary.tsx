"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    children: ReactNode;
    onReset?: () => void;
    componentName?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
    attemptedRecovery: boolean;
}

/**
 * Specialized Error Boundary for the Text Editor
 * Catches DOM-related errors (like insertBefore failed) that commonly occur with Tiptap
 * and external extensions (Google Translate, Grammarly, etc.)
 */
export class EditorErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        attemptedRecovery: false
    };

    // Emergency retrieval of content from the DOM if possible
    private emergencyContent: string | null = null;

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, attemptedRecovery: false };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(`[EditorErrorBoundary] Error in ${this.props.componentName || 'Editor'}:`, error, errorInfo);

        // Try to rescue content from the DOM before React unmounts everything purely
        try {
            const editorElement = document.querySelector('.ProseMirror');
            if (editorElement) {
                this.emergencyContent = editorElement.innerHTML; // Get HTML
            }
        } catch (e) {
            console.warn("Failed to rescue content during crash", e);
        }

        // simple telemetry (replace with actual logging service if available)
        if (typeof window !== 'undefined' && 'umami' in window) {
            // @ts-ignore
            window.umami?.track('editor_crash', {
                error: error.message,
                component: this.props.componentName,
                stack: errorInfo.componentStack
            });
        }
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null, attemptedRecovery: true });
        if (this.props.onReset) {
            this.props.onReset();
        }
    };

    private handleCopyRescue = () => {
        if (this.emergencyContent) {
            // Strip tags for safer copy
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = this.emergencyContent;
            const text = tempDiv.textContent || tempDiv.innerText || "";

            navigator.clipboard.writeText(text).then(() => {
                alert("Texto rescatado copiado al portapapeles.");
            });
        } else {
            alert("No se pudo rescatar el texto automáticamente. Intenta 'Restaurar Editor'.");
        }
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center h-[500px] w-full bg-muted/30 rounded-lg p-6 text-center border border-destructive/20 animate-in fade-in zoom-in-95 duration-300">
                    <div className="bg-destructive/10 p-4 rounded-full mb-4">
                        <AlertCircle className="w-10 h-10 text-destructive" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                        Houston, tenemos un problema
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md mb-6">
                        Se produjo un error crítico en el editor. Intentaremos recuperar tu trabajo.
                    </p>

                    <div className="flex flex-col gap-3 w-full max-w-xs">
                        {this.emergencyContent && (
                            <Button
                                variant="secondary"
                                onClick={this.handleCopyRescue}
                                className="w-full gap-2 border-green-500/20 bg-green-500/10 text-green-600 hover:bg-green-500/20"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Rescatar Mi Texto (Copia)
                            </Button>
                        )}

                        <Button
                            onClick={this.handleReset}
                            className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Intentar Restaurar Editor
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => window.location.reload()}
                            className="w-full gap-2"
                        >
                            Recargar Página Completa
                        </Button>
                    </div>

                    <div className="mt-8 text-xs text-muted-foreground/50 border-t border-border/50 pt-4 w-full max-w-sm">
                        <p className="font-mono bg-muted p-2 rounded text-left overflow-auto max-h-20">
                            MSG: {this.state.error?.message}
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
