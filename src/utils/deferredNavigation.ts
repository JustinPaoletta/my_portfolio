import {
  PORTFOLIO_REVEAL_TARGET_EVENT,
  type PortfolioRevealTargetDetail,
} from '@/constants/deferred-navigation';

const NAV_OFFSET_PX = 80;
const POLL_INTERVAL_MS = 120;
const MAX_WAIT_MS = 12_000;
const SETTLE_DELAY_MS = 80;
const MAX_SCROLL_RETRIES = 6;
let cancelPendingNavigation: (() => void) | undefined;

export function scrollToElement(
  element: HTMLElement,
  behavior: ScrollBehavior = 'auto'
): void {
  const offsetTop =
    element.getBoundingClientRect().top + window.scrollY - NAV_OFFSET_PX;
  window.scrollTo({ top: offsetTop, behavior });
}

export function focusSection(targetId: string): void {
  const element = document.getElementById(targetId);

  if (!(element instanceof HTMLElement)) {
    return;
  }

  if (!element.hasAttribute('tabindex')) {
    element.setAttribute('tabindex', '-1');
  }

  element.focus({ preventScroll: true });
}

function navigateToMountedTarget(
  targetId: string,
  mountedTarget: HTMLElement,
  behavior: ScrollBehavior = 'auto'
): void {
  scrollToElement(mountedTarget, behavior);
  window.history.replaceState(null, '', `#${targetId}`);
  focusSection(targetId);
}

/**
 * Reveals a deferred section by dispatching the reveal event and waiting for
 * the target element to mount, then scrolling to it.
 *
 * If the target already exists in the DOM, scrolls immediately.
 */
export function revealAndNavigate(targetId: string): void {
  cancelPendingNavigation?.();

  const existingTarget = document.getElementById(targetId);
  if (existingTarget instanceof HTMLElement) {
    navigateToMountedTarget(targetId, existingTarget);
    return;
  }

  window.dispatchEvent(
    new CustomEvent<PortfolioRevealTargetDetail>(
      PORTFOLIO_REVEAL_TARGET_EVENT,
      { detail: { targetId } }
    )
  );

  const observerRoot = document.getElementById('main') ?? document.body;
  let timerId = 0;
  let frameId = 0;
  let isCancelled = false;
  const deadline = Date.now() + MAX_WAIT_MS;

  const stopWaitingForMount = (): void => {
    mutationObserver.disconnect();
    window.clearTimeout(timerId);
  };

  const cleanup = (): void => {
    stopWaitingForMount();
    window.cancelAnimationFrame(frameId);
    document.removeEventListener('focusin', cancel);
    document.removeEventListener('pointerdown', cancel, true);
    document.removeEventListener('keydown', cancel, true);
    window.removeEventListener('wheel', cancel, true);
    if (cancelPendingNavigation === cancel) {
      cancelPendingNavigation = undefined;
    }
  };

  const cancel = (): void => {
    isCancelled = true;
    cleanup();
  };

  const completeNavigation = (mountedTarget: HTMLElement): void => {
    if (isCancelled || !mountedTarget.isConnected) {
      cancel();
      return;
    }

    cleanup();
    navigateToMountedTarget(targetId, mountedTarget);
  };

  const ensureTargetInView = (
    mountedTarget: HTMLElement,
    remainingAttempts = MAX_SCROLL_RETRIES
  ): void => {
    if (isCancelled || !mountedTarget.isConnected) {
      cancel();
      return;
    }

    scrollToElement(mountedTarget, 'auto');

    if (remainingAttempts <= 1) {
      frameId = window.requestAnimationFrame(() => {
        completeNavigation(mountedTarget);
      });
      return;
    }

    frameId = window.requestAnimationFrame(() => {
      const rect = mountedTarget.getBoundingClientRect();
      const isInViewport =
        rect.top <= window.innerHeight - NAV_OFFSET_PX &&
        rect.bottom >= NAV_OFFSET_PX;

      if (isInViewport) {
        completeNavigation(mountedTarget);
        return;
      }

      ensureTargetInView(mountedTarget, remainingAttempts - 1);
    });
  };

  const finishWhenMounted = (): boolean => {
    const mountedTarget = document.getElementById(targetId);
    if (!(mountedTarget instanceof HTMLElement)) {
      return false;
    }

    stopWaitingForMount();
    timerId = window.setTimeout(() => {
      ensureTargetInView(mountedTarget);
    }, SETTLE_DELAY_MS);
    return true;
  };

  const waitForTarget = (): void => {
    if (finishWhenMounted()) {
      return;
    }

    if (Date.now() >= deadline) {
      cancel();
      return;
    }

    timerId = window.setTimeout(() => {
      waitForTarget();
    }, POLL_INTERVAL_MS);
  };

  const mutationObserver = new MutationObserver(() => {
    finishWhenMounted();
  });

  mutationObserver.observe(observerRoot, {
    childList: true,
    subtree: true,
  });

  // Once a visitor starts another action, late-loading content must not move
  // their viewport or steal focus from a form field or a new navigation target.
  cancelPendingNavigation = cancel;
  document.addEventListener('focusin', cancel);
  document.addEventListener('pointerdown', cancel, true);
  document.addEventListener('keydown', cancel, true);
  window.addEventListener('wheel', cancel, { capture: true, passive: true });

  waitForTarget();
}
