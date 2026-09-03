# Design: brand identity overhaul

**Date:** 2026-09-02
**Status:** Awaiting review
**Builds on:** [`2026-09-01-tanstack-foundation-design.md`](./2026-09-01-tanstack-foundation-design.md)
**Salvage reference:** [`2026-09-01-content-and-feature-inventory.md`](./2026-09-01-content-and-feature-inventory.md)

---

## 1. Context

The TanStack Router foundation is complete on `rebuild/tanstack-foundation`: four typed
routes, all content in typed repo modules, no runtime data fetching, 26 tests green.
Its styling is a deliberate placeholder — a single 34-line `global.css` — held back from
`master` precisely so this overhaul could land on top of it and ship together.

This spec applies the Tiago Correia brand identity: Deep Navy and Golden Hour, Poppins
and Inter, a gear-and-compass mark, and the positioning
**ARCHITECT · ENGINEER · STRATEGIST**.

The source is a brand board supplied as a flattened PNG. It defines twelve colours in
three tiers, two typefaces, three icon variants, five brand principles, six usage tips,
and a set of decorative devices.

---

## 2. Decisions

| # | Decision | Rationale |
|---|---|---|
| D1 | Recreate the mark as flat vector SVG | No source SVG exists; the board itself specifies flat "Solid" and "Reverse" variants, so flat is part of the system, not a downgrade |
| D2 | Reframe the frame, keep the warmth | Adopt the board's positioning for title/hero/strapline/footer; every biography paragraph stays verbatim |
| D3 | Dark theme only | The board's usage tips prescribe Deep Navy as the dominant digital background; Light Parchment appears on print pieces |
| D4 | Self-host Poppins + Inter as woff2 | No third-party request, no visitor data to Google, no CDN dependency; both are SIL Open Font Licence |
| D5 | Design tokens + CSS Modules | One source of truth for the brand; component styles colocated with components; zero new dependencies (Vite has CSS Modules built in) |
| D6 | Adopt the signature devices, not the board's density | The board is a showcase; its own tips ask for "clean, spacious and purposeful" layouts |
| D7 | Links use Aether Teal, not Arcane Blue | Arcane Blue fails WCAG AA on Deep Navy — see §3 |

**No new dependencies.** Everything here is CSS, SVG, static font files, and existing tooling.

---

## 3. Palette roles

The board names twelve colours but does not say which may carry text. Measured against
WCAG 2.1 on Deep Navy `#0F172A`:

| Colour | Ratio | Body (4.5) | Large/UI (3.0) |
|---|---:|---|---|
| Light Parchment `#F8F5E9` | 16.35 | PASS | PASS |
| Mist `#F1F5F9` | 16.30 | PASS | PASS |
| Golden Hour `#F4B740` | 9.94 | PASS | PASS |
| Aether Teal `#06B6D4` | 7.35 | PASS | PASS |
| Slate `#64748B` | 3.75 | **FAIL** | PASS |
| Arcane Blue `#2563EB` | 3.45 | **FAIL** | PASS |
| Eldritch Purple `#7C3AED` | 3.13 | **FAIL** | PASS |
| Warm Wood `#92400E` | 2.52 | **FAIL** | **FAIL** |
| Stone `#475569` | 2.36 | **FAIL** | **FAIL** |
| Graphite `#334155` | 1.72 | **FAIL** | **FAIL** |

### The conflict, and its resolution

Two usage tips on the board contradict each other on screen: *"Use Arcane Blue for
trust, technology and links"* and *"Maintain high contrast for accessibility."* Arcane
Blue on Deep Navy is 3.45:1 — inline links in it would be the least readable text on
the page.

**Resolution: Aether Teal `#06B6D4` (7.35:1) becomes the interactive colour.** It reads
as cool and technological — the signal the tip wanted — while passing AA comfortably.

Arcane Blue keeps a real role rather than being discarded: it passes on light surfaces
(**4.73:1** on Light Parchment), so it remains the colour for print, the light business
card, and non-text UI where 3:1 suffices.

### Assigned roles

| Role | Value |
|---|---|
| Page background | Deep Navy `#0F172A` |
| Recessed surface (cards, footer) | Charcoal `#0B0F16` |
| Border, rule | Graphite `#334155` |
| Body text | Light Parchment `#F8F5E9` |
| Muted text (tags, dates, meta) | Light Parchment at 72% over navy → `#B7B7B4`, 8.88:1 |
| Accent, active nav, section label, focus ring | Golden Hour `#F4B740` |
| Link, interactive | Aether Teal `#06B6D4` |
| Status / inactive marker | Warm Wood `#92400E` as a **badge background** with Light Parchment text (6.49:1) |

Warm Wood must not be used as a lone border to signal status: against Deep Navy it
measures **2.52:1**, below the 3:1 required of a meaningful UI boundary. As a filled
badge it is fine, because the parchment text inside carries the meaning and passes
comfortably.

Both text tokens were also checked against the Charcoal card surface, since cards are
the second background in the system: muted parchment 9.55:1, Aether Teal 7.91:1. Both
pass on either surface, so no surface-specific overrides are needed.

Muted text is expressed as a resolved hex token, not an opacity, so its contrast is
verifiable by the test in §9 rather than dependent on what sits behind it.

---

## 4. Typography

- **Headings:** Poppins 600
- **Body:** Inter 400, with Inter 600 for emphasis
- Self-hosted woff2 in `public/fonts/`, `font-display: swap`, the two above-the-fold
  faces preloaded from `index.html`
- Fluid scale via `clamp()`

The board's heavy tracking is a signature and is reproduced:

| Element | Treatment |
|---|---|
| Wordmark `TIAGO CORREIA` | Poppins 600, uppercase, `letter-spacing: 0.25em` |
| Strapline, section labels | Uppercase, `letter-spacing: 0.15em`, Golden Hour, small |
| Footer motto | Uppercase, `letter-spacing: 0.2em` |

---

## 5. The mark

One flat SVG component driven by `currentColor`, which yields all three board variants
from a single file:

| Variant | How |
|---|---|
| Primary | `color: Golden Hour` |
| Solid | `color: Deep Navy` |
| Reverse | Deep Navy mark on a Light Parchment disc |

Geometry: an eight-tooth gear ring, an inner circle, and a compass needle on the
diagonal. It also becomes `public/favicon.svg`.

**The mark's shape is reviewed with the user before it is wired into every surface.**
Redrawing a mark from a raster is the element most likely to need iteration, so the plan
must present a first version and get sign-off before proceeding.

---

## 6. Signature devices

Four devices carry the brand and are used sparingly:

1. **Gold hairline terminating in a rotated square** — the section divider
2. **Letter-spaced gold uppercase labels** — section headers
3. **Gold diamond separators** — between strapline and footer words
4. **Faint concentric circles** — behind the mark on the home hero only

Everything else is space.

---

## 7. Page treatment

**Header** — mark, `TIAGO CORREIA` wordmark, and the `ARCHITECT • ENGINEER • STRATEGIST`
strapline with diamond separators. Nav in letter-spaced caps; the active item is Golden
Hour. The URL-derived active state from the foundation is preserved exactly — restyling
must not reintroduce the click-handler bug that rebuild fixed.

**Uppercase is presentational only**, applied with `text-transform` in CSS. The
underlying strings — "About me", "Stuff I make", "Stuff I talk about" — are unchanged,
so accessible names and the existing nav tests are unaffected. Do not uppercase the
source strings.

**Home** — the mark at scale over faint concentric circles, then:

> **ARCHITECTING SOLUTIONS. BUILDING IMPACT.**
> Hi! I'm Tiago and I make things!
> Also I mentor kids with their programming.
> And I talk way too much about containers...

Every existing word is retained; the board's positioning line sits above them as the
frame.

**About** — gold section label; biography at a readable measure (~65ch); `minime.jpg`
framed with a gold hairline; social icons in the mark's visual language. The chart keeps
its behaviour and its URL-driven mode.

**Projects / Talks** — Charcoal cards on Deep Navy with Graphite borders. Gold
hairline-and-diamond dividers between status bands. Tags in muted parchment. The
`source` ribbon becomes a gold corner rule rather than a rotated banner.

**Footer** — Charcoal band, `BUILD • LEARN • EXPLORE • SHARE` in letter-spaced caps with
diamond separators.

---

## 8. Content changes

| Item | From | To |
|---|---|---|
| Document title | `Dosaki's Lair` | `Tiago Correia · Architect, Engineer, Strategist` |
| Meta description | "Personal about website" | "Tiago Correia — architect, engineer and strategist. Things I make, things I talk about." |
| `theme-color`, manifest | `#2e2836` | `#0F172A` |
| Home hero | "Hi! I'm Tiago and I make things!" alone | Positioning line above it; the existing lines retained beneath |
| Footer | none | `BUILD • LEARN • EXPLORE • SHARE` |

**All seven biography paragraphs stay verbatim**, including the spelling "monicker" and
the containers line.

### Two repairs to the foundation's content model

The foundation's flat `{ text, href? }` paragraph shape lost two things the inventory
recorded. Both are fixed here:

1. The `(yes that's me)` aside returns **beside** the sentence it belongs to, rather than
   after the photo.
2. The `<span className="highlight">` emphasis on "Dosaki" returns. The content part type
   gains an optional `emphasis` variant alongside `href`.

---

## 9. Architecture

```
src/styles/
  tokens.css              brand as custom properties — the single source of truth
  global.css              reset, base elements, typography, focus
src/components/
  Mark.tsx                the SVG mark, currentColor-driven
  <Component>.module.css  colocated component styles
public/fonts/             self-hosted woff2
public/favicon.svg        the mark
```

`tokens.css` is the only file where a raw hex appears. Component styles reference
custom properties exclusively, so a palette change is a single-file edit.

---

## 10. Testing

The existing 26 tests must keep passing unchanged — this overhaul is presentation, and
any test that breaks indicates the restyle changed behaviour.

New tests:

1. **Contrast unit test.** Parse the hex values out of `tokens.css` and assert the WCAG
   ratios in §3: body text ≥ 4.5:1, muted text ≥ 4.5:1, interactive ≥ 4.5:1, focus ring
   ≥ 3:1, all against their stated backgrounds. A future palette edit that breaks
   accessibility then fails CI rather than shipping. This is the highest-value test in
   the overhaul because it encodes the one decision the board itself got wrong.
2. **The mark renders** and is correctly hidden from assistive technology when decorative,
   labelled when it is the home link.
3. **The header exposes the strapline**, and nav active state still derives from the URL.

---

## 11. Out of scope

- **`big-logo.jpg`, the OG/social card**, still shows the old logo. Replacing it needs a
  rendered raster and is deferred to a follow-up; `index.html` keeps pointing at it.
- **`favicon.ico`** stays as a legacy fallback and continues to show the old logo;
  `favicon.svg` carries the new mark for browsers that support it.
- **The chart's ten language colours** are language-identity colours (JavaScript yellow,
  Go cyan) and carry meaning, so they are retained. Only the chart's chrome — title,
  labels, tooltip — is rebranded. The implementer must load the `dataviz` skill before
  touching chart colours.
- **Light theme.** Not built (D3).
- **No new pages or routes.** The four-route structure is unchanged.

### Asset removals

- `public/images/t_snow.jpg` — already unused since the foundation rebuild dropped the
  fixed splash. Delete.
- `public/images/logo.png` — the old mark, unused once `Mark.tsx` lands. Delete.
- `public/images/minime.jpg` — **keep**, still used on About.
- `public/images/big-logo.jpg` — **keep**, still referenced as the OG image.

---

## 12. Risks

| Risk | Mitigation |
|---|---|
| The redrawn mark does not match the board closely enough | Sign-off gate before it is wired in (§5) |
| Restyling silently changes behaviour | The 26 existing tests must pass untouched; any failure is a signal, not a thing to edit away |
| Self-hosted fonts bloat the bundle | Subset to Latin, woff2 only, three faces total; measure and report |
| Token sprawl — colours creeping into component CSS | Contrast test plus the rule that `tokens.css` is the only file containing raw hex, with three justified exceptions: `public/favicon.svg`, the echarts chrome block in `LanguageChart.tsx` (echarts reads plain TypeScript, not CSS custom properties), and one deliberate literal in `contrast.test.ts` |
| The board's decorative density tempting an over-designed result | D6, and the board's own "clean, spacious and purposeful" tip as the tiebreaker |
