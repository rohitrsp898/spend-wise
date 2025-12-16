import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Simple Error Boundary Component to catch crashes
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h1 style={{ color: '#EF4444' }}>Something went wrong</h1>
          <p style={{ color: '#374151' }}>Please refresh the page or try again later.</p>
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            background: '#F3F4F6',
            borderRadius: '0.5rem',
            overflow: 'auto',
            textAlign: 'left',
            fontSize: '0.875rem',
            color: '#1f2937'
          }}>
            <strong>Error Details:</strong>
            <pre style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>
              {this.state.error?.toString()}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);