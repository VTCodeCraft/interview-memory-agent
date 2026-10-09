# Clutchly design system (proposal v2)

Status: **Precision approved.** Adopted so far by the landing page (`/`, `app/page.tsx` and `components/landing-page/*`). Every other page still uses the legacy tokens.

Interactive preview: `/design-preview` (development, or production with `ENABLE_DESIGN_PREVIEW=true`). Add `?d=precision`, `?d=editorial` or `?d=spatial` to open a direction directly.

Source of truth:

- Tokens: the `@theme static` block at the top of `app/globals.css` (Precision values) plus the `:root` surface variables and `ds-*` utilities below it
- Direction overrides: `app/design-preview/_components/directions.ts`
- Brand font: `app/fonts.ts` (Mona Sans). Editorial fonts for the preview only: `app/design-preview/fonts.ts`
- Components: `components/ui/*`

Existing pages still use the legacy tokens further down `app/globals.css` and are visually unchanged.

---

## 1. Product read

Clutchly is a voice interview coach that remembers every session and builds the next one around what the candidate missed. Users are job candidates, mostly software engineers, often under pressure. The design has to say **serious, intelligent, trustworthy and personal** at first glance, scale from a marketing hero to dense score tables, and stay clear of four looks: generic AI landing page (purple gradients, glow), wellness app (soft greens, pastel calm), admin template, and default component-library developer tool.

The rejected v1 ("Evergreen") failed on two counts: the preview read as token documentation rather than a product, and the spruce palette leaned wellness. v2 starts again from the product moment that makes Clutchly different: **the coach remembers, and the next question proves it.**

## 2. Directions explored

All three are shown on one realistic page (top nav, hero, memory visualization, capability bento, report page in the signed-in product frame, closing CTA, footer) with identical content and layout. Only tokens change.

| | Precision (recommended) | Editorial | Spatial |
|---|---|---|---|
| Brief category | Premium AI SaaS | Editorial technology | Refined spatial AI |
| Idea | Quiet, exact, confident. Ink and ultramarine on porcelain | A career journal with intelligence. Serif display, paper, ink rules | Light, layered, luminous. Frosted panels over a softly lit canvas |
| Display | Mona Sans, 108% width, 620 | Newsreader, 400, italic emphasis | Geist, 600, tight tracking |
| UI / data | Mona Sans / Geist Mono | Instrument Sans / Geist Mono | Geist / Geist Mono |
| Accent | Ultramarine `#3541E2` | Vermilion `#C2391B` | Lagoon `#0B7186` |
| Primary action | Ink `#0C0D10` | Ink `#151412` | Lagoon pill |
| Shape | 10px controls, 14px cards | 2 to 6px, ink rules, no shadows | Pills, 20px cards, glass |
| Strengths | Reads as serious software at a glance. One accent with one meaning. Scales to dense data. Coherent with the current logo | Most distinctive first impression. Memory as a written record is an honest metaphor. Premium with almost no decoration | Depth makes memory literal. Feels next-generation without neon or purple. Delightful in marketing moments |
| Trade-offs | Restraint depends on craft. The blue family needs the ink and wide type to avoid feeling familiar | Serif slows dense product screens. Vermilion sits close to error red, so meters and status need care. Clashes with the violet logo. Can read as a publication | Glass needs content behind it and loses its point on dense pages. Backdrop blur costs GPU time on low-end phones. Most likely to date |

## 3. Recommendation: Precision

1. **Trust first.** Ink primary actions on porcelain neutrals read as established, well-funded software. That matters to someone preparing for a job they care about.
2. **One accent, one meaning.** Ultramarine marks memory and intelligence: remembered items, "Asked because" chips, memory rings on charts, the accent CTA. Everything else is neutral, so the memory story stays legible.
3. **It scales.** The same type and surfaces carry the hero, the bento and a dense report page without switching language. Editorial struggles on the report page and Spatial loses its effect there.
4. **No forced rebrand.** Ultramarine sits next to the current violet logo without clashing. Editorial's vermilion and Spatial's lagoon would both push a logo change.
5. **Distinct without effects.** Character comes from Mona Sans at an expanded width and tight tracking, not from gradients or glow.

Worth borrowing if Precision is approved: Editorial's italic emphasis for a single word in marketing headlines (already a token, `--emphasis-style`), and Spatial's bezel frame for product shots (kept in Precision as a subtle neutral tray).

## 4. Precision palette

Contrast figures are WCAG 2.x, measured in the browser by the preview's system sheet.

### Neutrals

| Token | Hex | Role |
|---|---|---|
| `canvas` | `#F8F8F6` | Page background (porcelain, very slightly warm) |
| `panel` | `#FFFFFF` | Cards, inputs, menus |
| `sunken` | `#F1F1EE` | Wells, active nav item, hover rows |
| `line-subtle` | `#ECECE8` | Dividers inside panels |
| `line` | `#E3E3DE` | Card borders |
| `line-strong` | `#CFCFC9` | Secondary button borders |
| `line-control` | `#8A8B86` | Form-control borders, 3.4:1 on panel |
| `fg` | `#0C0D10` | Primary text, 18.3:1 on canvas |
| `fg-muted` | `#4E5057` | Secondary text, 8.1:1 on panel |
| `fg-subtle` | `#686A71` | Meta and labels, 4.8:1 on sunken |
| `inverse` / `fg-inverse` | `#111216` / `#F4F4F2` | Dark cells, closing CTA, tooltips |

### Action and accent

| Token | Hex | Role |
|---|---|---|
| `action` (+ hover `#26282E`, active `#3A3C42`) | `#0C0D10` | Primary buttons. White label 19.4:1 |
| `brand` (+ hover `#2A35C4`, active `#222CA3`) | `#3541E2` | Accent: links, active tab, meters, chart line, accent button. 7.0:1 on panel |
| `brand-ink` | `#252FB0` | Accent text on tints |
| `brand-soft` / `brand-tint` | `#F0F1FE` / `#E3E6FC` | Accent backgrounds |
| `memory` / `memory-soft` / `memory-line` | `#3541E2` / `#F0F1FE` / `#C9CEFA` | "The coach remembered this". 6.2:1 text on tint |
| `focus` | `#3541E2` | 2px focus ring, 6.6:1 on canvas |

### Status

| Tone | Text | Soft | Line |
|---|---|---|---|
| success | `#17793A` | `#E9F6ED` | `#BFE3CB` |
| warning | `#A94B05` | `#FFF3E6` | `#F6CFA4` |
| danger (hover `#A12218`) | `#C0291D` | `#FDECEA` | `#F5C6C0` |
| info | `#2A55B8` | `#EDF2FC` | `#C6D5F3` |

Status is always text plus icon, never colour alone.

### Charts

`chart-1` `#3541E2`, `chart-2` `#0E8A7A`, `chart-3` `#C9721A`, `chart-4` `#B4446C`, baseline `#A6A7A2` (dashed), grid `#ECECE8`. The four series stay distinguishable under protanopia, deuteranopia and tritanopia simulation (minimum ΔE above 7). Single-series charts use the accent line plus a dashed neutral baseline. Label charts directly and add a text alternative.

### Why not the other colours

- **Purple / violet:** the generic AI look the brief rules out, and it would merge with the logo instead of supporting it.
- **Green:** read as wellness in v1.
- **Teal / lagoon:** good in Spatial, but cool glass is what makes it work, and it competes with success green in status-heavy screens.
- **Warm red / vermilion:** strong editorial voice, but it collides with error states in a product full of scores.

## 5. Typography

| Token | Size | Line height / tracking / weight | Use |
|---|---|---|---|
| `text-display` | clamp(2.6rem → 4.6rem) | 1.02 / -0.042em / 620 | Hero headline (`ds-display`, 108% width) |
| `text-headline` | clamp(2rem → 3.1rem) | 1.06 / -0.035em / 620 | Section headlines |
| `text-title` | clamp(1.5rem → 1.875rem) | 1.15 / -0.025em / 620 | Page and card titles |
| `text-heading` | 1.1875rem | 1.3 / -0.015em / 600 | Panel headings |
| `text-subheading` | 0.96875rem | 1.4 / -0.008em / 600 | Small headings |
| `text-lead` | clamp(1.0625rem → 1.25rem) | 1.55 | Intro paragraphs |
| `text-body` | 0.9375rem | 1.6 | Body and UI |
| `text-small` | 0.8125rem | 1.5 | Secondary text |
| `text-label` | 0.75rem | 1.35 / 560 | Labels and meta |
| `text-metric` / `text-metric-sm` | clamp(2.5rem → 3.5rem) / 1.5rem | 1 / -0.04em / 600 | Scores |

- **Mona Sans** (variable weight and width, `next/font`) for display and UI. Display text uses `font-variation-settings: "wdth" 108` through the `ds-display` utility.
- **Geist Mono** (already loaded) for timers, IDs and token names only.
- Emphasis inside headlines (`<em>`) uses the same family. In Precision it is the accent colour, not italic.

## 6. Shape, surfaces, layout and motion

- **Radii:** control and button 10px, card and overlay 14px, badge 6px, bezel 22px. `rounded-item` (control minus 4px) for rows inside menus and segmented tabs.
- **Surfaces:** `ds-surface` = panel colour, 1px `line` border, a white inner highlight and the ink-tinted `shadow-card`. Elevation scale: `shadow-control`, `shadow-card`, `shadow-raised`, `shadow-overlay`, all diffuse and tinted, never pure black.
- **Bezel:** `ds-bezel` + `ds-bezel-core` frame product previews in a hairline tray with a concentric inner radius. Use for product shots only, not for ordinary cards.
- **Layout:** one top navigation, no sidebar. Content column 76rem (`ds-container`), reading width 40rem, page gutter clamp(1.25rem, 4vw, 2.5rem), section rhythm clamp(4.5rem → 8.5rem), 12-column grid on large screens, single column on mobile.
- **Motion:** `ease-standard` cubic-bezier(0.2, 0, 0, 1), `ease-enter` cubic-bezier(0.16, 1, 0.3, 1). Durations 120 / 180 / 320ms. Colour transitions only on hover, opacity and translate on enter, nothing looping. Transforms run only under `motion-safe`.
- **Focus:** `focus-ring` utility, 2px `--color-focus` outline with 2px offset. Inputs switch to a brand border with a tint halo.
- **Icons:** Lucide (already a dependency), stroke 1.75 (2 for small status glyphs), `currentColor`.

## 7. How directions are applied

Every utility reads a CSS variable, so a direction is just a set of variable overrides on a wrapper element (`style={direction.vars}`). The preview uses this to switch directions without changing markup.

One caveat: a variable that references another (for example `--emphasis-color: var(--color-brand)`) is resolved where it is declared. A subtree that changes `--color-brand` must also restate those derived variables. Derived values used inside components (the bezel inner radius, `rounded-item`) are calculated in the utilities for the same reason.

## 8. Components (`components/ui`)

| Component | Notes |
|---|---|
| `Button` | `primary` (ink action), `accent` (brand, rare), `secondary`, `ghost`, `danger`, `link`. Sizes `sm` 32, `md` 40, `lg` 48, `icon`. `loading` keeps the label and sets `aria-busy` |
| `Card` (+ header / title / description / content / footer) | Uses `ds-surface` |
| `Input`, `Textarea`, `Select` (native) | Control border 3.4:1. `aria-invalid` turns the border to danger |
| `Label`, `FieldHint`, `FieldError`, `Field` | Label above, hint or error below. Never placeholder-as-label |
| `Checkbox`, `Switch` | Native checkbox with `accent-brand`; switch off track meets 3:1 |
| `Badge` | neutral / brand / success / warning / danger / info / memory |
| `Tabs` | WAI-ARIA with roving focus. `underline` or `segmented` |
| `DropdownMenu` | Menu-button pattern, keyboard support, flips to stay in the viewport. Used for the avatar menu |
| `Dialog` | Native `<dialog>`: focus trap and Escape handled by the browser |
| `Tooltip` | Hover and focus, Escape dismisses, clamped to the viewport |
| `Alert`, `Spinner`, `Skeleton` | Inline status and loading |

`cn()` (`lib/utils/helpers.ts`) teaches `tailwind-merge` the custom text sizes, radii and shadows so it doesn't drop classes like `text-on-brand` next to `text-small`.

## 9. The preview

- **Selector:** floating toolbar at the bottom. Click, use the arrow keys inside it, or press 1, 2 or 3 anywhere. The choice is kept in `?d=` for sharing.
- **Details:** the panel button opens a sheet with the concept, fonts, key colours, strengths, trade-offs and a comparison of all three.
- **System sheet:** below the site footer, the selected direction's type ramp, palette (read from the rendered CSS) with live contrast checks, and every shared component.
- **Gating:** returns 404 in production unless `ENABLE_DESIGN_PREVIEW=true`; `noindex`. All content is labelled sample data, and product buttons are inert.

## 10. Migration plan (after approval)

1. Approve a direction in `/design-preview`. If it is not Precision, move that direction's overrides from `directions.ts` into the `@theme static` block.
2. Redesign one page at a time, starting with the landing page. Wrap the page in `ds-page` and use only the new utilities and `components/ui`. Set `preload: true` in `app/fonts.ts` once most pages use Mona Sans (it is declared in the root layout, so preloading earlier would make every page download it).
3. Product pages adopt the top-nav shell (Interviews, Reports, Memory, Analytics, plus the avatar menu with My Dashboard, Profile & Settings and Sign out).
4. After the last page migrates, delete the legacy `@theme` block, legacy utilities and the Bricolage / Material Symbols loading, then retire `DESIGN.MD`.

## 11. Open decisions

1. Approve a direction (recommended: Precision).
2. Approve Mona Sans as the brand typeface.
3. Logo: keep the current mark as is (fits Precision), or brief a refresh later.
4. Signed-out navigation: landing anchors (as in the preview) or product links that lead to sign-in?
5. Dark surface for the live interview screen only, or light everywhere?
