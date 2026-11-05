# Accessibility manual test guide

Reviewed against source on 2026-11-05. This is a test procedure, not a completed accessibility sign-off.
The target is WCAG 2.2 AA. Automated scans and viewport emulation do not establish complete conformance.

The current Skills section contains four static cards. It has no category tabs.
The CLI uses a transcript and command input. It has no option-button menu.

## Prepare

Use Node and npm versions from [development workflow](DEVELOPMENT_WORKFLOW.md).
From the repository root:

```sh
npx --yes npm@11.6.4 ci
npx playwright install chromium firefox webkit
```

Run automated gates before starting a manual preview.
Close any earlier manual preview on port 4173 before the browser suite:

```sh
npm run contrast:check
npm run test:a11y:unit
npm run test:a11y:e2e
npm run lighthouse
```

After those checks finish, start the manual preview:

```sh
npm run start:prod
```

Leave it running in one terminal. Use another terminal for any further commands.
Open `http://localhost:4173/`. Production preview serves static output, not the Vercel API functions.
Use isolated mocked responses for contact success/error checks. Sending a real message requires explicit authorization.

Record the revision, browser/version, operating system, assistive technology, viewport/zoom, and date for every session.
Use keyboard-only Chrome and Safari with VoiceOver. Add NVDA on Windows when available.
Physical touch and mobile keyboards require real-device checks.

## Keyboard navigation

1. Reload the page and press Tab.
2. Activate **Skip to main content**.
3. Confirm focus moves to `main#main` and remains visible.
4. At widths above 980 CSS pixels, inspect Projects, Experience, About, Articles, Contact, and résumé links.
5. Activate each section link and confirm its heading, scroll position, and focus.
6. Navigate directly to Skills and GitHub for their remaining checks.

Pass when every control has visible focus and each link reaches the expected content.
Section navigation must not later steal focus after another user interaction.
Confirm the résumé action opens or downloads a real PDF.

## Mobile menu

1. Set the viewport to 980 CSS pixels or narrower.
2. Activate **Open menu** with Enter.
3. Inspect the **Main menu** dialog announcement.
4. Use Tab and Shift+Tab through its controls.
5. Press Escape.
6. Reopen it and activate a section link.

Pass when focus stays inside the open dialog and background content remains inert.
Escape returns focus to the menu button. Section selection closes the menu and reaches its destination.
Test the same path with physical touch separately.

## Theme settings

1. Focus **Toggle theme switcher** and activate it.
2. Confirm **Theme settings** is announced as a modal dialog.
3. Confirm focus starts on a checked radio.
4. Use native radio arrow keys and Space to select Mode and Theme values.
5. Use Tab and Shift+Tab between groups and other dialog controls.
6. Press Escape.

Pass when background content remains inert and closing returns focus to the invoking button.
Native radio groups use browser keyboard behavior; do not require every radio to be a separate Tab stop.

Inspect each theme (`engineer`, `cosmic`, `minimal`, `cli`) with both `mode=light` and `mode=dark`.
Also test `mode=system` while changing the operating-system color preference.

## Skills, Articles, and project demos

Skills should expose four headings and technology lists in reading order.
Decorative logos must not repeat every technology name to a screen reader.

For Articles:

1. Inspect the **Article slides** carousel region.
2. Activate **Next article** and **Previous article**.
3. Confirm disabled controls at their respective boundaries.
4. Activate the dot tabs and inspect the selected state.
5. Confirm the live counter updates.
6. Confirm only active article links are reachable.

The dot tab controls reference persistent panels with `aria-controls`.
Their keyboard behavior is separate from project demo tabs; test each implementation on its own.

For project galleries and media:

1. Use Left, Right, Home, and End to select each tabbed project view.
2. Inspect selected-state announcements and active-panel associations.
3. Confirm inactive content does not create hidden focus stops.
4. Start videos only through the available playback action.
5. Inspect captions/transcripts and pause controls.
6. Check image descriptions and source/download actions where offered.

Use the current project-specific controls; a screenshot gallery does not establish interaction inside the captured application.

## Contact validation

1. Submit the empty form.
2. Confirm focus moves to Name and its error is announced.
3. Enter a one-character name, invalid email, and message shorter than ten characters.
4. Submit again and inspect each associated field error.
5. Correct the inputs and confirm their errors clear.
6. Use isolated mocked success and server-error responses to inspect status announcements.

The validation source is `src/shared/contact.ts`:

| Field   | Accepted input                                                            |
| ------- | ------------------------------------------------------------------------- |
| Name    | Trimmed value of at least two characters; serialized maximum 100          |
| Email   | Non-empty address matching the shared email check; serialized maximum 254 |
| Message | Trimmed value of at least ten characters; serialized maximum 5000         |

Pass when errors use `aria-invalid` and `aria-describedby`, success uses `role="status"`, and submission failure uses `role="alert"`.
Confirm submission disables its action while pending and allows correction/retry after failure.
Mocked success does not establish inbox delivery.

## CLI

Open `/?theme=cli&mode=dark`. Use [JP-CLI](JP_CLI.md) for the supported commands.

1. Tab through **Exit terminal**, the transcript region, its links, and **Terminal command input**.
2. Run `help`, `ls`, `cd projects`, and a named project path shown by `ls`.
3. Run an invalid path and confirm recovery guidance.
4. Inspect the polite completion announcement and browse the transcript independently.
5. Recall command history with Up/Down and complete a path with Ctrl+Space.
6. Confirm normal Left/Right text editing and text copying.
7. Use Tab to leave the prompt; confirm there is no keyboard trap.
8. Activate **Exit terminal** and confirm the Minimal portfolio returns.

The yellow and green dots are decorative. Do not expect them to receive focus.
The transcript uses a named region; a separate status announces command completion.
It does not use `role="log"` for the full transcript.

## Screen-reader reading order

Inspect landmarks, headings, links, names, roles, states, and status updates.

- Confirm one main landmark and named navigation regions.
- Confirm the hero h1 precedes section h2 headings and descriptive h3 headings.
- Confirm dialogs announce their names and restore focus when dismissed.
- Confirm contact labels/errors are understandable without visual context.
- Confirm contribution data and its unavailable state have meaningful descriptions.
- Confirm the focusable contribution region supports horizontal keyboard scrolling when needed.
- Confirm project screenshots and videos have useful alternatives.
- Confirm decorative artwork stays out of the reading order.

Do not treat a clean axe result as completed VoiceOver or NVDA acceptance.

## Motion, zoom, and contrast

Enable the operating-system reduced-motion preference or emulate `prefers-reduced-motion: reduce`.
Inspect both engineer and cosmic themes. Expect still hero assets and reduced interface motion.
The astronaut must use its still asset. Confirm no unwanted parallax or delayed entrance blocks content.

Inspect keyboard focus and readability in all eight explicit theme/mode combinations.
Test browser zoom at 200% and reflow at a 320-CSS-pixel viewport equivalent.
Check menus, dialogs, project controls, form errors, and CLI input for clipping or overlap.
Horizontal scrolling must be limited to intentionally wide regions such as tables or the contribution calendar.

[Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) is WCAG Level AAA.
The project supports reduced motion as a product requirement; do not describe that criterion as Level AA.

## Record results

Use this record for each finding:

```text
Revision and date:
URL, theme, and mode:
Browser, OS, and assistive technology:
Viewport, zoom, and physical device if used:
Keyboard/touch steps:
Expected result:
Observed result:
Evidence:
Pass, fail, or not tested:
```

Sign off only the tested revision and environments. Keep unavailable screen-reader, device, and delivery checks marked **not tested**.

Sources: [accessibility contract](ACCESSIBILITY.md), [APG tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/), and [APG modal dialogs](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).

## Windows contrast and assistive technology

Test NVDA with Chrome and a Windows contrast theme when available.
Inspect navigation, dialogs, visible focus, form errors, project tabs, and CLI output.
Controls must remain identifiable when forced colors replace authored colors.
Record unavailable environments as not tested, rather than passed.

## Offline and physical touch

Load a production build online before disconnecting the network.
Inspect the cached app shell, local images, navigation, and project controls.
Remote GitHub data and avatars can be unavailable.
A failed contact submission must announce failure and must not claim queued delivery.
The app has no offline message outbox.

Repeat menu, theme, project controls, resume, video controls, and CLI input on
physical touch hardware with its real software keyboard.
Keep physical-device results separate from browser viewport emulation.
