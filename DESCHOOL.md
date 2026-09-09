# De School Web Design Guidelines

This document outlines the design principles, visual hierarchy, color palette, typography, grid system, and UI components extracted from the **De School** web design (`deschoolwebsite.jpg`). These guidelines serve as a reference for building applications in this **Neo-Brutalist Grid & Utilitarian Editorial** aesthetic.

---

## 1. Aesthetic Philosophy & Core Principles

* **Visible Structural Infrastructure:** Rather than concealing layout frameworks, the underlying modular grid is explicitly rendered with dark stroke lines, forming an architectural blueprint or graph paper foundation.
* **Utilitarian & Minimalist:** Form rigorously follows function. Information is presented with raw, unadorned precision—reminiscent of industrial signage, event tickets, and printed cultural posters.
* **Asymmetrical Grid Play:** Clean rectangular content blocks (event cards, announcements, images) hover on top of or tile within the underlying persistent grid.
* **Zero Decorative Polish:** Avoid drop shadows, gradient backgrounds, or rounded corners (`border-radius: 0`). Express structure through border lines, whitespace, typography, and crisp layouts.

---

## 2. Color Palette & Materials

| Role | Color / Value | Description |
| :--- | :--- | :--- |
| **Canvas / Background** | `#F4F1EA` (Warm Cream / Off-White) | Warm parchment background with an organic, tactile paper quality. |
| **Primary Structural / Text** | `#111111` / `#000000` (Solid Black) | High-contrast black for lines, headers, grid strokes, and primary text. |
| **Accent / CTA** | `#E05344` (Muted Coral / Salmon Red) | Used sparingly for high-priority interactive links (e.g., `TICKETS`). |
| **Surface Fill** | `#FFFFFF` (Pure White) or transparent | Overlay cards use solid white backgrounds to punch through the background grid lines. |
| **Texture Accents** | Black Stipple / Noise Pattern | Densified dot patterns fill select grid cells to add physical print-like texture. |

---

## 3. Typography & Hierarchy

### Font Families
1. **Primary Sans-Serif (Headings & Navigation):** Clean, unstyled geometric or neo-grotesque sans-serif (e.g., *Neue Haas Grotesk*, *Helvetica*, *Inter*, or *Arial*).
2. **Technical Monospace (Data & Metadata):** Crisp, fixed-width monospace font (e.g., *Space Mono*, *Courier*, *Inconsolata*) for event details, prices, times, and body copy.

### Typographic Matrix

| Element | Font Type | Case / Styling | Weight | Decoration / Details |
| :--- | :--- | :--- | :--- | :--- |
| **Section Titles** | Sans-Serif | ALL CAPS | Regular / Bold | None (e.g. `THIS WEEK`) |
| **Featured Headings** | Sans-Serif | ALL CAPS | Regular / Medium | Underline on hover/link |
| **Navigation Links** | Sans-Serif | Mixed Case | Regular | Active state: underlined |
| **Meta / Timestamps** | Monospace | ALL CAPS | Bold / Regular | e.g. `WED 27.06`, `15.05.2018` |
| **Details / Prices** | Monospace | Lowercase / Mixed | Regular | e.g. `presale € 7,50 / door € 7,50` |
| **Action CTAs** | Monospace | ALL CAPS | Regular | Simple underline in Accent Red (`#E05344`) |

---

## 4. Grid System & Structural Rules

```
+---+---+---+---+---+---+---+---+---+---+---+---+
|   |   |   |   |   |   |   |   |   |   |   |   |
+---+---+---+---+---+---+---+---+---+---+---+---+
|   | [ FEATURED CARD ] |   | [ AGENDA LIST ]   |
+---+---+---+---+---+---+---+                   |
|   |   |   |   |:::|:::|   |                   |
+---+---+---+---+---+---+---+---+---+---+---+---+
| [ARTICLE] | [ARTICLE] |   |   |   |   |   |   |
+---+---+---+---+---+---+---+---+---+---+---+---+
```

1. **Persistent Blueprint Grid:**
   * **Cell Size:** Uniform square modules (e.g., ~32px–48px square).
   * **Border Style:** Crisp `1px solid #000000` grid lines across the main container canvas.
2. **Layering Strategy:**
   * **Base Layer:** Continuous gridline network.
   * **Mid Layer:** Textural graphic blocks (stippling / noise pattern fills in select grid cells).
   * **Top Layer:** Solid white rectangular panels containing content (headlines, agenda items, text columns).
3. **Card Borders & Outlines:**
   * Content boxes carry an explicit `1px solid #111111` border to visually isolate content from background grid lines.

---

## 5. UI Component Specifications

### A. Header & Top Navigation
* **Brand Mark / Logo:** Enclosed in a stacked 2-row square box:
  ```
  +--------+
  | DE     |
  | SCHOOL |
  +--------+
  ```
* **Primary Navigation:** Horizontal inline menu with generous letter-spacing. Active state indicated by a subtle bottom underline on the menu item.
* **Utility Navigation:** Right-aligned social links (`FACEBOOK`, `INSTAGRAM`), language switcher (`NL`, `EN`), and an isolated boxed `TICKETS` button.

### B. Featured Banner / Announcement Box
* Heavy bold sans-serif header framed in a prominent white rectangle overlapping the grid.
* Contains key event titles in uppercase sans-serif with underlined link headers.

### C. Agenda / Schedule List ("THIS WEEK")
* Large section title in high-impact uppercase sans-serif (`THIS WEEK`).
* **Row Structure:**
  * **Column 1 (Date Anchor):** Monospace bold (e.g., `WED 27.06`, `FRI 29.06`, `SAT 30.06`).
  * **Column 2 (Event Meta & Links):** Monospace details specifying category (`WORKSHOP`, `CLUB`, `CONCERT`), performer/speaker names, ticket links in accent red (`TICKETS`), presale/door prices, and doors opening times.
* Bottom text button linking to full program (`FULL PROGRAM` with underline).

### D. Editorial / Article Cards
* **Media:** Raw 1:1 square photography without rounded corners or hover zooms.
* **Headline:** Bold, line-wrapped sans-serif in all-caps.
* **Meta Info:** Small monospace dateline + category tag (e.g., `15.05.2018 RESTAURANT`).
* **Body Copy:** Compact monospace paragraph text.
* **Footer CTA:** Simple `READ MORE` link with underline.

---

## 6. Imagery & Graphics

* **Unprocessed / Authentic Realism:** Use natural, candid photos rather than glossy or overly processed stock images.
* **Square Framing:** Strictly 1:1 aspect ratio or aligned with grid module widths.
* **No Decorative Overlays:** No gradient overlays, drop shadows, or border-radius curves (`border-radius: 0`).
* **Textural Noise:** Use stippling or dot-density patterns in empty grid cells as geometric accent blocks.

---

## 7. Sample CSS Reference Snippet

```css
:root {
  --color-bg: #f4f1ea;
  --color-text: #111111;
  --color-accent: #e05344;
  --color-surface: #ffffff;
  --border-line: 1px solid #111111;
  --font-sans: 'Neue Haas Grotesk', 'Helvetica Neue', Arial, sans-serif;
  --font-mono: 'Space Mono', 'Courier New', monospace;
}

body {
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
  margin: 0;
  padding: 0;
}

/* Base Blueprint Grid System */
.grid-canvas {
  background-size: 40px 40px;
  background-image: 
    linear-gradient(to right, #111111 1px, transparent 1px),
    linear-gradient(to bottom, #111111 1px, transparent 1px);
}

/* Content Panel Overlay */
.content-card {
  background: var(--color-surface);
  border: var(--border-line);
  padding: 1.5rem;
  border-radius: 0; /* Strict square corners */
}

/* Utilitarian Links */
a.link-cta {
  font-family: var(--font-mono);
  color: var(--color-accent);
  text-decoration: underline;
  text-transform: uppercase;
}

/* Monospace Event Details */
.event-meta {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  line-height: 1.4;
}
```
