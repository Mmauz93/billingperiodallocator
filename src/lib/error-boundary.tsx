/**
 * Error Boundary Component
 * 
 * Provides standardized error handling and fallback UI for React components.
 * Based on React's Error Boundary pattern with additional features.
 */

'use client';

import { AlertTriangle, Bug, RefreshCcw } from 'lucide-react';
import { Component, ErrorInfo, ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Error logging service (placeholder for a real implementation)
const logError = (error: Error, errorInfo: ErrorInfo, context?: Record<string, unknown>) => {
  // In production, you would send this to your error tracking service
  console.error('Error caught by ErrorBoundary:', { error, errorInfo, context });
};

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  errorContext?: Record<string, unknown>;
  className?: string;
  showRefreshButton?: boolean;
  showReportButton?: boolean;
  variant?: 'default' | 'minimal' | 'card' | 'inline' | 'fullscreen';
  customMessage?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 * 
 * Usage:
 * ```tsx
 * <ErrorBoundary onError={(error) => trackError(error)} fallback={<CustomErrorUI />}>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    
    // Log error to console or error tracking service
    logError(error, errorInfo, this.props.errorContext);
    
    // Call user-provided onError handler if available
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetErrorBoundary = (): void => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  reportError = (): void => {
    const { error, errorInfo } = this.state;
    if (!error) return;
    
    // Simplified error reporting dialog
    alert(`Thank you for reporting this error. The following information will be sent:\n\nError: ${error.message}\nDetails: ${JSON.stringify(this.props.errorContext || {})}`);
    
    // In a real app, you would send this to your error reporting service
    console.log('Error reported by user:', { error, errorInfo, context: this.props.errorContext });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { 
      children, 
      fallback, 
      className, 
      variant = 'default',
      showRefreshButton = true, 
      showReportButton = true,
      customMessage 
    } = this.props;

    if (!hasError) {
      return children;
    }

    // If the user provided a custom fallback UI, use that
    if (fallback) {
      return fallback;
    }

    // Different styles based on the variant
    const styles = {
      default: 'bg-destructive/10 border-destructive/30 rounded-lg p-6 my-4',
      minimal: 'bg-transparent py-2',
      card: 'bg-card shadow-md rounded-lg p-6 my-4 border',
      inline: 'inline-flex items-center bg-destructive/10 text-destructive px-3 py-1 rounded text-sm',
      fullscreen: 'fixed inset-0 bg-background/95 flex items-center justify-center z-50 flex-col'
    };

    // Default error message based on variant
    const renderDefaultErrorUI = () => {
      if (variant === 'inline') {
        return (
          <div className={cn('error-boundary-container', styles[variant], className)}>
            <AlertTriangle className="h-4 w-4 mr-2" /> 
            <span>An error occurred</span>
            {showRefreshButton && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-2 p-0 h-auto"
                onClick={this.resetErrorBoundary}
              >
                <RefreshCcw className="h-3 w-3" />
              </Button>
            )}
          </div>
        );
      }

      return (
        <div className={cn('error-boundary-container', styles[variant], className)}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <AlertTriangle className={cn(
                "text-destructive",
                variant === 'fullscreen' ? 'h-10 w-10' : 'h-6 w-6'
              )} />
            </div>
            <div className="flex-1">
              <h3 className={cn(
                "font-semibold text-foreground",
                variant === 'fullscreen' ? 'text-xl mb-2' : 'text-base'
              )}>
                {customMessage || 'Something went wrong'}
              </h3>
              <div className="text-muted-foreground text-sm mt-1">
                {error?.message && (
                  <p className="mb-2">{error.message}</p>
                )}
                <p>Please try again or refresh the page.</p>
              </div>
              
              <div className={cn(
                "flex gap-2 mt-4",
                variant === 'minimal' ? 'mt-2' : 'mt-4'
              )}>
                {showRefreshButton && (
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={this.resetErrorBoundary}
                    className="gap-1"
                  >
                    <RefreshCcw className="h-3.5 w-3.5" />
                    <span>Try Again</span>
                  </Button>
                )}
                
                {showReportButton && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={this.reportError}
                    className="gap-1"
                  >
                    <Bug className="h-3.5 w-3.5" />
                    <span>Report Issue</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    };
    
    return renderDefaultErrorUI();
  }
}

/**
 * Hook-style error boundary for use with suspense
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps: Omit<ErrorBoundaryProps, 'children'> = {}
): React.ComponentType<P> {
  const displayName = Component.displayName || Component.name || 'Component';
  
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${displayName})`;
  return WrappedComponent;
} 
