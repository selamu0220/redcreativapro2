'use client';

import React from 'react';
import { Button } from "@/app/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class TranslationErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("TranslationErrorBoundary caught error:", error, errorInfo);

    // Check if it's the Google Translate error
    const isGoogleTranslateError =
      error.message.includes('insertBefore') ||
      error.message.includes('removeChild') ||
      error.message.includes('NotFoundUser');

    if (isGoogleTranslateError) {
      console.warn("Caught Google Translate DOM interference. Recovering...");
      // Optionally clear the translation cookie here if it's catastrophic
    }
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null });
    // Force reload if it's a DOM corruption
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center w-full h-full p-6 text-center bg-background/95 backdrop-blur border rounded-lg shadow-sm">
          <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Translation Conflict Detected</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            Google Translate interfered with the editor. This is a common issue with rich text editors.
          </p>
          <div className="flex gap-3">
            <Button
              variant="default"
              onClick={() => {
                // Deactivate Google Translate via cookie reset
                document.cookie = 'googtrans=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                document.cookie = 'googtrans=; Path=/; Domain=.redcreativapro.com; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                window.location.reload();
              }}
              className="bg-primary text-primary-foreground"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Disable Translation & Reload
            </Button>
            <Button variant="outline" onClick={this.resetErrorBoundary}>
              Try to Recover
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
