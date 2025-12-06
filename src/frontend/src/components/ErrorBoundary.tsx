import { Component, type ReactNode, type ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-bg flex items-center justify-center p-6">
          <div className="bg-panel rounded-[28px] border border-border p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-danger/20 flex items-center justify-center">
              <span className="text-danger text-2xl">!</span>
            </div>
            <h2 className="text-2xl font-semibold mb-3">Something went wrong</h2>
            <p className="text-text-muted mb-6">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            {this.state.error && (
              <details className="text-left mb-6">
                <summary className="cursor-pointer text-sm text-text-muted hover:text-text">
                  Error details
                </summary>
                <pre className="mt-2 p-3 bg-panel-dark rounded-lg text-xs text-danger overflow-auto max-h-32">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-6 py-2.5 rounded-full bg-accent text-[#001121] font-semibold text-sm hover:bg-accent/90 transition"
              >
                Try again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 rounded-full border border-border text-text-muted font-semibold text-sm hover:border-accent hover:text-text transition"
              >
                Reload page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
