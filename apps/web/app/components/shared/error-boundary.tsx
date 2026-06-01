'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Button from '../ui/button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6 text-center max-w-md"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                Une erreur est survenue
              </h2>
              <p className="text-sm text-muted-foreground">
                {this.state.error?.message || 'Une erreur inattendue a interrompu cette page.'}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.location.href = '/'}
              >
                <Home className="h-4 w-4 mr-1.5" />
                Accueil
              </Button>
              <Button
                size="sm"
                onClick={this.handleRetry}
              >
                <RefreshCw className="h-4 w-4 mr-1.5" />
                Réessayer
              </Button>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}