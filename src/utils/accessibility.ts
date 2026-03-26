type FocusableElement = HTMLElement & {
  disabled?: boolean;
};

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

function isVisible(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);

  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    !element.hasAttribute('hidden')
  );
}

export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<FocusableElement>(FOCUSABLE_SELECTOR)
  ).filter((element) => {
    if (!isVisible(element)) {
      return false;
    }

    if (typeof element.disabled === 'boolean' && element.disabled) {
      return false;
    }

    return !element.closest('[aria-hidden="true"]');
  });
}

export function trapFocusWithin(
  event: KeyboardEvent,
  container: HTMLElement
): void {
  if (event.key !== 'Tab') {
    return;
  }

  const focusableElements = getFocusableElements(container);

  if (focusableElements.length === 0) {
    event.preventDefault();
    container.focus();
    return;
  }

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  const activeElement = document.activeElement;

  if (event.shiftKey && activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
    return;
  }

  if (!event.shiftKey && activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
}

type InertSnapshot = {
  element: HTMLElement;
  ariaHidden: string | null;
  inert: boolean;
};

export function temporarilyInertElements(
  elements: Array<HTMLElement | null>
): () => void {
  const snapshots: InertSnapshot[] = [];

  elements.forEach((element) => {
    if (!element) {
      return;
    }

    snapshots.push({
      element,
      ariaHidden: element.getAttribute('aria-hidden'),
      inert: element.inert,
    });

    element.inert = true;
    element.setAttribute('aria-hidden', 'true');
  });

  return () => {
    snapshots.forEach(({ element, ariaHidden, inert }) => {
      element.inert = inert;
      if (ariaHidden === null) {
        element.removeAttribute('aria-hidden');
        return;
      }
      element.setAttribute('aria-hidden', ariaHidden);
    });
  };
}
