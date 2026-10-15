# Skills card design review

Date: 2026-10-15. Scope: the three Skills & Technologies cards in PR #298.

## Source and implementation

- Approved source: `output/playwright/professional-review/skills-approved-mockup.png`
  (1828 × 860 pixels). This is the owner's selected generated mockup.
- Implementation: `output/playwright/professional-review/skills-grouped-desktop.jpg`
  (1430 × 589 pixels), captured from the production preview in the Codex in-app
  browser at a 1440 × 1000 CSS-pixel viewport. The section crop excludes the scrollbar.
- Full comparison: `output/playwright/professional-review/skills-design-comparison.png`.
  The source and implementation are stacked in one image, each normalized to
  1440 pixels wide without stretching their aspect ratios. This is a layout
  comparison, not a claim of identical rasterization or image density.
- Focused comparison: `output/playwright/professional-review/skills-icons-comparison.png`.
  The first card's heading, five authentic logos, and small collective caption
  appear beside the corresponding source region at the normalized scale.
- Responsive evidence: `output/playwright/professional-review/skills-grouped-mobile-390.jpg`
  (380 × 1275 pixels) and `skills-grouped-mobile-320.jpg` (320 × 1438 pixels).
  Browser viewports were 390 × 1500 and 320 × 844 CSS pixels; section captures
  include the complete content, beyond the narrow viewport's initial scroll area.

The evidence files are local review artifacts. The tracked macOS/Linux skill
references provide portable screenshots in the repository.

## Findings

No actionable P0, P1, or P2 differences remain.

- **Typography:** Preserve the portfolio's existing font and heading hierarchy.
  Technology captions use 13px text, smaller than the 15px summaries, with readable
  wrapping at phone widths. Every name remains visible as text in its named list.
- **Layout:** Preserve three equal-width desktop cards, existing padding and
  rounded corners, one icon group per category, and stacked phone cards. Captions
  sit below the entire group. The shorter cards intentionally reflect the owner's
  request to remove the bottom links and their reserved space.
- **Colors:** Preserve existing dark-purple theme tokens and white logo frames.
  The generated mockup's subtle raster lighting is not a new background asset;
  the established theme colors remain the implementation source.
- **Assets:** Reuse all 13 original local technology images, including both MySQL
  and MariaDB. No substitute, generated, or hand-drawn logos are introduced.
  Browser checks confirm every image loads. Desktop image/frame sizes are 48/56px;
  at 390px they are 40/48px; at 320px they are 32/40px.
- **Copy:** Replace the mockup's older descriptions with the owner's requested
  professional summaries: frontend modernization, repeatable checks and releases,
  and API/data design. Technology names stay in the smaller caption rather than
  being repeated in the summaries. All three bottom links are removed.

## Verification and comparison history

The first design comparison uses the final revised copy, settled fonts, matching
dark theme, and the complete skills section. Both full-view and focused images
were opened together with their source for review. Earlier framing attempts were
recaptured after responsive layout settled; they did not identify a product defect
or cause a source change. No P0/P1/P2 design correction was needed after comparison.

At 1440px, 390px, and 320px, all 13 images load and every caption follows its icon
group. Card and page widths do not overflow. The section contains no anchors or
other card actions. Technology names remain exposed once as accessible list text;
decorative logos are hidden from assistive technology. Existing navigation and
accessibility journeys are checked separately in the repository browser suite.

Browser console inspection found no errors. The existing Three.js clock
deprecation warning belongs to the hero and is unchanged by this work. Physical
touch and human screen-reader acceptance are outside this visual check.

## Implementation checklist

- [x] Group authentic logos above the small name lists.
- [x] Preserve the three category headings and existing theme styles.
- [x] Improve all three summaries and remove card links.
- [x] Check typography, spacing, colors, asset fidelity, and copy against the source.
- [x] Verify complete desktop and narrow-screen content without overflow.

final result: passed
