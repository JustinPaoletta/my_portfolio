import { Component, type ErrorInfo, type ReactNode } from 'react';

type NewRelicModule = typeof import('@/utils/newrelic');

let newRelicModule: NewRelicModule | undefined;
let newRelicPromise: Promise<NewRelicModule | undefined> | undefined;

const loadNewRelic: () => Promise<NewRelicModule | undefined> =
  __ENABLE_ERROR_MONITORING__
    ? () => {
        if (newRelicModule) {
          return Promise.resolve(newRelicModule);
        }

        if (!newRelicPromise) {
          newRelicPromise = import('@/utils/newrelic')
            .then((mod) => {
              newRelicModule = mod;
              return mod;
            })
            .catch((error) => {
              if (import.meta.env.DEV) {
                console.error('[New Relic] Failed to load module', error);
              }
              newRelicPromise = undefined;
              return undefined;
            });
        }

        return newRelicPromise;
      }
    : () => Promise.resolve(undefined);

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
    // update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // only log errors in development mode to avoid console errors in lighthouse
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
      console.error('Error:', error);
      console.error('Component Stack:', errorInfo.componentStack);
    }

    // report error to new relic with component stack (always report for monitoring)
    if (__ENABLE_ERROR_MONITORING__) {
      void loadNewRelic().then((mod) => {
        mod?.reportError(error, {
          errorBoundary: true,
          componentStack: errorInfo.componentStack || 'unknown',
          source: 'React ErrorBoundary',
        });
      });
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // default fallback UI
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
            backgroundColor: '#1a1918',
            color: '#fdfbf7',
          }}
          role="alert"
          aria-live="assertive"
        >
          <div
            style={{
              maxWidth: '32rem',
              textAlign: 'center',
              backgroundColor: 'rgba(253, 251, 247, 0.03)',
              padding: '3rem 2rem',
              borderRadius: '4px',
              border: '1px solid rgba(253, 251, 247, 0.1)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
            }}
          >
            <h1
              style={{
                fontFamily: "'Fraunces', serif",
                fontSize: '2rem',
                fontWeight: '700',
                color: '#c46647',
                marginBottom: '1rem',
              }}
            >
              Something went wrong
            </h1>
            <p
              style={{
                color: 'rgba(253, 251, 247, 0.7)',
                marginBottom: '2rem',
                lineHeight: '1.6',
              }}
            >
              We're sorry, but something unexpected happened. Please try again.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <details
                style={{
                  marginBottom: '2rem',
                  textAlign: 'left',
                  backgroundColor: 'rgba(196, 102, 71, 0.05)',
                  padding: '1rem',
                  borderRadius: '4px',
                  border: '1px solid rgba(196, 102, 71, 0.2)',
                }}
              >
                <summary
                  style={{
                    cursor: 'pointer',
                    fontWeight: '600',
                    color: '#c46647',
                    marginBottom: '0.5rem',
                  }}
                >
                  Error Details (Development Only)
                </summary>
                <pre
                  style={{
                    fontSize: '0.875rem',
                    color: 'rgba(253, 251, 247, 0.8)',
                    overflow: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontFamily:
                      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
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
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#8b7355',
                  color: '#fdfbf7',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = '#63523d')
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = '#8b7355')
                }
                onFocus={(e) =>
                  (e.currentTarget.style.backgroundColor = '#63523d')
                }
                onBlur={(e) =>
                  (e.currentTarget.style.backgroundColor = '#8b7355')
                }
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'transparent',
                  color: '#fdfbf7',
                  border: '1px solid rgba(253, 251, 247, 0.1)',
                  borderRadius: '4px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor =
                    'rgba(253, 251, 247, 0.05)';
                  e.currentTarget.style.borderColor = '#8b7355';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor =
                    'rgba(253, 251, 247, 0.1)';
                }}
                onFocus={(e) => {
                  e.currentTarget.style.backgroundColor =
                    'rgba(253, 251, 247, 0.05)';
                  e.currentTarget.style.borderColor = '#8b7355';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor =
                    'rgba(253, 251, 247, 0.1)';
                }}
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
