# Implementation Plan: Optimization, Simplification & Performance Refactoring

## Overview
This plan implements the recommendations from the Web Performance Audit and Code Simplification Audit for the Pêche — Fiches Techniques Littoral Normand application. It achieves significant rendering performance gains (de-blocking the Critical Rendering Path, fixing INP search lag, deferring off-screen card rendering with `content-visibility`) and reduces HTML/CSS code bloat by ~1,347 lines (~10,800 tokens saved) while keeping 100% of the 78 DevTools E2E tests passing.

## Architecture Decisions
- **In-place DOM Search Filtering**: Eliminate destructive `innerHTML` re-renders on every keystroke in `app.js`. Toggle element visibility via `display: none` and add a 150ms debounce for high-responsiveness (INP).
- **CSS `content-visibility: auto`**: Defer layout and rendering math for off-screen cards in `.duo-card-shell` and `.interactive-card` without adding JS overhead.
- **Dynamic Theme Popover Generation**: Render the 11 theme selection buttons in `theme-controller.js` on boot instead of hardcoding 140+ lines of static HTML in `site/index.html`.
- **Zero-Regression Bar**: Every phase must clear `npm run test:quick` (unit + targeted E2E) and the final phase must clear full `npm test` (8 unit + 78 CDP E2E tests) and `npm run validate`.

---

## Task List

### Phase 1: Critical Rendering Path & Performance Fixes
- [ ] **Task 1.1**: De-block Critical Rendering Path in `site/index.html` (`media="print"` on `07-print.css`, `defer` on `data.js`).
- [ ] **Task 1.2**: Implement `content-visibility: auto` and layout containment in `site/css/04-views.css`.
- [ ] **Task 1.3**: Refactor search input in `site/js/app.js` (in-place DOM visibility toggling + 150ms debounce).

### Checkpoint 1: Performance Core
- [ ] Verify `npm run test:quick` passes (38 E2E assertions + 8 unit tests).

### Phase 2: HTML & Template Simplification
- [ ] **Task 2.1**: Dynamize theme popover buttons in `site/js/theme-controller.js` and clean up `site/index.html`.
- [ ] **Task 2.2**: Flatten DOM structures in `site/js/render-back.js` (Waypoints) and `site/js/parsers.js` (Cockpit wrappers).

### Checkpoint 2: HTML & Template Cleanup
- [ ] Verify `npm run test:quick` passes.

### Phase 3: CSS Dead Code Purge & Factorization
- [ ] **Task 3.1**: Purge 25+ dead CSS selectors, 4 unused theme variables, and consolidate active transforms & badge rules.

### Checkpoint 3: Full Suite Validation
- [ ] Verify full `npm test` passes (78 E2E assertions + 8 unit tests).
- [ ] Verify `npm run validate` passes (32 species schema & density checks).

---

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| In-place search visibility breaking species counter or card stats | Medium | Update counter dynamically in `app.js` during visibility calculation and verify in Axe 6 tests |
| `content-visibility` causing height jump in scroll observer | Low | Set explicit `contain-intrinsic-size: 1px 760px` matching card height |
| Removing a CSS selector that is needed in print mode | Medium | Run `npm test` (which tests print mode in Axe 5, 8, 10, 11) after every CSS change |

## Open Questions
- None. All proposed changes are covered by the automated test suite.
