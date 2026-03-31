# Landscape Mode: Blank Sections Root Cause, Resolution, and Verification

## Resolution Status

This issue is now resolved in the app code.

The shipped fix keeps the root-cause removal from this plan, adds hardening for
short viewports and orientation changes, and preserves deferred loading without
eager-mounting data-heavy sections on first paint.

### Landed changes

1. Removed the sequential deferred-section cascade gate in `src/App.tsx`, so
   every deferred sentinel now exists in the DOM immediately.
2. Strengthened the manual fallback in `src/components/DeferredSection.tsx` by
   widening the near-page-end window from `1x` to `2x` viewport height.
3. Relaxed reveal animation observer settings in `src/components/Reveal.tsx`
   so short viewports no longer leave mounted sections visually transparent for
   too long.
4. Added explicit `orientationchange` observer reconnection in
   `src/hooks/useIntersectionObserver.ts`.
5. Added a `hasUserScrolled` guard in `src/components/DeferredSection.tsx` so
   removing the cascade does not cause GitHub, Contact, and Pet Dogs to mount
   immediately on initial load in Firefox/WebKit.

### Important note about Fix 3

The original plan proposed scaling deferred `rootMargin` to at least the
viewport height. That approach was tested, but with all deferred sentinels in
the DOM it materially increased eager mounting because the sentinels only start
24px apart before sections expand. In practice, the root cause was already
eliminated by Fix 1, and the issue was fully stabilized by Fixes 2, 4, and the
additional `hasUserScrolled` guard above.

For that reason, the final implementation intentionally keeps the deferred
lookahead at a fixed `400px` default instead of switching to a viewport-sized
margin.

## Original Problem Statement

When scrolling the portfolio in **portrait mode**, all sections render correctly. In **landscape mode** (or any short-viewport scenario), some sections remain blank and never appear regardless of scrolling.

---

## Root Cause Analysis

The blank sections are caused by a **stalled deferred-section cascade** — a chain reaction of three interacting mechanisms that breaks down specifically in short viewports.

### How sections rendered before the fix

The portfolio uses a two-tier lazy loading strategy:

1. **Idle-activated sections** (`About`, `Projects`) — mount after the browser reaches an idle state. These always render.
2. **Deferred sections** (`Articles`, `Experience`, `Skills`, `GitHub`, `Contact`, `Pet Dogs`) — only mount when a 24px sentinel div scrolls within `400px` of the viewport, detected by `IntersectionObserver`.

Before the fix, deferred sections were **sequentially gated** in `App.tsx`:

```tsx
const canRenderDeferredBoundary = SECTION_MANIFEST.slice(0, index).every(
  (previousSection) =>
    previousSection.activation === 'idle' ||
    revealedDeferredSectionIdSet.has(previousSection.id) ||
    forcedDeferredSectionIdSet.has(previousSection.id)
);

if (!canRenderDeferredBoundary) {
  return null; // sentinel not even created
}
```

A deferred section's sentinel **is not placed into the DOM at all** until every prior deferred section has been revealed. This creates a strict domino chain: if section N never fires, sections N+1 through N+K don't even exist in the document.

### Why landscape breaks the chain

| Factor                                                | Portrait (tall viewport) | Landscape (short viewport) |
| ----------------------------------------------------- | ------------------------ | -------------------------- |
| `window.innerHeight`                                  | ~800–900px               | ~350–500px                 |
| Lookahead (`viewport + rootMargin`)                   | ~1200–1300px             | ~750–900px                 |
| Hero `min-height`                                     | 100dvh ≈ 800px           | 100dvh ≈ 400px             |
| Content below fold before any deferred section mounts | Minimal                  | Minimal                    |

Here's what happens step by step in landscape:

1. **Hero renders** at `100dvh` ≈ 400px. The idle sections (`About`, `Projects`) mount shortly after.
2. `About` and `Projects` together may occupy **1000–2000px** of height.
3. The first deferred sentinel (`Articles`) sits right after `Projects`. With a total page height of ~1400–2400px and a viewport of ~400px, the sentinel is within the `400px` rootMargin — **Articles mounts successfully**.
4. When `Articles` renders, it inserts its content (several hundred pixels) into the DOM. This **pushes every subsequent sentinel down** by the same amount.
5. Now `Experience`'s sentinel (which was at the old page bottom) is suddenly **further from the viewport** than the rootMargin allows. The IntersectionObserver doesn't see it.
6. Because `Experience` never reveals, `Skills` never gets a sentinel, `GitHub` never gets a sentinel, etc. **The cascade stalls.**

### The manual fallback almost works but doesn't

`DeferredSection.tsx` has a scroll-based fallback (`checkVisibility`, lines 44–68) that fires on scroll, resize, and orientation change. It includes a `nearPageEnd` heuristic:

```tsx
const distFromBottom =
  scrollEl.scrollHeight - (scrollEl.scrollTop + viewportHeight);
const nearPageEnd = scrolledPastFold && distFromBottom < viewportHeight;
```

This heuristic is supposed to catch stalled sentinels when the user scrolls to the bottom. However it fails because:

1. **Each reveal grows `scrollHeight`**: When section N mounts, it adds height, so `distFromBottom` increases again. The user is no longer "near the page end" even though they haven't scrolled.
2. **The threshold is too tight**: `distFromBottom < viewportHeight` with a ~400px viewport means you have to be within 400px of the bottom. After a section reveals and adds 500+ pixels of content, you're immediately pushed outside this window.
3. **The sentinel for the _next_ section doesn't exist yet**: The cascade gate in `App.tsx` prevents the sentinel from being in the DOM, so `checkVisibility` runs but has no sentinel element to check (`sentinelRef.current` is null for the component that was never mounted).

### Secondary contributing factor: Reveal animations

Each section uses `useRevealInView` (with `rootMargin: '-100px 0px -50px 0px'` and `threshold: 0.1`) to control opacity/transform animations. Even if a section _does_ mount, if its container hasn't entered the stricter reveal viewport zone, it stays at `opacity: 0`. In a short viewport, the negative rootMargin (-100px top, -50px bottom) effectively shrinks the trigger zone to just ~250px of actual viewport, making sections that barely enter the viewport appear blank until scrolled further into view. This is a cosmetic issue separate from the mounting problem, but it compounds the perception of "blank sections."

---

## Fix Plan

### Fix 1: Remove the sequential cascade gate (Critical)

**File:** `src/App.tsx` (lines 159–167)

**Problem:** The `canRenderDeferredBoundary` check prevents later sentinels from existing in the DOM until all prior deferred sections have revealed.

**Solution:** Always render every `DeferredSection` wrapper (and its sentinel). Remove the sequential dependency entirely. Each section should independently decide when to reveal based on its own intersection with the viewport.

```tsx
// BEFORE (sequential gate)
const canRenderDeferredBoundary = SECTION_MANIFEST.slice(0, index).every(
  (previousSection) =>
    previousSection.activation === 'idle' ||
    revealedDeferredSectionIdSet.has(previousSection.id) ||
    forcedDeferredSectionIdSet.has(previousSection.id)
);
if (!canRenderDeferredBoundary) {
  return null;
}

// AFTER (always render the boundary)
// Remove the canRenderDeferredBoundary check and the early return.
// Every DeferredSection always renders its sentinel and independently
// decides when to mount its content based on viewport proximity.
```

With this change, all six deferred sentinels exist in the DOM from the start. They stack vertically (6 × 24px = 144px) and each one independently triggers when scrolled into range. The domino problem disappears because there is no domino chain.

**Impact:** The `revealedDeferredSectionIds` state, `forcedDeferredSectionIds` state, the `handleDeferredSectionReveal` callback, and the `PORTFOLIO_REVEAL_TARGET_EVENT` listener can all be simplified or removed since they only existed to manage the cascade. However, the `forceVisible` / reveal-target mechanism is still useful for hash-based navigation (jumping to `#contact`), so keep `forcedDeferredSectionIds` for that purpose.

**Risk:** Slightly more sentinels in the initial DOM (negligible — 6 empty 24px divs). No functional regression since sections still lazy-load when scrolled near.

### Fix 2: Improve the `nearPageEnd` fallback in DeferredSection (Important)

**File:** `src/components/DeferredSection.tsx` (lines 52–63)

Even with Fix 1, the `checkVisibility` fallback should handle edge cases more robustly.

**Problem:** The `nearPageEnd` heuristic uses `distFromBottom < viewportHeight`, which is too conservative for short viewports where each new section render dramatically changes the scroll geometry.

**Solution:** Use a more generous threshold and/or trigger based on sentinel proximity to the current scroll position, not just page end.

```tsx
// BEFORE
const nearPageEnd = scrolledPastFold && distFromBottom < viewportHeight;

// AFTER — use a multiplier so short viewports get proportionally more lookahead
const nearPageEnd = scrolledPastFold && distFromBottom < viewportHeight * 2;
```

Alternatively, replace the `nearPageEnd` heuristic entirely with a direct distance check:

```tsx
const sentinelDistFromScroll = rect.top - viewportHeight;
const isNearViewport = sentinelDistFromScroll < leadMargin * 1.5;
```

This makes the fallback independent of total page height and resilient to content shifts.

### Fix 3: Scale rootMargin relative to viewport height (Recommended)

**File:** `src/config/section-manifest.ts`

**Problem:** Every deferred section uses a fixed `rootMargin: '400px 0px'`. On a 400px landscape viewport, this only provides ~1× viewport of lookahead. On an 800px portrait viewport, it provides ~1.5× viewport. The effective lookahead ratio is inconsistent.

**Solution:** Move rootMargin into `DeferredSection` and compute it dynamically, or increase the static value. Since IntersectionObserver rootMargin doesn't support dynamic values natively, the simplest approach is to increase the static rootMargin to a value that works for short viewports:

```tsx
// Option A: Larger fixed rootMargin (simplest)
rootMargin: '800px 0px';

// Option B: Dynamic rootMargin computed at mount time
const computedRootMargin = `${Math.max(400, window.innerHeight)}px 0px`;
```

Option B guarantees at least 1× viewport of lookahead in every orientation.

### Fix 4: Relax reveal animation rootMargin for short viewports (Cosmetic)

**File:** `src/components/Reveal.tsx` (line 29)

**Problem:** The default `rootMargin: '-100px 0px -50px 0px'` subtracts 150px from the effective trigger zone. In a 400px landscape viewport, the trigger zone shrinks to just ~250px, meaning sections that are already in view may still show as blank (opacity: 0) until scrolled further.

**Solution:** Use a responsive rootMargin or reduce the negative insets:

```tsx
// Option A: Smaller negative margins that work for all viewports
const DEFAULT_REVEAL_OPTIONS: UseRevealOptions = {
  rootMargin: '-40px 0px -20px 0px',
  threshold: 0.05,
  triggerOnce: true,
};

// Option B: Compute based on viewport (at hook call time)
const getRevealRootMargin = (): string => {
  const vh = window.innerHeight;
  const topInset = Math.min(100, vh * 0.12);
  const bottomInset = Math.min(50, vh * 0.06);
  return `-${topInset}px 0px -${bottomInset}px 0px`;
};
```

### Fix 5: Re-evaluate after orientation changes (Defensive)

**File:** `src/hooks/useIntersectionObserver.ts`

The hook already reconnects the observer on resize (lines 54–67), which captures orientation changes since they trigger a resize event. However, the 150ms debounce may be too long — an `orientationchange` event on some mobile browsers fires _before_ the viewport has finished resizing, causing the reconnected observer to use stale dimensions.

**Solution:** Add an explicit `orientationchange` listener with a slightly longer debounce to ensure the viewport has settled:

```tsx
const handleOrientation = (): void => {
  if (resizeTimer !== undefined) clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    resizeTimer = undefined;
    activeObserver.disconnect();
    activeObserver = new IntersectionObserver(
      handleIntersection,
      observerOptions
    );
    activeObserver.observe(element);
  }, 300); // longer debounce for orientation changes
};

window.addEventListener('orientationchange', handleOrientation);
```

`DeferredSection.tsx` already listens for `orientationchange` on its manual fallback — this fix ensures the IntersectionObserver path also handles it gracefully.

---

## Implementation Priority

| Priority | Fix                                   | Effort | Impact                                    |
| -------- | ------------------------------------- | ------ | ----------------------------------------- |
| **P0**   | Fix 1: Remove sequential cascade gate | Small  | Eliminates the root cause entirely        |
| **P1**   | Fix 2: Improve `nearPageEnd` fallback | Small  | Prevents stalling in edge cases           |
| **P2**   | Fix 3: Scale rootMargin to viewport   | Small  | Ensures consistent lookahead ratio        |
| **P3**   | Fix 4: Relax reveal animation margins | Small  | Prevents visible-but-transparent sections |
| **P4**   | Fix 5: Orientation change debounce    | Small  | Defensive improvement for mobile          |

### Recommended approach

Implement **Fix 1 first** — it eliminates the cascade dependency that is the fundamental cause. Then apply Fixes 2–4 as hardening. Fix 5 is optional but cheap.

---

## Testing Checklist

Verification completed against the implemented fix set:

- [x] Portrait mode (mobile): all sections render when scrolling
- [x] Landscape mode (mobile): all sections render when scrolling
- [x] Landscape mode (tablet / rotated mobile viewport): all sections render
- [x] Desktop widescreen (short browser window ~400px height): all sections render
- [x] Hash navigation (`#contact`) still works and scrolls to the target section in a short viewport
- [x] Reveal animations still trigger at appropriate scroll positions
- [x] Deferred GitHub and Pet Dogs requests still wait until their sections mount
- [x] No deferred-section cascade stall remains after orientation changes
- [x] No accessibility regression on the skip link after the supporting style fix
