# Accessibility Crash Course & Manual Test Guide

This document is two things at once:

1. **A crash course** in how accessibility works on this portfolio — the concepts, standards, and code patterns behind each feature.
2. **A step-by-step manual test script** you can follow one test at a time to verify the real user experience.

Use it after major UI, theme, or interaction changes. Automated checks catch regressions early; this guide catches what machines still miss (focus feel, screen reader phrasing, zoom reflow).

---

## Table of Contents

1. [What accessibility means here](#1-what-accessibility-means-here)
2. [Core concepts (the vocabulary)](#2-core-concepts-the-vocabulary)
3. [How this site is built for accessibility](#3-how-this-site-is-built-for-accessibility)
4. [Test environment setup](#4-test-environment-setup)
5. [Pass / fail rules](#5-pass--fail-rules)
6. [Test 1 — Keyboard-only baseline](#test-1--keyboard-only-baseline)
7. [Test 2 — Theme switcher](#test-2--theme-switcher)
8. [Test 3 — Skills tabs & Articles carousel](#test-3--skills-tabs--articles-carousel)
9. [Test 4 — Contact form](#test-4--contact-form)
10. [Test 5 — CLI theme](#test-5--cli-theme)
11. [Test 6 — Screen reader pass](#test-6--screen-reader-pass)
12. [Test 7 — Reduced motion](#test-7--reduced-motion)
13. [Test 8 — Zoom and reflow](#test-8--zoom-and-reflow)
14. [Test 9 — Focus visibility sweep](#test-9--focus-visibility-sweep)
15. [Automated gates (run before manual sign-off)](#automated-gates-run-before-manual-sign-off)
16. [Defect template & sign-off](#defect-template--sign-off)

---

## 1. What accessibility means here

### The goal

This portfolio targets **WCAG 2.2 Level AA**. In practice that means:

| Pillar             | What users need                        | Example on this site                                          |
| ------------------ | -------------------------------------- | ------------------------------------------------------------- |
| **Perceivable**    | Content can be seen, heard, or adapted | Readable text in all 4 themes × 2 modes; alt text on images   |
| **Operable**       | Everything works without a mouse       | Skip link, keyboard dialogs, tab keyboard model               |
| **Understandable** | UI behavior is predictable             | Form errors tied to fields; dialogs close with Escape         |
| **Robust**         | Assistive tech gets correct semantics  | `role="dialog"`, `role="tablist"`, native `<button>` elements |

### Who you are testing for

- **Keyboard-only users** — motor disabilities, power users, broken trackpads
- **Screen reader users** — blind or low-vision users (VoiceOver, NVDA, JAWS)
- **Low-vision users** — high zoom, high contrast needs
- **Vestibular / motion-sensitive users** — `prefers-reduced-motion`
- **Cognitive users** — clear labels, consistent patterns, no surprise focus jumps

### The accessibility contract

See [`docs/ACCESSIBILITY.md`](./ACCESSIBILITY.md) for the project contract. The manual tests below verify the **runtime behavior** that contract promises.

---

## 2. Core concepts (the vocabulary)

Read this section once before testing. Each test later references these ideas.

### 2.1 Semantic HTML first, ARIA second

The [React accessibility docs](https://react.dev/learn/accessibility) and the [ARIA Authoring Practices Guide (APG)](https://www.w3.org/WAI/ARIA/apg/) agree: **use the right HTML element before adding ARIA**.

| Need             | ✅ Do this                                         | ❌ Avoid this                       |
| ---------------- | -------------------------------------------------- | ----------------------------------- |
| Clickable action | `<button type="button">`                           | `<div onClick>`                     |
| Navigation       | `<a href="#section">`                              | `<span role="link">`                |
| Text field       | `<input>` + `<label htmlFor>`                      | placeholder-only inputs             |
| Grouped choices  | `<fieldset>` + `<legend>` + `<input type="radio">` | custom div "radio" unless necessary |

ARIA fills gaps when native semantics are insufficient (tabs, modal dialogs). It does **not** fix bad HTML.

### 2.2 Focus and focus order

**Focus** is which element receives keyboard input. Users move focus with `Tab` / `Shift+Tab` and activate with `Enter` / `Space`.

Key rules:

- **Visible focus indicator** — users must see where they are (`:focus-visible` in CSS).
- **Logical tab order** — follows visual reading order; no positive `tabindex` hacks.
- **Roving tabindex** — in tab lists and radio groups, only the active item stays in tab order (`tabindex="0"`); siblings use `tabindex="-1"`. Arrow keys move between items (APG Tabs pattern).
- **Programmatic focus** — after navigation or validation, code moves focus intentionally (e.g. to `#main` or the first invalid field).

### 2.3 Skip navigation

A **skip link** is the first focusable control on the page. It lets keyboard users bypass repeated chrome (nav, hero) and jump to main content. The link must be **visible when focused** and must move **real focus** — not just scroll.

### 2.4 Modal dialogs

Per the [APG Dialog (Modal) pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/):

- Container has `role="dialog"` and `aria-modal="true"`
- Has an accessible name (`aria-label` or `aria-labelledby`)
- **Focus moves inside** when opened
- **Tab cycles** within the dialog (focus trap)
- **Escape closes** the dialog
- **Focus returns** to the element that opened it
- **Background is inert** — page content behind the dialog must not be focusable

This site uses `trapFocusWithin()` and `temporarilyInertElements()` in `src/utils/accessibility.ts` for that behavior.

### 2.5 Tabs

Per the [APG Tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/):

- `role="tablist"` wraps tab buttons
- Each tab: `role="tab"`, `aria-selected`, `aria-controls` → panel id
- Each panel: `role="tabpanel"`, `aria-labelledby` → tab id
- **All tabpanels referenced by `aria-controls` must exist in the DOM** — inactive panels stay mounted and use the `hidden` attribute (Skills and Articles carousel)
- **Arrow keys** move between tabs; **Home** / **End** jump to first / last (Skills implements the full APG keyboard model)
- Only the selected tab has `tabindex="0"`; others use `tabindex="-1"`

**Two implementations on this site:**

| Location              | Tab controls                                | Keyboard model                                                                                              |
| --------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Skills**            | Category labels (Frontend, Backend, …)      | Arrow keys, Home, End + roving `tabIndex`                                                                   |
| **Articles carousel** | Dot buttons (`aria-label="Select article"`) | Click / Tab + Enter or Space; separate **Previous article** / **Next article** buttons for slide navigation |

### 2.6 Carousels

The Articles section combines [APG Carousel guidance](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/) with tab semantics for dot controls:

- Viewport: `role="region"`, `aria-roledescription="carousel"`, `aria-label="Article slides"`
- Prev/next: native `<button>` elements with descriptive `aria-label`s; disabled at first/last slide
- Status: live counter (`aria-live="polite"`) — e.g. "Article 1 of 2"
- Dot tabs: see §2.5; each tab's `aria-controls` must point at a persistent `#article-slide-*` panel

### 2.7 Forms and validation

Per APG and React form guidance:

- Every input has a **visible `<label>`** linked with `htmlFor` / `id`
- Invalid fields use `aria-invalid="true"`
- Error text is linked with `aria-describedby` pointing at the error element id
- On submit failure, **focus moves to the first invalid field**
- **Success** → `role="status"` + `aria-live="polite"` (announced without interrupting)
- **Blocking errors** → `role="alert"` (interrupts to announce)

### 2.8 Live regions

Dynamic content (terminal log, form status, carousel counter) uses ARIA live regions:

- `role="log"` + `aria-live="polite"` — CLI history (updates announced when idle)
- `role="status"` + `aria-live="polite"` — contact form success; Articles carousel counter (`Article 1 of 2`)
- `role="alert"` — contact form submission failure

### 2.9 Color, contrast, and motion

- **WCAG AA** requires ~4.5:1 contrast for normal text; focus indicators need 3:1 against adjacent colors.
- **Never rely on color alone** — errors use text; active nav uses `aria-current="location"` plus visual styling.
- **`prefers-reduced-motion`** — cosmic hero swaps animated 3D/video for a still image; global CSS short-circuits animations.

### 2.10 Landmarks and headings

Screen readers navigate by **landmarks** and **headings**:

- One `<main id="main">` landmark
- `<nav aria-label="...">` for navigation regions
- `<header>` / `<footer role="contentinfo">` where appropriate
- Heading levels don't skip (`h1` → `h2` → `h3`)

---

## 3. How this site is built for accessibility

Quick map from concept → implementation. Use this while testing to know _what_ you are verifying.

| Feature              | Primary files                                                        | Mechanism                                                                                               |
| -------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Skip link            | `src/App.tsx`, `src/App.css`                                         | `<a href="#main">` + `main.focus()` on click; slides into view on `:focus`                              |
| Desktop / mobile nav | `src/components/Navigation/index.tsx`                                | Real `<a>` links; `aria-current="location"`; `revealAndNavigate()` for deferred sections                |
| Mobile menu dialog   | `Navigation/index.tsx`, `src/utils/accessibility.ts`                 | `role="dialog"`, focus trap, `inert` + `aria-hidden` on background, scroll lock                         |
| Theme switcher       | `src/components/ThemeSwitcher/index.tsx`                             | Modal dialog; native radio inputs in `<fieldset>`; same focus trap utilities                            |
| Skills tabs          | `src/components/sections/Skills/index.tsx`                           | APG manual tabs: roving tabindex, arrow/Home/End keys                                                   |
| Articles carousel    | `src/components/sections/Articles/index.tsx`                         | Carousel region + prev/next buttons; dot tablist with persistent `hidden` tabpanels; live slide counter |
| Contact form         | `src/components/sections/Contact/index.tsx`, `src/shared/contact.ts` | Labels, `aria-invalid`, `aria-describedby`, `focusFirstFieldError()`                                    |
| CLI terminal         | `src/components/sections/Hero/CliTerminal.tsx`                       | `aria-pressed` options, `role="log"`, `aria-describedby` on input                                       |
| Reduced motion hero  | `src/components/sections/Hero/index.tsx`, `CosmicHeroBackground.tsx` | `matchMedia('(prefers-reduced-motion: reduce)')` → still image                                          |
| Section focus on nav | `src/utils/deferredNavigation.ts`                                    | `focusSection()` sets `tabindex="-1"` and focuses section                                               |
| Focus utilities      | `src/utils/accessibility.ts`                                         | `getFocusableElements`, `trapFocusWithin`, `temporarilyInertElements`                                   |

---

## 4. Test environment setup

### Start the app

Use the **production preview** first — it runs the real build, contrast gate output, and prerender path.

```bash
cd /path/to/my_portfolio
npm install
npm run start:prod
```

Open: **http://localhost:4173/**

For fast iteration during fixes:

```bash
npm run start:dev
```

### Recommended manual matrix

| Setup                                    | Purpose                             |
| ---------------------------------------- | ----------------------------------- |
| **Chrome, keyboard only**                | Baseline operability (Tests 1–5, 9) |
| **Safari + VoiceOver**                   | Screen reader semantics (Test 6)    |
| **Chrome + reduced motion**              | Motion fallback (Test 7)            |
| **Chrome or Safari at 200% zoom**        | Reflow (Test 8)                     |
| **Windows + NVDA + Chrome** _(optional)_ | Second screen reader perspective    |

### VoiceOver quick reference (macOS)

| Action                                  | Shortcut                        |
| --------------------------------------- | ------------------------------- |
| Turn VoiceOver on/off                   | `Cmd + F5`                      |
| Read current item                       | `VO + A` (Control + Option + A) |
| Next / previous item                    | `VO + →` / `VO + ←`             |
| Open rotor (landmarks, headings, links) | `VO + U`                        |
| Interact with element                   | `VO + Shift + ↓`                |

Replace `VO` with **Control + Option**.

### How to use this guide

1. Run [automated gates](#automated-gates-run-before-manual-sign-off) first.
2. Work through tests **in order** — later tests assume earlier ones passed.
3. Record pass/fail per subsection.
4. Log failures with the [defect template](#defect-template--sign-off).

---

## 5. Pass / fail rules

Mark a test **failed** if any of these occur:

- Focus disappears or is hard to see
- Keyboard users get trapped or cannot reach or close UI
- Screen reader announces the wrong role, name, or state
- Content becomes clipped, overlapped, or unusable at zoom
- Validation or status changes are visible but not announced
- Dark mode or alternate themes break contrast or focus visibility

---

## Test 1 — Keyboard-only baseline

> **Lesson:** Keyboard accessibility is the foundation. If a control works with a mouse but not `Tab` + `Enter`, it is not accessible.

> **This site:** The shell is built from semantic links and buttons. Skip navigation moves real focus to `<main tabIndex={-1}>`. Mobile nav is a proper modal dialog.

**Prerequisite:** Load `http://localhost:4173/`. **Do not use the mouse** for this entire test.

---

### 1a. Skip link

**Why it matters:** Without a skip link, keyboard users must tab through the entire nav on every page load.

**How it works here:** `App.tsx` renders the link; clicking it scrolls to `#main` and calls `main.focus({ preventScroll: true })`. CSS in `App.css` hides the link off-screen until `:focus`.

#### Steps

1. Reload the page (hard refresh).
2. Press **`Tab`** once.
3. Confirm **"Skip to main content"** slides into view at the top-left.
4. Press **`Enter`**.

#### Pass if

- [ ] Focus lands on the `<main>` content area (you can verify in DevTools: `document.activeElement` is `<main id="main">`)
- [ ] Focus does not remain on the skip link
- [ ] A visible focus ring/outline remains on main

#### Fail examples

- Link never appears on Tab
- Page scrolls but focus stays on skip link or nav
- No visible focus indicator on main

---

### 1b. Desktop navigation

**Why it matters:** In-page nav must be real links so browsers and assistive tech expose them in the links list and activate them with Enter.

**How it works here:** `Navigation` uses `<a href="#about">` etc. with `aria-current="location"` on the active section. Clicks call `revealAndNavigate()` for deferred sections, then `focusSection()` moves focus to the target.

#### Steps

1. Widen the viewport past **980px** (desktop nav visible, no hamburger).
2. **`Tab`** through nav links: About, Projects, Articles, Experience, Skills, GitHub, Contact.
3. On each link, press **`Enter`** and observe scroll position.
4. Return to top and repeat for at least **About**, **Projects**, **Articles**, **Skills**, **Contact**.

#### Pass if

- [ ] Each item is a normal link (browser status bar shows `#section` href on focus)
- [ ] Each link scrolls to the correct section
- [ ] You clearly land at the target (section receives focus or is at top of viewport below nav)
- [ ] Active section link has a visible active state
- [ ] Focus ring visible on every nav link

#### Fail examples

- Link does nothing (deferred section never reveals)
- Focus lost after navigation
- Active state missing or only indicated by color

---

### 1c. Mobile menu drawer

**Why it matters:** Off-canvas menus are a common keyboard trap. APG requires modal behavior: trap, Escape, restore focus, inert background.

**How it works here:** Below 980px, a hamburger opens a `role="dialog"` drawer. `trapFocusWithin()` wraps Tab; `temporarilyInertElements()` marks main/footer/theme switcher inert; Escape closes and focus returns to the hamburger.

#### Steps

1. Narrow viewport to mobile width (≤ 980px) — Chrome DevTools device mode is fine.
2. **`Tab`** to the hamburger button (`aria-label="Open menu"`).
3. Press **`Enter`** to open.
4. **`Tab`** forward through every item in the drawer.
5. **`Shift+Tab`** backward through items.
6. Press **`Escape`**.

#### Pass if

- [ ] Drawer opens; focus moves inside (close button or first link focused)
- [ ] Tab cycles within drawer only — you never reach main content behind it
- [ ] Shift+Tab cycles backward within drawer
- [ ] **Escape** closes the drawer
- [ ] Focus returns to the hamburger / "Open menu" button
- [ ] Background content is not focusable while open

#### Fail examples

- Focus lands on page content behind overlay
- Tab escapes to theme switcher or skip link
- Escape does nothing; focus lost after close

---

**Test 1 complete?** ✅ Proceed to Test 2.

---

## Test 2 — Theme switcher

> **Lesson:** Custom pickers must behave like familiar controls. Radio groups in dialogs are an APG standard pattern.

> **This site:** Theme switcher is a floating modal with native `<input type="radio">` inside `<fieldset>` elements — not fake clickable divs.

---

### 2a. Dialog behavior

#### Steps

1. Return to desktop width.
2. **`Tab`** to the floating **Theme** button (bottom-right, `aria-label="Toggle theme switcher"`).
3. Press **`Enter`** or **`Space`** to open.
4. **`Tab`** through color mode options (Light / Dark / System) and theme options (Engineer, Cosmic, etc.).
5. Press **`Escape`**.

#### Pass if

- [ ] Dialog opens; focus moves inside
- [ ] First focused control is the **currently selected radio** (usually the checked color mode)
- [ ] Arrow keys are not required here — Tab moves between radios like a normal form
- [ ] Space selects radios; selection updates theme/mode visually
- [ ] **Escape** closes dialog
- [ ] Focus returns to the Theme toggle button
- [ ] While open, you cannot Tab to nav links or main content (background inert)

#### Fail examples

- Focus stays on toggle button after open
- Can Tab to page behind dialog
- Escape closes but focus vanishes

---

### 2b. Theme matrix

**Why it matters:** Accessibility is not one theme — every theme × mode combination must keep readable text and visible focus.

**How it works here:** Theme tokens are validated by `npm run contrast:check`. Lighthouse enforces accessibility score 1.00 per combination.

#### Steps

Visit each URL. At each stop, Tab across a few controls (nav link, theme button, a form field if visible) and scan readability.

| #   | URL                                                |
| --- | -------------------------------------------------- |
| 1   | `http://localhost:4173/?theme=engineer&mode=light` |
| 2   | `http://localhost:4173/?theme=engineer&mode=dark`  |
| 3   | `http://localhost:4173/?theme=cosmic&mode=light`   |
| 4   | `http://localhost:4173/?theme=cosmic&mode=dark`    |
| 5   | `http://localhost:4173/?theme=minimal&mode=light`  |
| 6   | `http://localhost:4173/?theme=minimal&mode=dark`   |
| 7   | `http://localhost:4173/?theme=cli&mode=light`      |
| 8   | `http://localhost:4173/?theme=cli&mode=dark`       |

#### Pass if (for each of the 8)

- [ ] Body text is readable against background
- [ ] Focus rings visible on buttons, links, inputs, radios
- [ ] No controls appear invisible (same color as background)
- [ ] Primary interactive elements are distinguishable without hover

---

**Test 2 complete?** ✅ Proceed to Test 3.

---

## Test 3 — Skills tabs & Articles carousel

> **Lesson:** Tabs are one of the few places custom keyboard behavior is required. APG defines exact key bindings — but not every tab-like control uses the full arrow-key model.

> **This site:** `Skills/index.tsx` implements the manual activation tabs pattern with roving `tabIndex`. `Articles/index.tsx` uses tab semantics for carousel dots plus separate prev/next buttons.

---

### 3a. Skills tabs

**Prerequisite:** Navigate to the **Skills** section (`#skills`).

#### Steps

1. **`Tab`** until focus enters the tablist (`aria-label="Skill categories"`).
2. With focus on a tab, press **`Arrow Right`** several times — focus and selection should move.
3. Press **`Arrow Left`** — moves backward.
4. Press **`Home`** — jumps to first tab (Frontend).
5. Press **`End`** — jumps to last tab (AI).
6. **`Tab`** forward from the active tab — focus should leave the tablist into the visible panel content (skill links), not other tabs.

#### Pass if

- [ ] Tab buttons expose selected state visually
- [ ] Arrow keys move between tabs and update the visible panel
- [ ] **Home** → first tab; **End** → last tab
- [ ] Only one tab has `tabindex="0"` at a time (inactive tabs skipped during Tab — use DevTools if unsure)
- [ ] Inactive panels are hidden (`hidden` attribute) — their content not in tab order
- [ ] Focus ring visible on active tab

#### VoiceOver check (optional here; required in Test 6)

- Rotor → tabs should list Frontend, Backend, Tooling, AI
- Selected tab announced with "selected"

#### Fail examples

- Arrow keys scroll page instead of changing tabs
- Multiple panels visible
- Tab order visits every tab button before panel content

---

### 3b. Articles carousel

**Why it matters:** Carousel dot controls use `aria-controls` to associate each tab with its panel. Inactive panels must stay in the DOM (with `hidden`) so assistive tech can resolve those relationships before activation.

**Prerequisite:** Navigate to **Articles** (`#articles`). Use desktop width so prev/next sit beside the counter (mobile stacks controls — retest layout in Test 8).

#### Steps

1. **`Tab`** to **Previous article** — on the first slide it should be **`disabled`** and skipped or non-operable.
2. **`Tab`** to **Next article** — activate with **`Enter`** or **`Space`**; slide and counter update.
3. **`Tab`** into the dot tablist (`aria-label="Select article"`) — activate the other dot tab.
4. Listen for or read the live counter (`Article 1 of 2` / `Article 2 of 2`).
5. **`Tab`** through the visible article card links (title, Read article, cover image link).
6. **DevTools check:** for every `[role="tab"]` in the carousel, confirm `aria-controls` matches an existing `#article-slide-*` element in the DOM (including inactive slides).

#### Pass if

- [ ] Carousel region announced (region + carousel roledescription + "Article slides" label)
- [ ] **Previous article** disabled on first slide; **Next article** disabled on last slide
- [ ] Prev/next buttons show visible focus rings and clear chevron icons (not clipped to a dot)
- [ ] Only one tabpanel visible at a time; inactive panels have the `hidden` attribute
- [ ] Each dot tab's `aria-controls` id exists in the DOM before that tab is activated
- [ ] Active dot has `aria-selected="true"` and `tabindex="0"`; inactive dots use `tabindex="-1"`
- [ ] Counter updates when slide changes (`aria-live="polite"`)
- [ ] Article card links remain keyboard reachable in the active panel only

#### Fail examples

- Inactive dot's `aria-controls` points at a missing element (panel only mounts after click)
- Both article panels visible at once
- Prev/next icons invisible or focus ring missing
- Counter does not update after navigation

---

**Test 3 complete?** ✅ Proceed to Test 4.

---

## Test 4 — Contact form

> **Lesson:** Forms are the highest-stakes interactive UI. Errors must be perceivable, understandable, and announced.

> **This site:** `Contact/index.tsx` pairs each field with label + conditional `aria-describedby`. `focusFirstFieldError()` runs on failed validation.

**Prerequisite:** Navigate to **Contact** (`#contact`).

---

### 4a. Client validation

#### Steps

1. **`Tab`** to **Send Message** and activate without filling fields.
2. Observe focus and error messages.
3. Fill **Email** with `bad-email`, **Message** with `short`, leave **Name** empty.
4. Submit again.
5. Fix each field to valid values (name ≥ 2 chars, valid email, message ≥ 10 chars).
6. Submit again (network may fail without API — that is OK for keyboard/ARIA testing).

**Validation rules** (from `src/shared/contact.ts`):

| Field   | Rule                    |
| ------- | ----------------------- |
| Name    | ≥ 2 characters          |
| Email   | non-empty, valid format |
| Message | ≥ 10 characters         |

#### Pass if

- [ ] Empty submit: focus moves to **first** invalid field (Name)
- [ ] Each invalid field shows `aria-invalid` behavior (exposed in accessibility tree)
- [ ] Error text appears below the field and is announced when focus moves there
- [ ] Each error is tied to its field (`aria-describedby` → `name-error`, etc.)
- [ ] Correcting a field clears its error on change
- [ ] On success: green status with `role="status"` appears (if API succeeds)
- [ ] On network failure: `role="alert"` error appears — not confused with field errors

#### Fail examples

- Errors only turn red with no text for screen readers
- Focus stays on submit button
- One generic error at top with no field association

---

### 4b. Keyboard flow

#### Steps

1. From top of Contact section, **`Tab`** through: email link → LinkedIn → GitHub → Name → Email → Message → Submit.
2. Type in each field using only keyboard.

#### Pass if

- [ ] Labels are announced when entering each field (VoiceOver: "Your Name, edit text")
- [ ] Tab order is logical left-to-right / top-to-bottom
- [ ] No key handlers steal typing in inputs
- [ ] Submit button reachable; disabled state announced when submitting

---

**Test 4 complete?** ✅ Proceed to Test 5.

---

## Test 5 — CLI theme

> **Lesson:** Novel UIs (terminal interfaces) need explicit semantics so assistive tech does not misidentify them.

> **This site:** CLI is a `<section aria-label="Interactive portfolio terminal">` — not a giant button. Options use `aria-pressed`; output uses `role="log"`; input uses `aria-describedby` for keyboard hints.

**Prerequisite:** Open theme switcher → select **CLI** theme (or visit `?theme=cli&mode=dark`).

---

### Steps

1. **`Tab`** into the terminal — close button, option buttons, command input.
2. Use **`Arrow`** keys / **`Space`** per the hint bar (`cli-keyboard-shortcuts`) to change selected option.
3. Press **`Enter`** in the command input to run a command (e.g. `help` or `9`).
4. **`Tab`** to an option button and **`Space`** to select it.
5. Activate the red close dot — exits CLI back to default theme.

#### Pass if

- [ ] Terminal container is **not** announced as a single button
- [ ] Option buttons announce **pressed** / **not pressed** state
- [ ] Command input is labeled ("Terminal command input")
- [ ] Keyboard hint text is associated (`aria-describedby="cli-keyboard-shortcuts"`)
- [ ] New output in the history region is exposed via `role="log"` (polite updates)
- [ ] Close button has clear label (`Exit CLI and switch to … theme`)
- [ ] Focus indicators visible on options and input in CLI colors

#### Fail examples

- VoiceOver says "button" for the whole terminal window
- Selected option not conveyed except by color
- Log output never announced

---

**Test 5 complete?** ✅ Proceed to Test 6.

---

## Test 6 — Screen reader pass

> **Lesson:** Automated axe tests do not hear what VoiceOver says. This pass validates names, roles, and reading order.

**Prerequisite:** Safari + VoiceOver (`Cmd + F5`). Production preview at `http://localhost:4173/`.

---

### 6a. Landmarks and headings

#### Steps

1. Open rotor (**`VO + U`**) → **Landmarks**.
2. Confirm regions present.
3. Rotor → **Headings** — read top-to-bottom.

#### Pass if

- [ ] Exactly one **main** landmark
- [ ] **Navigation** landmark(s) announced with label ("Main navigation")
- [ ] **Footer** / contentinfo if footer mounted
- [ ] Heading order logical: page title (`h1` in hero) → section `h2`s → subsection `h3`s
- [ ] No empty or duplicate headings that confuse structure

---

### 6b. Navigation and dialogs

#### Steps

1. Mobile viewport → open **Main menu** → listen to announcement → close with Escape.
2. Open **Theme settings** dialog → listen → close with Escape.

#### Pass if

- [ ] Mobile menu announced as **dialog**, name **"Main menu"**
- [ ] Theme switcher announced as **dialog**, name **"Theme settings"**
- [ ] Closing either returns focus to invoking button (VoiceOver cursor follows focus)
- [ ] `aria-expanded` on menu toggle updates (collapsed/expanded)

---

### 6c. Tabs, carousel, and form errors

#### Steps

1. Navigate to Skills → rotor → tabs → move between tabs.
2. Navigate to Articles → listen to carousel region, prev/next buttons, dot tabs, and counter as you change slides.
3. Navigate to Contact → submit empty form → listen as focus lands on Name.

#### Pass if

- [ ] Skills tabs announced as tabs with **selected** state
- [ ] Articles carousel region and slide counter announced; dot tabs convey **selected** state
- [ ] Contact field errors announced when field receives focus after submit
- [ ] Success message (if triggered) announced politely — not as aggressive alert
- [ ] Submit failure uses alert semantics appropriately

---

**Test 6 complete?** ✅ Proceed to Test 7.

---

## Test 7 — Reduced motion

> **Lesson:** WCAG 2.3.3 (Animation from Interactions) and user `prefers-reduced-motion` expect a safe fallback.

> **This site:** Hero detects reduced motion via `matchMedia`. Cosmic theme shows `.hero-cosmic-still` instead of video/3D. Global CSS in `App.css` disables smooth scroll and animations.

---

### Setup

Enable reduced motion **either**:

- **macOS:** System Settings → Accessibility → Display → **Reduce motion** ON
- **Chrome DevTools:** ⋮ → More tools → Rendering → **Emulate CSS media feature `prefers-reduced-motion: reduce`**

### Steps

1. Visit `http://localhost:4173/?theme=cosmic&mode=light`
2. Observe hero area for 10–15 seconds.
3. Scroll through hero and one deferred section.
4. Re-test with **engineer** theme at same URL pattern.

#### Pass if

- [ ] Cosmic hero shows **still image** (no video element; `.hero-cosmic-still` present)
- [ ] No continuous motion / parallax that could cause vestibular distress
- [ ] Page remains fully usable — nav, theme switcher, scrolling all work
- [ ] Reveal animations effectively instant or absent

#### Automated cross-check

```bash
npm run test:a11y:e2e -- --grep "reduced motion"
```

---

**Test 7 complete?** ✅ Proceed to Test 8.

---

## Test 8 — Zoom and reflow

> **Lesson:** WCAG 1.4.10 (Reflow) requires content to work at 320 CSS px width equivalent — roughly **400% zoom** on a 1280px window, or **200%** on smaller laptops.

**Prerequisite:** Browser zoom, not just `Cmd + +/-` on macOS if it only scales UI chrome — use browser zoom (Chrome: View → Zoom).

---

### Steps

Set zoom to **200%**. Walk through each flow. Then try **400%** on the same flows if possible.

| #   | Flow              | What to do                                                 |
| --- | ----------------- | ---------------------------------------------------------- |
| 1   | Top navigation    | Resize to mobile + desktop; open nav                       |
| 2   | Mobile menu       | Open drawer; read all links                                |
| 3   | Theme switcher    | Open dialog; reach all radios                              |
| 4   | Skills tabs       | Switch tabs; read skill grid                               |
| 5   | Articles carousel | Use prev/next and dot tabs; read article card at 200% zoom |
| 6   | Contact form      | Fill all fields; read errors                               |
| 7   | CLI theme         | Use terminal options + input                               |

#### Pass if

- [ ] No clipped text (content cut off with no way to reach it)
- [ ] No overlapping controls (buttons covering labels)
- [ ] Dialogs remain usable — no OK button off-screen
- [ ] Horizontal scrolling only where intentional (e.g. wide code), not for normal paragraphs
- [ ] Mobile menu and theme dialog fit viewport or scroll internally

---

**Test 8 complete?** ✅ Proceed to Test 9.

---

## Test 9 — Focus visibility sweep

> **Lesson:** `:focus-visible` styles must survive every theme token combination. This is the final keyboard UX polish pass.

**Prerequisite:** Keyboard only. Test these three combinations — they stress different token sets:

1. `?theme=engineer&mode=light`
2. `?theme=minimal&mode=dark`
3. `?theme=cli&mode=dark`

---

### Steps

On each URL, run one continuous **`Tab`** pass from skip link through:

- Skip link → nav links → theme toggle → open theme dialog (check radio focus) → close
- Main content links (hero CTA if present)
- One section's interactive elements (project card link, skill tab, **Articles carousel prev/next + dot tabs**, contact field)

#### Pass if

- [ ] Every interactive element shows a clearly visible focus indicator
- [ ] Focus ring contrast holds against each background
- [ ] No `outline: none` without replacement (except visual-test mode — not used in manual testing)
- [ ] Theme switcher radios show focus on label/swatch (via `:focus-visible + label` pattern)

---

**Test 9 complete?** ✅ Manual pass done — see sign-off below.

---

## Automated gates (run before manual sign-off)

Run these before the manual script so you are not debugging known violations by hand:

```bash
npm run contrast:check      # Theme token contrast pairs
npm run test:a11y:unit      # axe component tests
npm run test:a11y:e2e       # @a11y Playwright specs (keyboard + focus)
npm run lighthouse          # Accessibility 1.00 per theme/mode
```

| Gate             | What it catches                                                                      |
| ---------------- | ------------------------------------------------------------------------------------ |
| `contrast:check` | Text/focus token pairs below WCAG AA                                                 |
| `test:a11y:unit` | Markup/ARIA issues in components (includes Articles carousel tab/panel associations) |
| `test:a11y:e2e`  | Skip link focus, dialog trap, form errors, reduced motion                            |
| `lighthouse`     | Holistic audit per theme matrix                                                      |

---

## Defect template & sign-off

### When you find a bug

Capture:

```
Title:
URL:
Theme + mode:
Browser + assistive tech:
Keyboard steps to reproduce:
Expected:
Actual:
Screenshot/recording:
Likely file(s):
```

### Quick sign-off checklist

Manual pass is acceptable when **all** are true:

- [ ] **Test 1** — Keyboard-only navigation works start to finish
- [ ] **Test 2** — Theme switcher traps/restores focus; all 8 theme URLs readable
- [ ] **Test 3** — Skills tabs follow APG keyboard model; Articles carousel tabs, prev/next, and persistent panels work
- [ ] **Test 4** — Contact validation visible and announced
- [ ] **Test 5** — CLI terminal understandable to assistive tech
- [ ] **Test 6** — VoiceOver landmarks, dialogs, tabs, carousel, errors correct
- [ ] **Test 7** — Reduced-motion cosmic fallback works
- [ ] **Test 8** — 200% zoom (and 400% if tested) without broken layout
- [ ] **Test 9** — Focus visible across engineer/minimal/cli themes
- [ ] Automated gates green

---

## Further reading (external)

Fetched via [Context7](https://context7.com) documentation indexes used while writing this guide:

- [ARIA Authoring Practices Guide — Tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) — arrow keys, Home/End, roving tabindex
- [ARIA Authoring Practices Guide — Carousel pattern](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/) — slide controls, live status, roledescription
- [ARIA Authoring Practices Guide — Dialog (Modal) pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) — focus trap, Escape, initial focus
- [ARIA Authoring Practices Guide — Radio Group pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/) — roving tabindex for radio groups
- [React.dev — Accessibility](https://react.dev/learn/accessibility) — semantic HTML, `aria-*`, label association
- [React.dev — useId for aria-describedby](https://react.dev/reference/react/useId) — unique IDs for assistive text linking

Project docs:

- [`docs/ACCESSIBILITY.md`](./ACCESSIBILITY.md) — contract and automated gates
- [`.cursorrules`](../.cursorrules) — authoring standards for new code
