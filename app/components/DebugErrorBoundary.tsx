'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';

interface Props {
    children?: ReactNode;
    name?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class DebugErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(`[ErrorBoundary:${this.props.name || 'Unknown'}]`, error, errorInfo);
        this.setState({ errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 h-full w-full flex items-center justify-center bg-red-50 dark:bg-red-950/20">
                    <Card className="w-full max-w-3xl border-red-500 shadow-xl">
                        <CardHeader className="bg-red-500 text-white">
                            <CardTitle className="flex items-center gap-2">
                                <AlertCircle className="w-6 h-6" />
                                CRASH DETECTED: {this.props.name || 'Component'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-2">
                                <h3 className="font-bold text-red-700 dark:text-red-400">Error Message:</h3>
                                <pre className="p-4 bg-zinc-950 text-red-400 rounded text-sm font-mono whitespace-pre-wrap">
                                    {this.state.error?.toString() || 'Unknown Error'}
                                </pre>
                            </div>

                            {this.state.errorInfo && (
                                <div className="space-y-2">
                                    <h3 className="font-bold text-zinc-700 dark:text-zinc-300">Component Stack:</h3>
                                    <pre className="p-4 bg-zinc-950 text-zinc-400 rounded text-xs font-mono max-h-64 overflow-auto whitespace-pre-wrap">
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                </div>
                            )}

                            <Button
                                variant="outline"
                                onClick={() => {
                                    this.setState({ hasError: false, error: null, errorInfo: null });
                                    window.location.reload();
                                }}
                            >
                                Reload Page
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}
