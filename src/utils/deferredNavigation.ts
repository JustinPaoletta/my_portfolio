import {
  PORTFOLIO_REVEAL_TARGET_EVENT,
  type PortfolioRevealTargetDetail,
} from '@/constants/deferred-navigation';

const NAV_OFFSET_PX = 80;
const POLL_INTERVAL_MS = 120;
const MAX_POLL_ATTEMPTS = 20;
const SETTLE_DELAY_MS = 80;
const MAX_SCROLL_RETRIES = 6;

export function scrollToElement(
  element: HTMLElement,
  behavior: ScrollBehavior = 'smooth'
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

  window.requestAnimationFrame(() => {
    element.focus({ preventScroll: true });
  });
}

function navigateToMountedTarget(
  targetId: string,
  mountedTarget: HTMLElement,
  behavior: ScrollBehavior = 'smooth'
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
  let attemptsLeft = MAX_POLL_ATTEMPTS;

  const cleanup = (): void => {
    mutationObserver.disconnect();
    window.clearTimeout(timerId);
  };

  const ensureTargetInView = (
    mountedTarget: HTMLElement,
    remainingAttempts = MAX_SCROLL_RETRIES
  ): void => {
    scrollToElement(mountedTarget, 'auto');

    if (remainingAttempts <= 1) {
      window.requestAnimationFrame(() => {
        navigateToMountedTarget(targetId, mountedTarget);
      });
      return;
    }

    window.requestAnimationFrame(() => {
      const rect = mountedTarget.getBoundingClientRect();
      const isInViewport =
        rect.top <= window.innerHeight - NAV_OFFSET_PX &&
        rect.bottom >= NAV_OFFSET_PX;

      if (isInViewport) {
        navigateToMountedTarget(targetId, mountedTarget);
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

    cleanup();
    timerId = window.setTimeout(() => {
      ensureTargetInView(mountedTarget);
    }, SETTLE_DELAY_MS);
    return true;
  };

  const waitForTarget = (): void => {
    if (finishWhenMounted()) {
      return;
    }

    if (attemptsLeft <= 0) {
      cleanup();
      return;
    }

    attemptsLeft -= 1;
    timerId = window.setTimeout(() => {
      waitForTarget();
    }, POLL_INTERVAL_MS);
  };

  const mutationObserver = new MutationObserver(() => {
    if (finishWhenMounted()) {
      return;
    }

    window.clearTimeout(timerId);
    timerId = window.setTimeout(() => {
      waitForTarget();
    }, POLL_INTERVAL_MS);
  });

  mutationObserver.observe(observerRoot, {
    childList: true,
    subtree: true,
  });

  waitForTarget();
}
