"use client";

import React, { Component, ReactNode } from 'react';
import ErrorLogger, { AppError, ErrorRecoveryAction } from '@/app/lib/error-logging/ErrorLogger';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { AlertTriangle, RefreshCw, Download, Settings, Home, HelpCircle, MessageSquare } from 'lucide-react';
import ContextualHelpTooltip from '@/app/components/error-display/ContextualHelpTooltip';
import ProgressiveErrorDisclosure from '@/app/components/error-display/ProgressiveErrorDisclosure';
import ErrorReportingSystem from '@/app/components/error-display/ErrorReportingSystem';
import ContextualRecoverySuggestions from '@/app/components/error-display/ContextualRecoverySuggestions';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: AppError) => void;
}

interface State {
  hasError: boolean;
  error: AppError | null;
  errorId: string | null;
  recoveryActions: ErrorRecoveryAction[];
  isRecovering: boolean;
  showAdvancedOptions: boolean;
  showErrorDetails: boolean;
  showReporting: boolean;
}

export class AIWriterErrorBoundary extends Component<Props, State> {
  private errorLogger: ErrorLogger;
  private unsubscribeErrorListener?: () => void;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: null,
      recoveryActions: [],
      isRecovering: false,
      showAdvancedOptions: false,
      showErrorDetails: false,
      showReporting: false
    };

    this.errorLogger = ErrorLogger.getInstance();
  }

  componentDidMount() {
    // Listen for errors from the error logger
    this.unsubscribeErrorListener = this.errorLogger.onError((error) => {
      if (error.severity === 'critical') {
        this.handleCriticalError(error);
      }
    });
  }

  componentWillUnmount() {
    if (this.unsubscribeErrorListener) {
      this.unsubscribeErrorListener();
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const appError = this.errorLogger.logError({
      type: 'validation',
      severity: 'critical',
      message: `React Error Boundary: ${error.message}`,
      userMessage: 'Se produjo un error crítico en el editor. Intentaremos recuperar tu trabajo.',
      recoverable: true,
      retryable: true,
      context: {
        componentStack: errorInfo.componentStack,
        errorBoundary: 'AIWriterErrorBoundary'
      },
      stackTrace: error.stack
    });

    const recoveryActions = this.errorLogger.getRecoveryActions(appError);

    this.setState({
      error: appError,
      errorId: appError.id,
      recoveryActions,
      hasError: true
    });

    // Call the onError prop if provided
    if (this.props.onError) {
      this.props.onError(appError);
    }

    // Try to preserve user data
    this.preserveUserData();
  }

  private handleCriticalError = (error: AppError) => {
    if (!this.state.hasError) {
      const recoveryActions = this.errorLogger.getRecoveryActions(error);

      this.setState({
        hasError: true,
        error,
        errorId: error.id,
        recoveryActions
      });
    }
  };

  private preserveUserData = () => {
    try {
      // Try to save current content to localStorage as emergency backup
      const textareas = document.querySelectorAll('textarea');
      const contentEditable = document.querySelectorAll('[contenteditable="true"]');

      const backupData = {
        timestamp: new Date().toISOString(),
        textareas: Array.from(textareas).map((textarea, index) => ({
          index,
          value: textarea.value,
          id: textarea.id || `textarea-${index}`
        })),
        contentEditable: Array.from(contentEditable).map((element, index) => ({
          index,
          content: element.innerHTML,
          id: element.id || `contenteditable-${index}`
        }))
      };

      localStorage.setItem('ai_writer_emergency_backup', JSON.stringify(backupData));
      console.log('✅ Emergency backup saved to localStorage');
    } catch (e) {
      console.error('❌ Failed to save emergency backup:', e);
    }
  };

  private handleRecoveryAction = async (action: ErrorRecoveryAction) => {
    this.setState({ isRecovering: true });

    try {
      if (this.state.errorId) {
        this.errorLogger.addUserAction(this.state.errorId, `Executed recovery action: ${action.label}`);
      }

      await action.action();

      // If the action doesn't reload the page, try to recover
      setTimeout(() => {
        this.setState({
          hasError: false,
          error: null,
          errorId: null,
          recoveryActions: [],
          isRecovering: false
        });

        if (this.state.errorId) {
          this.errorLogger.markErrorResolved(this.state.errorId);
        }
      }, 1000);

    } catch (recoveryError) {
      console.error('Recovery action failed:', recoveryError);

      if (this.state.errorId) {
        this.errorLogger.addUserAction(this.state.errorId, `Recovery action failed: ${recoveryError}`);
      }

      this.setState({ isRecovering: false });
    }
  };

  private downloadBackup = () => {
    try {
      const backup = localStorage.getItem('ai_writer_emergency_backup');
      if (backup) {
        const blob = new Blob([backup], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-writer-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        if (this.state.errorId) {
          this.errorLogger.addUserAction(this.state.errorId, 'Downloaded emergency backup');
        }
      }
    } catch (e) {
      console.error('Failed to download backup:', e);
    }
  };

  private restoreFromBackup = () => {
    try {
      const backup = localStorage.getItem('ai_writer_emergency_backup');
      if (backup) {
        const backupData = JSON.parse(backup);

        // Try to restore textareas
        backupData.textareas?.forEach((item: any) => {
          const textarea = document.getElementById(item.id) as HTMLTextAreaElement;
          if (textarea) {
            textarea.value = item.value;
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
          }
        });

        // Try to restore contentEditable elements
        backupData.contentEditable?.forEach((item: any) => {
          const element = document.getElementById(item.id);
          if (element) {
            element.innerHTML = item.content;
            element.dispatchEvent(new Event('input', { bubbles: true }));
          }
        });

        if (this.state.errorId) {
          this.errorLogger.addUserAction(this.state.errorId, 'Restored from emergency backup');
        }

        // Clear the error state
        this.setState({
          hasError: false,
          error: null,
          errorId: null,
          recoveryActions: [],
          isRecovering: false
        });
      }
    } catch (e) {
      console.error('Failed to restore from backup:', e);
    }
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, recoveryActions, isRecovering } = this.state;

      return (
        <div className="h-full w-full flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm animate-in fade-in duration-500">
          <Card className="w-full max-w-2xl bg-black/40 border-white/10 backdrop-blur-xl shadow-2xl text-foreground ring-1 ring-white/5">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 ring-1 ring-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
                Houston, tenemos un problema
              </CardTitle>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                {error?.userMessage || 'El editor ha encontrado una anomalía en el sistema.'}
              </p>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              {/* Error Details (Collapsible) */}
              {error && (
                <div className="bg-red-950/20 rounded-lg p-4 border border-red-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    <h4 className="font-semibold text-red-200 text-sm">Registro del Error</h4>
                  </div>
                  <div className="text-xs text-red-200/70 font-mono space-y-1 overflow-x-auto">
                    <p><span className="text-red-500/50">TYPE:</span> {error.type}</p>
                    <p><span className="text-red-500/50">TIME:</span> {error.timestamp.toLocaleTimeString()}</p>
                    <p><span className="text-red-500/50">MSG:</span> {error.message}</p>
                  </div>
                </div>
              )}

              {/* Recovery Actions */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 text-center">Protocolos de Recuperación</h4>
                <div className="grid gap-3">
                  {/* Emergency backup actions */}
                  <div className="flex gap-3">
                    <Button
                      onClick={this.downloadBackup}
                      variant="outline"
                      className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 hover:text-white transition-all text-xs"
                      disabled={isRecovering}
                    >
                      <Download className="w-3.5 h-3.5 mr-2" />
                      Descargar Copia
                    </Button>
                    <Button
                      onClick={this.restoreFromBackup}
                      variant="outline"
                      className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 hover:text-white transition-all text-xs"
                      disabled={isRecovering}
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-2" />
                      Intentar Restaurar
                    </Button>
                  </div>

                  {/* Dynamic recovery actions */}
                  {recoveryActions.map((action) => (
                    <Button
                      key={action.id}
                      onClick={() => this.handleRecoveryAction(action)}
                      variant={action.primary ? "default" : "secondary"}
                      disabled={isRecovering}
                      className={`w-full h-11 transition-all ${action.primary ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/20' : 'bg-secondary/50 hover:bg-secondary/80'}`}
                    >
                      {isRecovering ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-2" />
                      )}
                      {action.label}
                    </Button>
                  ))}

                  {/* Navigation actions */}
                  <div className="flex gap-2 pt-4 border-t border-white/5 mt-2">
                    <Button
                      onClick={() => window.location.href = '/'}
                      variant="ghost"
                      className="flex-1 h-8 text-xs text-muted-foreground hover:text-white "
                    >
                      <Home className="w-3 h-3 mr-2" />
                      Volver al Inicio
                    </Button>
                  </div>
                </div>
              </div>

              {/* Help text */}
              <div className="bg-blue-950/20 border border-blue-500/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <HelpCircle className="w-4 h-4 text-blue-400" />
                  <h4 className="font-semibold text-blue-200 text-xs">Sistema de Seguridad Activo</h4>
                </div>
                <p className="text-xs text-blue-200/60 leading-relaxed">
                  Tu trabajo se guarda localmente cada 5 segundos. Si recargas la página, es muy probable que no pierdas nada importante.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AIWriterErrorBoundary;
