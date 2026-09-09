# Task List: Optimization & Simplification

## Task 1.1: De-block Critical Rendering Path in `site/index.html`

**Description:** Add `media="print"` to the `07-print.css` stylesheet link tag and `defer` attribute to the `data.js` script tag in `site/index.html`.

**Acceptance criteria:**
- [x] `07-print.css` link tag in `site/index.html` includes `media="print"`.
- [x] `data.js` script tag in `site/index.html` includes `defer`.
- [x] Non-print pages no longer treat `07-print.css` as a render-blocking critical CSS resource.

**Verification:**
- [x] Tests pass: `npm run test:quick`

**Dependencies:** None

**Files likely touched:**
- `site/index.html`

**Estimated scope:** Small (1 file)

---

## Task 1.2: Implement `content-visibility: auto` & Layout Containment

**Description:** Add `content-visibility: auto; contain-intrinsic-size: 1px 760px;` to `.duo-card-shell` and `.interactive-card` in `site/css/04-views.css`. Add `contain: layout style;` to `.interactive-card`.

**Acceptance criteria:**
- [x] Off-screen cards defer layout and rendering calculations until scrolled into viewport.
- [x] Card 3D flipping performance is isolated with `contain: layout style;`.

**Verification:**
- [x] Tests pass: `npm run test:quick`

**Dependencies:** None

**Files likely touched:**
- `site/css/04-views.css`

**Estimated scope:** Small (1 file)

---

## Task 1.3: Refactor Search Input with In-Place Visibility Toggling & Debounce

**Description:** Refactor search listener in `site/js/app.js` to toggle card visibility in-place using `display: none` / CSS classes instead of re-rendering full `innerHTML` string on every keystroke. Add a 150ms debounce function.

**Acceptance criteria:**
- [x] Typing in `#search-input` does not trigger destructive `innerHTML` re-renders.
- [x] Card visibility updates in-place based on search query matching `dataset.searchPool`.
- [x] Active species counter in header updates correctly with filtered count.
- [x] Search input events are debounced by 150ms.

**Verification:**
- [x] Tests pass: `npm run test:quick`

**Dependencies:** Tasks 1.1, 1.2

**Files likely touched:**
- `site/js/app.js`

**Estimated scope:** Medium (1 file)

---

## Checkpoint: Phase 1 Performance Core
- [x] All unit tests pass: `npm run test:unit`
- [x] Targeted E2E tests pass: `npm run test:quick`

---

## Task 2.1: Dynamize Theme Popover Buttons & Clean Up `site/index.html`

**Description:** Move the 140+ lines of hardcoded static theme option buttons from `site/index.html` into a dynamic template generator function in `site/js/theme-controller.js`. Remove `div.biotope-select-shell` wrapper in `site/index.html`.

**Acceptance criteria:**
- [x] Static theme buttons in `site/index.html` are replaced by a single container container `#theme-popover-options`.
- [x] `theme-controller.js` dynamically renders the 11 theme option buttons on boot.
- [x] Theme selection popover opens, closes, selects themes, and updates ARIA attributes correctly.
- [x] `div.biotope-select-shell` wrapper is removed from `site/index.html`.

**Verification:**
- [x] Tests pass: `npm run test:quick`

**Dependencies:** Checkpoint 1

**Files likely touched:**
- `site/index.html`
- `site/js/theme-controller.js`

**Estimated scope:** Medium (2 files)

---

## Task 2.2: Flatten DOM Structures in `render-back.js` & `parsers.js`

**Description:** Flatten `renderWaypointsBlock()` in `site/js/render-back.js` by removing redundant `waypoint-meta` and `waypoint-naming` wrappers. Clean up redundant wrappers in `site/js/parsers.js` (`twelfths-chart-container`, `coef-track-wrap`, `terminal-card-header`).

**Acceptance criteria:**
- [x] Waypoint cards in `render-back.js` use direct grid layout without nested wrapper divs.
- [x] `parsers.js` renders cleaner HTML for gauges, tide/weather cockpits, and tackle blocks.
- [x] Layout and dimensions of waypoints and cockpits remain pixel-accurate in tests.

**Verification:**
- [x] Tests pass: `npm run test:quick`

**Dependencies:** Task 2.1

**Files likely touched:**
- `site/js/render-back.js`
- `site/js/parsers.js`
- `site/css/06-card-back.css`

**Estimated scope:** Medium (3 files)

---

## Checkpoint: Phase 2 HTML & Template Cleanup
- [x] All unit tests pass: `npm run test:unit`
- [x] Targeted E2E tests pass: `npm run test:quick`

---

## Task 3.1: CSS Dead Code Purge & Selector Consolidation

**Description:** Remove 25+ dead CSS selectors (leftover combo cards, SVG overlays) across `01-base.css`, `03-header.css`, `05-card-front.css`, `06-card-back.css`, and `07-print.css`. Purge 4 unused CSS variables in `02-themes.css`. Consolidate button active transforms and badge rules.

**Acceptance criteria:**
- [x] All identified dead selectors and unused CSS variables are purged.
- [x] Active state transforms (`transform: scale(0.98)`) and badge styles are consolidated.
- [x] Total CSS line count is reduced by ~800+ lines.
- [x] Full test suite passes without regressions.

**Verification:**
- [x] Tests pass: `npm test` (full 78 CDP E2E assertions + 8 unit tests)
- [x] Species validation passes: `npm run validate`

**Dependencies:** Checkpoint 2

**Files likely touched:**
- `site/css/01-base.css`
- `site/css/02-themes.css`
- `site/css/03-header.css`
- `site/css/04-views.css`
- `site/css/05-card-front.css`
- `site/css/06-card-back.css`
- `site/css/07-print.css`

**Estimated scope:** Large (7 files)

---

## Checkpoint: Complete Verification
- [x] All unit tests pass (`npm run test:unit`)
- [x] Full CDP E2E test suite passes (`npm test`)
- [x] Species validation passes (`npm run validate`)
