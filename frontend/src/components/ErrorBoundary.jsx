import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Caught by ErrorBoundary:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white p-8">
          <div className="text-center max-w-2xl bg-red-50 p-6 rounded-xl border border-red-200">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">Please refresh the page or contact support.</p>
            <div className="bg-white p-4 rounded text-left overflow-auto text-sm text-red-800 font-mono mb-4 border border-red-100 max-h-64">
              <p className="font-bold">{this.state.error?.toString()}</p>
              <pre className="mt-2 text-xs">{this.state.error?.stack}</pre>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
