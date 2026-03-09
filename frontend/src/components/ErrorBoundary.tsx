import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 p-6 text-center">
          <h1 className="text-2xl font-serif text-stone-800 mb-4">Something went wrong</h1>
          <p className="text-stone-500 mb-8 max-w-md">
            We encountered an unexpected error. This is often caused by outdated local data.
          </p>
          <div className="bg-red-50 border border-red-100 p-4 rounded-lg mb-8 text-left w-full max-w-md overflow-auto max-h-40">
            <code className="text-xs text-red-800 font-mono">
              {this.state.error?.message}
            </code>
          </div>
          <button
            onClick={this.handleReset}
            className="bg-stone-900 text-white px-6 py-3 rounded-full font-medium hover:bg-stone-800 transition-colors"
          >
            Clear Data & Restart
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
