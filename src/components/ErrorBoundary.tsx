import { Component, type ErrorInfo, type ReactNode } from 'react';
import { reportError } from '@/utils/newrelic';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component that catches React errors
 * Provides a fallback UI when errors occur
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // In production, log to console for browser error tracking
    console.error('Error:', error);
    console.error('Component Stack:', errorInfo.componentStack);

    // Report error to New Relic with component stack
    reportError(error, {
      errorBoundary: true,
      componentStack: errorInfo.componentStack || 'unknown',
      source: 'React ErrorBoundary',
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            backgroundColor: '#f9fafb',
          }}
          role="alert"
          aria-live="assertive"
        >
          <div
            style={{
              maxWidth: '32rem',
              textAlign: 'center',
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '0.5rem',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            }}
          >
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#dc2626',
                marginBottom: '1rem',
              }}
            >
              Something went wrong
            </h1>
            <p
              style={{
                color: '#6b7280',
                marginBottom: '1.5rem',
                lineHeight: '1.6',
              }}
            >
              We're sorry, but something unexpected happened. Please try again.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <details
                style={{
                  marginBottom: '1.5rem',
                  textAlign: 'left',
                  backgroundColor: '#fef2f2',
                  padding: '1rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #fecaca',
                }}
              >
                <summary
                  style={{
                    cursor: 'pointer',
                    fontWeight: '600',
                    color: '#dc2626',
                    marginBottom: '0.5rem',
                  }}
                >
                  Error Details (Development Only)
                </summary>
                <pre
                  style={{
                    fontSize: '0.875rem',
                    color: '#991b1b',
                    overflow: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {this.state.error.toString()}
                  {this.state.error.stack && `\n\n${this.state.error.stack}`}
                </pre>
              </details>
            )}
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={this.handleReset}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = '#2563eb')
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = '#3b82f6')
                }
                onFocus={(e) =>
                  (e.currentTarget.style.backgroundColor = '#2563eb')
                }
                onBlur={(e) =>
                  (e.currentTarget.style.backgroundColor = '#3b82f6')
                }
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = '#4b5563')
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = '#6b7280')
                }
                onFocus={(e) =>
                  (e.currentTarget.style.backgroundColor = '#4b5563')
                }
                onBlur={(e) =>
                  (e.currentTarget.style.backgroundColor = '#6b7280')
                }
              >
                Reload Page
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
