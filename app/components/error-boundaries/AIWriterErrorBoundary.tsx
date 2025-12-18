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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Error en el Editor de IA
              </CardTitle>
              <p className="text-gray-600 mt-2">
                {error?.userMessage || 'Se produjo un error inesperado en el editor.'}
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Error Details */}
              {error && (
                <div className="bg-gray-100 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Detalles del error:</h4>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p><strong>Tipo:</strong> {error.type}</p>
                    <p><strong>Severidad:</strong> {error.severity}</p>
                    <p><strong>Hora:</strong> {error.timestamp.toLocaleString()}</p>
                    {error.context && (
                      <p><strong>Contexto:</strong> {JSON.stringify(error.context, null, 2)}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Recovery Actions */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Acciones de recuperación:</h4>
                <div className="grid gap-3">
                  {/* Emergency backup actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={this.downloadBackup}
                      variant="outline"
                      className="flex-1"
                      disabled={isRecovering}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Descargar respaldo
                    </Button>
                    <Button
                      onClick={this.restoreFromBackup}
                      variant="outline"
                      className="flex-1"
                      disabled={isRecovering}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Restaurar trabajo
                    </Button>
                  </div>

                  {/* Dynamic recovery actions */}
                  {recoveryActions.map((action) => (
                    <Button
                      key={action.id}
                      onClick={() => this.handleRecoveryAction(action)}
                      variant={action.primary ? "default" : "outline"}
                      disabled={isRecovering}
                      className="w-full"
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
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      onClick={() => window.location.href = '/ajustes'}
                      variant="outline"
                      className="flex-1"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Configuración
                    </Button>
                    <Button
                      onClick={() => window.location.href = '/'}
                      variant="outline"
                      className="flex-1"
                    >
                      <Home className="w-4 h-4 mr-2" />
                      Inicio
                    </Button>
                  </div>
                </div>
              </div>

              {/* Enhanced Error Recovery Features */}
              {error && (
                <div className="space-y-4">
                  {/* Advanced Options Toggle */}
                  <div className="flex justify-center">
                    <Button
                      onClick={() => this.setState({ showAdvancedOptions: !this.state.showAdvancedOptions })}
                      variant="outline"
                      size="sm"
                      className="text-sm"
                    >
                      {this.state.showAdvancedOptions ? 'Ocultar opciones avanzadas' : 'Mostrar opciones avanzadas'}
                    </Button>
                  </div>

                  {/* Advanced Options */}
                  {this.state.showAdvancedOptions && (
                    <div className="space-y-4 border-t pt-4">
                      {/* Action Buttons */}
                      <div className="flex justify-center space-x-2">
                        <Button
                          onClick={() => this.setState({ showErrorDetails: !this.state.showErrorDetails })}
                          variant="outline"
                          size="sm"
                        >
                          <HelpCircle className="w-4 h-4 mr-1" />
                          {this.state.showErrorDetails ? 'Ocultar detalles' : 'Ver detalles'}
                        </Button>
                        <Button
                          onClick={() => this.setState({ showReporting: !this.state.showReporting })}
                          variant="outline"
                          size="sm"
                        >
                          <MessageSquare className="w-4 h-4 mr-1" />
                          {this.state.showReporting ? 'Ocultar reporte' : 'Reportar error'}
                        </Button>
                      </div>

                      {/* Contextual Help */}
                      <div className="flex justify-center">
                        <ContextualHelpTooltip error={error} />
                      </div>

                      {/* Progressive Error Disclosure */}
                      {this.state.showErrorDetails && (
                        <ProgressiveErrorDisclosure error={error} />
                      )}

                      {/* Error Reporting System */}
                      {this.state.showReporting && (
                        <ErrorReportingSystem
                          error={error}
                          onReportSubmitted={(reportId) => {
                            if (this.state.errorId) {
                              this.errorLogger.addUserAction(this.state.errorId, `Submitted error report: ${reportId}`);
                            }
                            this.setState({ showReporting: false });
                          }}
                        />
                      )}

                      {/* Contextual Recovery Suggestions */}
                      <ContextualRecoverySuggestions
                        error={error}
                        onSuggestionApplied={(suggestionId) => {
                          if (this.state.errorId) {
                            this.errorLogger.addUserAction(this.state.errorId, `Applied suggestion: ${suggestionId}`);
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Help text */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">💡 Consejos:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Tu trabajo se guarda automáticamente cada pocos segundos</li>
                  <li>• Puedes descargar un respaldo de emergencia antes de continuar</li>
                  <li>• Si el problema persiste, intenta limpiar la caché del navegador</li>
                  <li>• Usa las opciones avanzadas para obtener ayuda detallada</li>
                  <li>• Reporta el error para ayudarnos a mejorar el sistema</li>
                </ul>
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