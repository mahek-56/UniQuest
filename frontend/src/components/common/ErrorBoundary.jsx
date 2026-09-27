import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './Button';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled UI error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-cream-50 flex items-center justify-center p-6">
          <div className="bg-white border-3 border-brand-dark rounded-3xl p-8 max-w-lg w-full shadow-brutal-lg text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 border-2 border-brand-dark flex items-center justify-center text-3xl shadow-brutal-sm">
              ⚠️
            </div>
            <h2 className="text-2xl font-black text-brand-dark">Something went wrong</h2>
            <p className="text-xs font-semibold text-brand-dark/70 leading-relaxed">
              An unexpected error occurred while rendering this section. You can reload the page or return to the dashboard.
            </p>
            {this.state.error?.message && (
              <div className="w-full p-3 bg-cream-100 border border-brand-dark/30 rounded-xl text-[11px] font-mono text-left text-brand-red overflow-x-auto">
                {this.state.error.message}
              </div>
            )}
            <div className="flex items-center gap-3 mt-2 w-full justify-center">
              <Button
                variant="outline"
                size="md"
                onClick={this.handleGoHome}
                icon={Home}
                className="font-black"
              >
                Dashboard
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={this.handleReset}
                icon={RefreshCw}
                className="font-black"
              >
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
