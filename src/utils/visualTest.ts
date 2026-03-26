export function isVisualTestMode(): boolean {
  if (typeof document !== 'undefined') {
    return document.documentElement.dataset.visualTest === 'true';
  }

  if (typeof window !== 'undefined') {
    return (
      new URLSearchParams(window.location.search).get('visual-test') === '1'
    );
  }

  return false;
}
