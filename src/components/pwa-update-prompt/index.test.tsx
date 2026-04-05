import { act, fireEvent, render, screen, waitFor } from '@/test/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const pwaHookMock = vi.hoisted(() => vi.fn());
const useIsStandaloneMock = vi.hoisted(() => vi.fn());

let PWAUpdatePrompt: (typeof import('.'))['default'];

vi.mock('@/hooks/usePWA', () => ({
  usePWA: pwaHookMock,
  useIsStandalone: useIsStandaloneMock,
}));

function createServiceWorkerMock(hasController = true) {
  const listeners = new Map<string, Set<() => void>>();
  return {
    controller: hasController ? {} : null,
    ready: Promise.resolve({}),
    addEventListener: vi.fn((event: string, cb: () => void) => {
      const bucket = listeners.get(event) ?? new Set();
      bucket.add(cb);
      listeners.set(event, bucket);
    }),
    removeEventListener: vi.fn((event: string, cb: () => void) => {
      const bucket = listeners.get(event);
      bucket?.delete(cb);
    }),
    emit: (event: string) => {
      const bucket = listeners.get(event);
      bucket?.forEach((cb) => cb());
    },
  };
}

describe('PWAUpdatePrompt', () => {
  const updateServiceWorker = vi.fn().mockResolvedValue(undefined);
  const promptInstall = vi.fn().mockResolvedValue(false);
  const dismissInstall = vi.fn();
  const closePrompt = vi.fn();

  beforeEach(async () => {
    vi.restoreAllMocks();
    vi.resetModules();
    localStorage.clear();

    const sw = createServiceWorkerMock(true);
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: sw,
    });
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: true,
    });

    ({ default: PWAUpdatePrompt } = await import('.'));

    useIsStandaloneMock.mockReturnValue(false);
    pwaHookMock.mockReturnValue({
      needRefresh: false,
      offlineReady: false,
      canInstall: false,
      isInstalling: false,
      updateServiceWorker,
      promptInstall,
      dismissInstall,
      closePrompt,
    });
  });

  it('renders nothing when no prompt state is active', () => {
    const { container } = render(<PWAUpdatePrompt />);

    expect(container.firstChild).toBeNull();
  });

  it('renders install prompt and supports Not Now dismissal', () => {
    pwaHookMock.mockReturnValue({
      needRefresh: false,
      offlineReady: false,
      canInstall: true,
      isInstalling: false,
      updateServiceWorker,
      promptInstall,
      dismissInstall,
      closePrompt,
    });

    render(<PWAUpdatePrompt />);

    expect(screen.getByText('Install App')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Not Now' }));
    expect(dismissInstall).toHaveBeenCalledTimes(1);
  });

  it('renders installing label while install is in progress', () => {
    pwaHookMock.mockReturnValue({
      needRefresh: false,
      offlineReady: false,
      canInstall: true,
      isInstalling: true,
      updateServiceWorker,
      promptInstall,
      dismissInstall,
      closePrompt,
    });

    render(<PWAUpdatePrompt />);
    expect(
      screen.getByRole('button', { name: 'Installing...' })
    ).toBeDisabled();
  });

  it('shows post-install hint when installation is accepted', async () => {
    let canInstall = true;
    const acceptingPromptInstall = vi.fn(async () => {
      canInstall = false;
      return true;
    });
    pwaHookMock.mockImplementation(() => ({
      needRefresh: false,
      offlineReady: false,
      canInstall,
      isInstalling: false,
      updateServiceWorker,
      promptInstall: acceptingPromptInstall,
      dismissInstall,
      closePrompt,
    }));

    render(<PWAUpdatePrompt />);
    fireEvent.click(screen.getByRole('button', { name: 'Install' }));

    expect(acceptingPromptInstall).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByText('Finish Offline Setup')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Got It' }));
    await waitFor(() => {
      expect(
        screen.queryByText('Finish Offline Setup')
      ).not.toBeInTheDocument();
    });
  });

  it('renders update prompt and reload action', () => {
    pwaHookMock.mockReturnValue({
      needRefresh: true,
      offlineReady: false,
      canInstall: false,
      isInstalling: false,
      updateServiceWorker,
      promptInstall,
      dismissInstall,
      closePrompt,
    });

    render(<PWAUpdatePrompt />);

    fireEvent.click(screen.getByRole('button', { name: 'Reload' }));
    expect(updateServiceWorker).toHaveBeenCalledWith(true);

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(closePrompt).toHaveBeenCalledTimes(1);
  });

  it('shows offline-ready confirmation for standalone installed app and stores acknowledgment', async () => {
    useIsStandaloneMock.mockReturnValue(true);
    pwaHookMock.mockReturnValue({
      needRefresh: false,
      offlineReady: false,
      canInstall: false,
      isInstalling: false,
      updateServiceWorker,
      promptInstall,
      dismissInstall,
      closePrompt,
    });

    render(<PWAUpdatePrompt />);

    await waitFor(() => {
      expect(screen.getByText('Ready for Offline Use')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Got It' }));

    expect(localStorage.getItem('pwa-offline-ready-ack-v1')).toBe('true');
    await waitFor(() => {
      expect(
        screen.queryByText('Ready for Offline Use')
      ).not.toBeInTheDocument();
    });
  });

  it('handles localStorage setItem errors when acknowledging offline-ready state', async () => {
    useIsStandaloneMock.mockReturnValue(true);
    pwaHookMock.mockReturnValue({
      needRefresh: false,
      offlineReady: false,
      canInstall: false,
      isInstalling: false,
      updateServiceWorker,
      promptInstall,
      dismissInstall,
      closePrompt,
    });
    vi.spyOn(window.localStorage.__proto__, 'setItem').mockImplementation(
      () => {
        throw new Error('quota');
      }
    );

    render(<PWAUpdatePrompt />);

    await waitFor(() => {
      expect(screen.getByText('Ready for Offline Use')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Got It' }));
    await waitFor(() => {
      expect(
        screen.queryByText('Ready for Offline Use')
      ).not.toBeInTheDocument();
    });
  });

  it('listens to online/offline and service worker controller changes', async () => {
    const sw = createServiceWorkerMock(false);
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: sw,
    });
    useIsStandaloneMock.mockReturnValue(true);

    pwaHookMock.mockReturnValue({
      needRefresh: false,
      offlineReady: false,
      canInstall: false,
      isInstalling: false,
      updateServiceWorker,
      promptInstall,
      dismissInstall,
      closePrompt,
    });

    render(<PWAUpdatePrompt />);

    expect(screen.queryByText('Ready for Offline Use')).not.toBeInTheDocument();

    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        configurable: true,
        value: false,
      });
      fireEvent(window, new Event('offline'));
      Object.defineProperty(navigator, 'onLine', {
        configurable: true,
        value: true,
      });
      fireEvent(window, new Event('online'));
      (navigator.serviceWorker as { controller: object | null }).controller =
        {};
      sw.emit('controllerchange');
    });

    await waitFor(() => {
      expect(screen.getByText('Ready for Offline Use')).toBeInTheDocument();
    });
  });
});
