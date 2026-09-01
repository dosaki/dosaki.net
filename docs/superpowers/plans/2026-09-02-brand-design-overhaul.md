# Brand Design Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the Tiago Correia brand identity — Deep Navy and Golden Hour, Poppins and Inter, a gear-and-compass mark — to the completed TanStack Router foundation, replacing its placeholder styling.

**Architecture:** A token layer (`tokens.css`) is the single source of truth for the brand and the only file containing raw hex. `global.css` carries reset, base elements and typography. Component-specific styling lives in colocated CSS Modules, which Vite supports with no configuration. A contrast unit test parses the tokens and asserts WCAG ratios, so an accessibility regression fails CI.

**Tech Stack:** Vite 8, React 19, TypeScript 7, TanStack Router, Vitest 4, CSS Modules (built into Vite), self-hosted woff2

**Spec:** [`docs/superpowers/specs/2026-09-02-brand-design-overhaul-design.md`](../specs/2026-09-02-brand-design-overhaul-design.md)
**Brand inventory:** [`docs/superpowers/specs/2026-09-01-content-and-feature-inventory.md`](../specs/2026-09-01-content-and-feature-inventory.md)

## Global Constraints

- **Branch:** `rebuild/tanstack-foundation`. NEVER commit or push to `master` — pushing there triggers a production deploy. Do not push anywhere.
- **No new dependencies.** CSS Modules are built into Vite. No Tailwind, no CSS-in-JS, no icon or font packages.
- **`tokens.css` is the ONLY file that may contain a raw hex colour.** Everything else references `var(--…)`.
- **The 26 existing tests must keep passing.** This overhaul is presentation; a test that breaks means behaviour changed. Fix the code, never the test — unless a task here explicitly says otherwise.
- **Dark theme only.** No `prefers-color-scheme` blocks, no theme toggle.
- **Uppercase is presentational** — `text-transform` in CSS. Never uppercase the source strings; accessible names must stay "About me", "Stuff I make", "Stuff I talk about".
- **Build output stays `build/`.** `terraform/` untouched.
- **Never use a generated UUID as a React key.**
- Test output must stay pristine; `npx tsc --noEmit` must stay at zero errors.
- **Do not run `npm run build` casually** — it invokes `scripts/generate-languages.mjs`, which rewrites `src/content/languages.generated.ts`. If it changes, restore it with `git checkout -- src/content/languages.generated.ts`.

### The palette, with measured contrast on Deep Navy `#0F172A`

| Token | Value | Role | Ratio |
|---|---|---|---|
| `--color-bg` | `#0F172A` | page | — |
| `--color-surface` | `#0B0F16` | cards, footer | — |
| `--color-border` | `#334155` | rules, card borders | 1.72 (non-text) |
| `--color-text` | `#F8F5E9` | body | 16.35 |
| `--color-text-muted` | `#B7B7B4` | tags, dates | 8.88 |
| `--color-accent` | `#F4B740` | section labels, active nav, focus | 9.94 |
| `--color-link` | `#06B6D4` | links, interactive | 7.35 |
| `--color-badge-bg` | `#92400E` | status badge fill | — |
| `--color-badge-text` | `#F8F5E9` | status badge text | 6.49 on badge |

**Arcane Blue `#2563EB` is deliberately NOT the link colour** — it measures 3.45:1 on Deep Navy and fails WCAG AA. This is the spec's one intentional departure from the brand board. Do not "correct" it back.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/styles/tokens.css` | The brand as custom properties; the only raw hex in the codebase |
| `src/styles/global.css` | Reset, base elements, typography, focus, font-face |
| `src/styles/layout.module.css` | Header, nav, footer, page shell |
| `src/styles/page.module.css` | Shared page devices: section label, hairline rule, hero |
| `src/styles/__tests__/contrast.test.ts` | Parses tokens, asserts WCAG ratios |
| `src/components/Mark.tsx` | The gear-and-compass SVG, `currentColor`-driven |
| `src/components/ProjectCard.module.css` | Project card |
| `src/components/TalkCard.module.css` | Talk card |
| `public/fonts/*.woff2` | Self-hosted Inter (variable) and Poppins 600 |
| `public/favicon.svg` | The mark |

**CSS Modules must not live under `src/routes/`** — that directory is scanned by the router plugin. Route-level styling goes in `src/styles/*.module.css` and is imported by the route file.

---

## Task 1: Design tokens and the contrast test

The contrast test comes first and is written TDD, because it is the guard rail every later task depends on. It encodes the one decision the brand board itself got wrong.

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/__tests__/contrast.test.ts`
- Modify: `src/styles/global.css`, `src/main.tsx`

**Interfaces:**
- Consumes: nothing
- Produces: the custom properties named in Global Constraints, importable via `src/styles/global.css`

- [ ] **Step 1: Write the failing contrast test**

`src/styles/__tests__/contrast.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

/** Relative luminance per WCAG 2.1. */
function luminance(hex: string): number {
  const h = hex.replace('#', '')
  const channels = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
  const [r, g, b] = channels.map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  )
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)]
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

/** Every `--name: #hex;` declared in tokens.css. */
function readTokens(): Record<string, string> {
  // package.json sets "type": "module", so __dirname does not exist here.
  const css = readFileSync(new URL('../tokens.css', import.meta.url), 'utf8')
  const tokens: Record<string, string> = {}
  for (const [, name, value] of css.matchAll(
    /--([\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g,
  )) {
    tokens[name] = value
  }
  return tokens
}

describe('brand tokens meet WCAG AA', () => {
  const t = readTokens()

  it('declares every colour token', () => {
    for (const name of [
      'color-bg', 'color-surface', 'color-border', 'color-text',
      'color-text-muted', 'color-accent', 'color-link',
      'color-badge-bg', 'color-badge-text',
    ]) {
      expect(t[name], `missing --${name}`).toMatch(/^#[0-9a-fA-F]{6}$/)
    }
  })

  it.each([
    ['body text on page', 'color-text', 'color-bg'],
    ['body text on card', 'color-text', 'color-surface'],
    ['muted text on page', 'color-text-muted', 'color-bg'],
    ['muted text on card', 'color-text-muted', 'color-surface'],
    ['link on page', 'color-link', 'color-bg'],
    ['link on card', 'color-link', 'color-surface'],
    ['accent on page', 'color-accent', 'color-bg'],
    ['badge text on badge', 'color-badge-text', 'color-badge-bg'],
  ])('%s reaches 4.5:1', (_label, fg, bg) => {
    expect(contrast(t[fg], t[bg])).toBeGreaterThanOrEqual(4.5)
  })

  it('the focus ring reaches 3:1 against the page', () => {
    expect(contrast(t['color-accent'], t['color-bg'])).toBeGreaterThanOrEqual(3)
  })

  it('rejects Arcane Blue as a text colour on navy', () => {
    // The brand board says "use Arcane Blue for links", but it measures 3.45:1
    // on Deep Navy. This test documents why the spec overrides the board.
    expect(contrast('#2563EB', t['color-bg'])).toBeLessThan(4.5)
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- contrast`
Expected: FAIL — `ENOENT` for `tokens.css`, which does not exist yet.

- [ ] **Step 3: Write `src/styles/tokens.css`**

```css
/*
 * Brand tokens — Tiago Correia.
 * THIS IS THE ONLY FILE IN THE CODEBASE THAT MAY CONTAIN A RAW HEX COLOUR.
 * Contrast ratios are asserted in src/styles/__tests__/contrast.test.ts.
 */
:root {
  /* Colour — from the brand board's Primary/Secondary/Neutral tiers */
  --color-bg: #0F172A;          /* Deep Navy       page background */
  --color-surface: #0B0F16;     /* Charcoal        cards, footer */
  --color-border: #334155;      /* Graphite        rules, borders (never text) */
  --color-text: #F8F5E9;        /* Light Parchment body        16.35:1 */
  --color-text-muted: #B7B7B4;  /* Parchment @72%  meta         8.88:1 */
  --color-accent: #F4B740;      /* Golden Hour     accent       9.94:1 */
  --color-link: #06B6D4;        /* Aether Teal     links        7.35:1 */
  --color-badge-bg: #92400E;    /* Warm Wood       status fill */
  --color-badge-text: #F8F5E9;  /* Parchment       on badge     6.49:1 */

  /* Type */
  --font-heading: 'Poppins', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
  --track-wordmark: 0.25em;
  --track-label: 0.15em;
  --track-motto: 0.2em;
  --size-hero: clamp(1.75rem, 1.1rem + 3.2vw, 3rem);
  --size-h1: clamp(1.5rem, 1.1rem + 2vw, 2.25rem);
  --size-h2: clamp(1.125rem, 1rem + 0.6vw, 1.375rem);
  --size-small: 0.8125rem;

  /* Space */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 1rem;
  --space-4: 1.5rem;
  --space-5: 2.5rem;
  --space-6: 4rem;
  --measure: 65ch;
  --shell: 64rem;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- contrast`
Expected: PASS — 11 assertions.

- [ ] **Step 5: Rewrite `src/styles/global.css` on the tokens**

Replaces the placeholder stylesheet entirely.

```css
@import './tokens.css';

*, *::before, *::after { box-sizing: border-box; }

html, body { margin: 0; padding: 0; }

body {
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: 1rem;
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3 {
  font-family: var(--font-heading);
  font-weight: 600;
  line-height: 1.15;
  margin: 0 0 var(--space-3);
}

h1 { font-size: var(--size-h1); }
h2 { font-size: var(--size-h2); }

p { margin: 0 0 var(--space-3); }

a {
  color: var(--color-link);
  text-decoration-color: color-mix(in srgb, var(--color-link) 45%, transparent);
  text-underline-offset: 0.15em;
}
a:hover { text-decoration-color: currentColor; }

:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
  border-radius: 2px;
}

img { max-width: 100%; height: auto; }

.pixelated { image-rendering: pixelated; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 6: Confirm `main.tsx` still imports the stylesheet**

`src/main.tsx` already has `import './styles/global.css'`. Verify it is present and unchanged; `tokens.css` arrives through the `@import` at the top of `global.css`.

Run: `grep -n "global.css" src/main.tsx`
Expected: one match.

- [ ] **Step 7: Run the full suite and typecheck**

```bash
npm test
npx tsc --noEmit
```

Expected: all tests pass (26 existing + 11 new), zero type errors, output pristine.

- [ ] **Step 8: Commit**

```bash
git add src/styles
git commit -m "feat: add brand design tokens with contrast guard rail"
```

---

## Task 2: Self-hosted fonts

**Files:**
- Create: `public/fonts/inter-variable.woff2`, `public/fonts/poppins-600.woff2`
- Modify: `src/styles/global.css`, `index.html`

**Interfaces:**
- Consumes: `--font-heading`, `--font-body` from Task 1
- Produces: `Poppins` and `Inter` available as `font-family` values

Both faces are SIL Open Font Licence, so committing them is permitted.

- [ ] **Step 1: Download the woff2 files**

Google's CSS API returns latin-subset woff2 URLs when given a modern browser UA. Inter is served as a variable font, so one file covers 400 and 600.

```bash
mkdir -p public/fonts
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
curl -s -A "$UA" "https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Poppins:wght@600&display=swap" -o /tmp/gf.css

python3 - <<'PY'
import re, urllib.request
css = open('/tmp/gf.css').read()
ua = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'}
want = {'Inter': 'public/fonts/inter-variable.woff2', 'Poppins': 'public/fonts/poppins-600.woff2'}
seen = set()
for sub, block in re.findall(r"/\*\s*([\w\[\]-]+)\s*\*/\s*@font-face\s*{(.*?)}", css, re.S):
    if sub != 'latin':
        continue
    fam = re.search(r"font-family:\s*'([^']+)'", block).group(1)
    if fam in seen or fam not in want:
        continue
    url = re.search(r"url\((https://[^)]+\.woff2)\)", block).group(1)
    data = urllib.request.urlopen(urllib.request.Request(url, headers=ua)).read()
    open(want[fam], 'wb').write(data)
    print(f"{fam}: {len(data)/1024:.1f} KB -> {want[fam]}")
    seen.add(fam)
PY
```

Expected: Inter ~47 KB, Poppins ~8 KB. If either file is under 1 KB the download failed — stop and report rather than committing a stub.

- [ ] **Step 2: Verify the files are real woff2**

```bash
ls -la public/fonts/
python3 -c "
for f in ('public/fonts/inter-variable.woff2','public/fonts/poppins-600.woff2'):
    sig = open(f,'rb').read(4)
    assert sig == b'wOF2', (f, sig)
    print(f, 'OK')"
```

Expected: both print `OK`. A `wOF2` magic number confirms these are woff2, not an HTML error page.

- [ ] **Step 3: Add `@font-face` to `global.css`**

Insert immediately after the `@import './tokens.css';` line:

```css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-variable.woff2') format('woff2-variations');
  font-weight: 400 600;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Poppins';
  src: url('/fonts/poppins-600.woff2') format('woff2');
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}
```

- [ ] **Step 4: Preload both faces in `index.html`**

Insert inside `<head>`, before the `<title>`:

```html
    <link rel="preload" href="/fonts/inter-variable.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/fonts/poppins-600.woff2" as="font" type="font/woff2" crossorigin />
```

- [ ] **Step 5: Verify the fonts are served by the dev server**

```bash
(npx vite --port 4180 > /tmp/vite.log 2>&1 &) ; sleep 6
for f in inter-variable poppins-600; do
  printf "%-18s %s\n" "$f" "$(curl -s -o /dev/null -w '%{http_code} %{content_type}' http://localhost:4180/fonts/$f.woff2)"
done
lsof -ti:4180 | xargs kill
```

Expected: `200 font/woff2` for both.

- [ ] **Step 6: Run tests and commit**

```bash
npm test
git add public/fonts src/styles/global.css index.html
git commit -m "feat: self-host Inter and Poppins as woff2"
```

---

## Task 3: The mark

**This task ends with a sign-off gate.** The mark is redrawn from a raster brand board and is the element most likely to need iteration, so it is presented to the user before being wired into other surfaces.

**Files:**
- Create: `src/components/Mark.tsx`, `src/components/__tests__/Mark.test.tsx`, `scripts/generate-mark.mjs`, `public/favicon.svg`

**Interfaces:**
- Consumes: nothing
- Produces: `<Mark size?={number} title?={string} className?={string} />` — an SVG in a `0 0 100 100` viewBox, filled with `currentColor`

The geometry is generated parametrically so that sign-off iteration means changing a number, not redrawing a path. The committed component carries the resulting path data inline; the generator exists to regenerate it.

- [ ] **Step 1: Write the failing test**

`src/components/__tests__/Mark.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Mark } from '../Mark'

describe('Mark', () => {
  it('renders an svg on the brand viewBox', () => {
    const { container } = render(<Mark />)
    expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 100 100')
  })

  it('inherits colour rather than hardcoding one', () => {
    const { container } = render(<Mark />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('fill', 'currentColor')
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{6}/)
  })

  it('is hidden from assistive tech unless given a title', () => {
    const { container, rerender } = render(<Mark />)
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')

    rerender(<Mark title="Tiago Correia — home" />)
    expect(screen.getByRole('img', { name: 'Tiago Correia — home' })).toBeInTheDocument()
  })

  it('draws all three elements of the mark', () => {
    const { container } = render(<Mark />)
    expect(container.querySelectorAll('path')).toHaveLength(2) // gear, needle
    expect(container.querySelectorAll('circle')).toHaveLength(1) // inner ring
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- Mark`
Expected: FAIL — `Failed to resolve import "../Mark"`.

- [ ] **Step 3: Write the generator**

`scripts/generate-mark.mjs`. Running it prints the two path strings; the parameters at the top are what you adjust during sign-off.

```javascript
// Generates the gear-and-compass path data for src/components/Mark.tsx.
// Adjust the parameters, re-run, and paste the output into the component.
//   node scripts/generate-mark.mjs

const C = 50
const TEETH = 8
const R_TIP = 46        // tooth tip radius
const R_ROOT = 38       // valley radius
const R_BAND = 28       // inner edge of the gear ring
const TIP_DEG = 22      // angular width of a tooth at its tip
const ROOT_DEG = 30     // angular width at its base
const NEEDLE = { top: [63, 4], bottom: [34, 96], halfWidth: 4.8, shoulder: 0.56 }

const pt = (r, deg) => {
  const a = ((deg - 90) * Math.PI) / 180
  return [C + r * Math.cos(a), C + r * Math.sin(a)]
}
const f = ([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`

function gear() {
  const step = 360 / TEETH
  const d = []
  for (let i = 0; i < TEETH; i++) {
    const c = i * step
    d.push(`${i === 0 ? 'M' : 'L'} ${f(pt(R_ROOT, c - ROOT_DEG / 2))}`)
    d.push(`L ${f(pt(R_TIP, c - TIP_DEG / 2))}`)
    d.push(`L ${f(pt(R_TIP, c + TIP_DEG / 2))}`)
    d.push(`L ${f(pt(R_ROOT, c + ROOT_DEG / 2))}`)
    d.push(`A ${R_ROOT} ${R_ROOT} 0 0 1 ${f(pt(R_ROOT, (i + 1) * step - ROOT_DEG / 2))}`)
  }
  d.push('Z')
  // Counter-wound hole, cut by fill-rule="evenodd".
  d.push(`M ${C - R_BAND} ${C}`)
  d.push(`A ${R_BAND} ${R_BAND} 0 1 0 ${C + R_BAND} ${C}`)
  d.push(`A ${R_BAND} ${R_BAND} 0 1 0 ${C - R_BAND} ${C}`)
  d.push('Z')
  return d.join(' ')
}

function needle() {
  const [tx, ty] = NEEDLE.top
  const [bx, by] = NEEDLE.bottom
  const [dx, dy] = [tx - bx, ty - by]
  const len = Math.hypot(dx, dy)
  const [ux, uy] = [dx / len, dy / len]
  const [px, py] = [-uy, ux]
  const w = NEEDLE.halfWidth
  const sx = bx + ux * len * NEEDLE.shoulder
  const sy = by + uy * len * NEEDLE.shoulder
  return `M ${tx} ${ty} L ${(sx + px * w).toFixed(2)} ${(sy + py * w).toFixed(2)} ` +
         `L ${bx} ${by} L ${(sx - px * w).toFixed(2)} ${(sy - py * w).toFixed(2)} Z`
}

console.log('GEAR:\n' + gear() + '\n')
console.log('NEEDLE:\n' + needle())
```

- [ ] **Step 4: Write `src/components/Mark.tsx`**

The path data below is the generator's output for the parameters above — verified rendered before this plan was written.

```tsx
/**
 * The gear-and-compass mark. Fills with `currentColor`, which yields all three
 * brand-board variants from one component: gold on navy (primary), navy (solid),
 * and navy on a parchment disc (reverse).
 *
 * Path data is generated by scripts/generate-mark.mjs — adjust the parameters
 * there and re-run rather than editing these strings by hand.
 */
const GEAR =
  'M 40.16 13.29 L 41.22 4.85 L 58.78 4.85 L 59.84 13.29 A 38 38 0 0 1 69.00 17.09 L 75.72 11.86 L 88.14 24.28 L 82.91 31.00 A 38 38 0 0 1 86.71 40.16 L 95.15 41.22 L 95.15 58.78 L 86.71 59.84 A 38 38 0 0 1 82.91 69.00 L 88.14 75.72 L 75.72 88.14 L 69.00 82.91 A 38 38 0 0 1 59.84 86.71 L 58.78 95.15 L 41.22 95.15 L 40.16 86.71 A 38 38 0 0 1 31.00 82.91 L 24.28 88.14 L 11.86 75.72 L 17.09 69.00 A 38 38 0 0 1 13.29 59.84 L 4.85 58.78 L 4.85 41.22 L 13.29 40.16 A 38 38 0 0 1 17.09 31.00 L 11.86 24.28 L 24.28 11.86 L 31.00 17.09 A 38 38 0 0 1 40.16 13.29 Z M 22 50 A 28 28 0 1 0 78 50 A 28 28 0 1 0 22 50 Z'

const NEEDLE = 'M 63 4 L 54.82 45.92 L 34 96 L 45.66 43.04 Z'

interface MarkProps {
  /** Rendered size in pixels. Defaults to 1em so it can sit inline. */
  size?: number
  /** When present the mark is exposed to assistive tech with this label. */
  title?: string
  className?: string
}

export function Mark({ size, title, className }: MarkProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      width={size ?? '1em'}
      height={size ?? '1em'}
      fill="currentColor"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <path fillRule="evenodd" d={GEAR} />
      <circle cx="50" cy="50" r="19" fill="none" stroke="currentColor" strokeWidth="3" />
      <path d={NEEDLE} />
    </svg>
  )
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- Mark`
Expected: PASS, 4 tests.

- [ ] **Step 6: Write `public/favicon.svg`**

Same geometry, gold on navy, as a standalone file.

```bash
python3 - <<'PY'
import re
tsx = open('src/components/Mark.tsx').read()
gear = re.search(r"const GEAR =\s*\n?\s*'([^']+)'", tsx).group(1)
needle = re.search(r"const NEEDLE = '([^']+)'", tsx).group(1)
open('public/favicon.svg','w').write(
f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
<rect width="100" height="100" rx="14" fill="#0F172A"/>
<g fill="#F4B740">
<path fill-rule="evenodd" d="{gear}"/>
<circle cx="50" cy="50" r="19" fill="none" stroke="#F4B740" stroke-width="3"/>
<path d="{needle}"/>
</g></svg>''')
print('favicon.svg written')
PY
```

The favicon is the one place outside `tokens.css` where hex appears; a standalone SVG file cannot read CSS custom properties. Note this in your report.

- [ ] **Step 7: Render previews for sign-off**

```bash
mkdir -p /tmp/markpreview
python3 - <<'PY'
import re
tsx = open('src/components/Mark.tsx').read()
gear = re.search(r"const GEAR =\s*\n?\s*'([^']+)'", tsx).group(1)
needle = re.search(r"const NEEDLE = '([^']+)'", tsx).group(1)
body = (f'<path fill-rule="evenodd" d="{gear}"/>'
        f'<circle cx="50" cy="50" r="19" fill="none" stroke="currentColor" stroke-width="3"/>'
        f'<path d="{needle}"/>')
for name, bg, fg in (('primary','#0F172A','#F4B740'),
                     ('solid','#F8F5E9','#0F172A'),
                     ('reverse','#0F172A','#F8F5E9')):
    open(f'/tmp/markpreview/{name}.svg','w').write(
      f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="260" height="260">'
      f'<rect width="100" height="100" fill="{bg}"/><g color="{fg}" fill="currentColor">{body}</g></svg>')
print('3 variants written')
PY
for v in primary solid reverse; do rsvg-convert -w 260 -h 260 /tmp/markpreview/$v.svg -o /tmp/markpreview/$v.png; done
magick /tmp/markpreview/primary.png /tmp/markpreview/solid.png /tmp/markpreview/reverse.png +append /tmp/markpreview/all.png
# small-size legibility check — the mark must survive as a favicon
rsvg-convert -w 32 -h 32 /tmp/markpreview/primary.svg -o /tmp/markpreview/small.png
magick /tmp/markpreview/small.png -scale 400% /tmp/markpreview/small-zoom.png
echo "previews: /tmp/markpreview/all.png and /tmp/markpreview/small-zoom.png"
```

If `rsvg-convert` or `magick` is unavailable, say so in your report rather than skipping the check.

- [ ] **Step 8: STOP — present the mark for sign-off**

Report status **DONE_WITH_CONCERNS** with the two preview paths, and state plainly that the mark needs the user's eye before it is wired into the header, hero and favicon links. Do NOT proceed to Task 4.

The controller will show the user the renders. If changes are wanted, they arrive as a fix round: adjust the parameters in `scripts/generate-mark.mjs`, re-run it, update the two constants in `Mark.tsx`, regenerate `favicon.svg` and the previews.

- [ ] **Step 9: Commit**

```bash
git add src/components/Mark.tsx src/components/__tests__/Mark.test.tsx scripts/generate-mark.mjs public/favicon.svg
git commit -m "feat: add the gear-and-compass brand mark"
```

---

## Task 4: Header, navigation and footer

**Files:**
- Create: `src/styles/layout.module.css`
- Modify: `src/routes/__root.tsx`
- Modify: `src/routes/__tests__/nav.test.tsx` (add cases only — do not weaken existing ones)

**Interfaces:**
- Consumes: `<Mark>` from Task 3, `site.brand` from Task 5 — **Task 5 has not run yet**, so this task adds the `brand` object to `src/content/site.ts` itself and Task 5 extends it
- Produces: `site.brand = { name, strapline: string[], motto: string[], positioning: string }`

**A trap worth naming.** The existing nav test asserts `findByRole('link', { name: /home/i })`. Today that name comes from the logo image's `alt="Home"`. If you replace the image with `<Mark>` and let the wordmark text supply the name, the accessible name becomes "TIAGO CORREIA" and that test breaks. The fix is an explicit `aria-label` on the home link — not a change to the test.

- [ ] **Step 1: Add the brand strings to `src/content/site.ts`**

Add as a new top-level key inside the exported `site` object, before `titles`:

```typescript
  brand: {
    name: 'Tiago Correia',
    strapline: ['Architect', 'Engineer', 'Strategist'],
    motto: ['Build', 'Learn', 'Explore', 'Share'],
    positioning: 'Architecting solutions. Building impact.',
  },
```

Strings are stored in sentence case; the uppercase is applied with `text-transform` in CSS so accessible names stay readable.

- [ ] **Step 2: Write the failing tests**

Append to `src/routes/__tests__/nav.test.tsx`, inside the existing `describe`:

```tsx
  it('gives the home link an accessible name even though the mark is decorative', async () => {
    renderAt('/')
    const home = await screen.findByRole('link', { name: /home/i })
    expect(home).toHaveAttribute('href', '/')
  })

  it('shows the wordmark and strapline', async () => {
    renderAt('/')
    expect(await screen.findByText('Tiago Correia')).toBeInTheDocument()
    for (const word of ['Architect', 'Engineer', 'Strategist']) {
      expect(screen.getByText(word)).toBeInTheDocument()
    }
  })

  it('shows the footer motto', async () => {
    renderAt('/')
    const footer = await screen.findByRole('contentinfo')
    for (const word of ['Build', 'Learn', 'Explore', 'Share']) {
      expect(within(footer).getByText(word)).toBeInTheDocument()
    }
  })
```

Add `within` to the existing import from `@testing-library/react`.

- [ ] **Step 3: Run to verify they fail**

Run: `npm test -- nav`
Expected: FAIL — no wordmark, no strapline, no `contentinfo` landmark.

- [ ] **Step 4: Write `src/styles/layout.module.css`**

```css
.shell {
  max-width: var(--shell);
  margin: 0 auto;
  padding: var(--space-4) var(--space-3);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.header { display: flex; flex-direction: column; gap: var(--space-4); }

.identity {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  color: var(--color-accent);
  text-decoration: none;
}
.identity:hover { color: var(--color-accent); }

.mark { flex: none; }

.wordmark {
  font-family: var(--font-heading);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: var(--track-wordmark);
  color: var(--color-accent);
  font-size: var(--size-h2);
  margin: 0;
}

.strapline {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: center;
  margin: var(--space-1) 0 0;
  padding: 0;
  list-style: none;
  font-size: var(--size-small);
  text-transform: uppercase;
  letter-spacing: var(--track-label);
  color: var(--color-text-muted);
}
.strapline li + li::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 4px;
  margin-right: var(--space-2);
  transform: rotate(45deg);
  background: var(--color-accent);
}

.nav {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  list-style: none;
  margin: 0;
  padding: var(--space-3) 0 0;
  border-top: 1px solid var(--color-border);
}
.nav a {
  color: var(--color-text);
  text-decoration: none;
  font-size: var(--size-small);
  text-transform: uppercase;
  letter-spacing: var(--track-label);
}
.nav a:hover { color: var(--color-link); }
.nav a.active { color: var(--color-accent); font-weight: 600; }

.main { flex: 1; }

.footer {
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  margin: 0 calc(-1 * var(--space-3)) calc(-1 * var(--space-4));
  padding: var(--space-4) var(--space-3);
}
.motto {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-4);
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: var(--size-small);
  text-transform: uppercase;
  letter-spacing: var(--track-motto);
  color: var(--color-text-muted);
}
.motto li { display: flex; align-items: center; gap: var(--space-4); }
.motto li + li::before {
  content: '';
  width: 4px;
  height: 4px;
  transform: rotate(45deg);
  background: var(--color-accent);
}
.motto li:nth-child(2) { color: var(--color-link); }
.motto li:nth-child(4) { color: var(--color-accent); }
```

- [ ] **Step 5: Rewrite `src/routes/__root.tsx`**

```tsx
import { Link, Outlet, createRootRoute } from '@tanstack/react-router'
import { Mark } from '../components/Mark'
import { site } from '../content/site'
import styles from '../styles/layout.module.css'

export const Route = createRootRoute({
  component: RootLayout,
})

const NAV = [
  { to: '/about', label: 'About me' },
  { to: '/projects', label: 'Stuff I make' },
  { to: '/talks', label: 'Stuff I talk about' },
] as const

function RootLayout() {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div>
          <Link
            to="/"
            activeOptions={{ exact: true }}
            className={styles.identity}
            aria-label={`${site.brand.name} — home`}
          >
            <Mark size={44} className={styles.mark} />
            <span className={styles.wordmark}>{site.brand.name}</span>
          </Link>
          <ul className={styles.strapline}>
            {site.brand.strapline.map((word) => (
              <li key={word}>{word}</li>
            ))}
          </ul>
        </div>
        <nav>
          <ul className={styles.nav}>
            {NAV.map((item) => (
              <li key={item.to}>
                <Link to={item.to} activeProps={{ className: 'active' }}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <a href="mailto:tiago.f.a.correia@gmail.com">Talk to me</a>
            </li>
          </ul>
        </nav>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <ul className={styles.motto}>
          {site.brand.motto.map((word) => (
            <li key={word}>{word}</li>
          ))}
        </ul>
      </footer>
    </div>
  )
}
```

**Note on `activeProps`:** it sets a plain `active` class, not a CSS-Modules-hashed one, which is why `layout.module.css` targets `.nav a.active` — a global class nested inside a scoped one. Vite scopes `.nav` but leaves `.active` alone, so this works. Do not try to pass a hashed class through `activeProps`; the router sets it as a literal string.

- [ ] **Step 6: Run the tests**

Run: `npm test`
Expected: all pass, including the three original nav tests. If `name: /home/i` fails, the `aria-label` is missing or misspelled.

- [ ] **Step 7: Commit**

```bash
git add src/styles/layout.module.css src/routes/__root.tsx src/routes/__tests__/nav.test.tsx src/content/site.ts
git commit -m "feat: brand the header, navigation and footer"
```

---

## Task 5: The home hero and the reframed metadata

**Files:**
- Create: `src/styles/page.module.css`
- Modify: `src/routes/index.tsx`, `index.html`, `public/manifest.json`

**Interfaces:**
- Consumes: `site.brand` and `site.home` from Task 4
- Produces: `.sectionLabel`, `.rule`, `.hero`, `.measure` classes in `page.module.css`, used by Tasks 7 and 8

**The heading trap.** The existing home test asserts `findByRole('heading', { name: /I make things/i })`. The positioning line becomes the `h1`, so "Hi! I'm Tiago and I make things!" must stay a *heading* — render it as the `h2`. Demoting it to a paragraph breaks a passing test.

- [ ] **Step 1: Write `src/styles/page.module.css`**

```css
/* Section label: uppercase, tracked, gold — the board's section-header device. */
.sectionLabel {
  font-family: var(--font-heading);
  font-size: var(--size-small);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: var(--track-label);
  color: var(--color-accent);
  margin: 0 0 var(--space-2);
}

/* Gold hairline terminating in a rotated square — the board's divider. */
.rule {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin: var(--space-4) 0;
  border: 0;
  padding: 0;
}
.rule::before {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(
    to right,
    var(--color-accent),
    color-mix(in srgb, var(--color-accent) 15%, transparent)
  );
}
.rule::after {
  content: '';
  flex: none;
  width: 6px;
  height: 6px;
  transform: rotate(45deg);
  border: 1px solid var(--color-accent);
}

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-3);
  padding: var(--space-6) 0;
}

/* Faint concentric circles behind the mark — home hero only. */
.heroMark {
  position: relative;
  color: var(--color-accent);
  display: grid;
  place-items: center;
}
.heroMark::before,
.heroMark::after {
  content: '';
  position: absolute;
  border: 1px solid color-mix(in srgb, var(--color-accent) 18%, transparent);
  border-radius: 50%;
}
.heroMark::before { inset: -22%; }
.heroMark::after { inset: -44%; }

.positioning {
  font-size: var(--size-hero);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 0;
}

.heroWarm { font-size: var(--size-h2); color: var(--color-text); margin: 0; font-weight: 400; }
.heroAside { color: var(--color-text-muted); margin: 0; }

.measure { max-width: var(--measure); }
```

- [ ] **Step 2: Rewrite `src/routes/index.tsx`**

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { Mark } from '../components/Mark'
import { site } from '../content/site'
import styles from '../styles/page.module.css'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroMark}>
        <Mark size={120} />
      </div>
      <h1 className={styles.positioning}>{site.brand.positioning}</h1>
      <h2 className={styles.heroWarm}>{site.home.heading}</h2>
      <p className={styles.heroAside}>{site.home.small}</p>
      <p className={styles.heroAside}>{site.home.smaller}</p>
    </section>
  )
}
```

- [ ] **Step 3: Run the tests**

Run: `npm test`
Expected: all pass. The original home test still finds `/I make things/i` as a heading, now at level 2.

- [ ] **Step 4: Update `index.html` metadata**

Three changes; leave the font preloads from Task 2 in place.

1. `<title>` → `Tiago Correia · Architect, Engineer, Strategist`
2. description → `Tiago Correia — architect, engineer and strategist. Things I make, things I talk about.`
3. `theme-color` → `#0F172A`

Also add the SVG favicon **above** the existing `.ico` link so modern browsers prefer it:

```html
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
```

Leave the existing `<link rel="icon" href="/favicon.ico" />` as the legacy fallback, and leave the `og:image` / `twitter:image` tags pointing at `big-logo.jpg` — replacing that raster is explicitly out of scope.

- [ ] **Step 5: Update `public/manifest.json`**

Set `"name"` and `"short_name"` to `Tiago Correia`, and `"theme_color"` to `#0F172A`. Set `"background_color"` to `#0F172A` if present.

- [ ] **Step 6: Verify metadata and commit**

```bash
grep -n "title\|theme-color\|description\|favicon" index.html
grep -n "name\|theme_color" public/manifest.json
npm test
git add src/styles/page.module.css src/routes/index.tsx index.html public/manifest.json
git commit -m "feat: brand the home hero and site metadata"
```

---

## Task 6: Content-model repairs

Two fidelity losses recorded in the inventory are repaired here.

**Files:**
- Modify: `src/content/site.ts`, `src/routes/about.tsx`
- Test: `src/routes/__tests__/about.test.tsx` (add cases only)

**Interfaces:**
- Consumes: nothing new
- Produces: paragraph part type gains an optional `emphasis` flag: `{ text: string; href?: string; emphasis?: boolean }`

- [ ] **Step 1: Write the failing tests**

Append inside the existing `describe` in `src/routes/__tests__/about.test.tsx`:

```tsx
  it('emphasises the Dosaki monicker', async () => {
    renderAt('/about')
    const emphasised = await screen.findByText('Dosaki')
    expect(emphasised.tagName).toBe('EM')
  })

  it('keeps the photo aside attached to the sentence it belongs to', async () => {
    renderAt('/about')
    const aside = await screen.findByText(/yes that's me/i)
    // The aside belongs inside the "Building things is my passion" paragraph,
    // not adrift after the photo.
    expect(aside.closest('p')?.textContent).toMatch(/Building things is my passion/)
  })
```

- [ ] **Step 2: Run to verify they fail**

Run: `npm test -- about`
Expected: FAIL — "Dosaki" is plain text inside a span, and the aside sits in its own paragraph.

- [ ] **Step 3: Widen the paragraph part type in `src/content/site.ts`**

Change the `satisfies` clause on `paragraphs` from:

```typescript
    ] satisfies { text: string; href?: string }[][],
```

to:

```typescript
    ] satisfies { text: string; href?: string; emphasis?: boolean }[][],
```

- [ ] **Step 4: Split the two affected paragraphs**

Paragraph 4 becomes three parts so the monicker can be emphasised:

```typescript
      [
        { text: "Online, I use '" },
        { text: 'Dosaki', emphasis: true },
        { text: "' as my monicker." },
      ],
```

Paragraph 5 gains the aside as a trailing part:

```typescript
      [
        { text: "Building things is my passion and I've been doing it for quite some time. " },
        { text: "(yes that's me)", aside: true },
      ],
```

Add `aside?: boolean` to the `satisfies` clause alongside `emphasis`, giving:

```typescript
    ] satisfies { text: string; href?: string; emphasis?: boolean; aside?: boolean }[][],
```

Then remove the standalone `aside` string from `site.about` and delete its render site in `about.tsx` (Step 5 covers the render).

- [ ] **Step 5: Render the new part variants in `src/routes/about.tsx`**

First add the stylesheet import at the top of the file — this task is the first to use
it in `about.tsx`:

```tsx
import styles from '../styles/page.module.css'
```

Then replace the paragraph-rendering block with:

```tsx
      {paragraphs.map((parts, index) => (
        <p key={index} className={styles.measure}>
          {parts.map((part, partIndex) => {
            if (part.href) {
              return <a key={partIndex} href={part.href}>{part.text}</a>
            }
            if (part.emphasis) {
              return <em key={partIndex} className={styles.emphasis}>{part.text}</em>
            }
            if (part.aside) {
              return <span key={partIndex} className={styles.aside}>{part.text}</span>
            }
            return <span key={partIndex}>{part.text}</span>
          })}
        </p>
      ))}
```

Remove the separate `<p>{aside}</p>` and drop `aside` from the destructuring of `site.about`.

- [ ] **Step 6: Add the two classes to `src/styles/page.module.css`**

```css
.emphasis {
  font-style: normal;
  color: var(--color-accent);
  font-weight: 600;
}
.aside { color: var(--color-text-muted); font-size: var(--size-small); }
```

- [ ] **Step 7: Run the tests**

Run: `npm test`
Expected: all pass. If `screen.findByText('Dosaki')` matches more than one node, the split is wrong — the quotes must stay in the neighbouring parts so exactly one node holds the bare word.

- [ ] **Step 8: Commit**

```bash
git add src/content/site.ts src/routes/about.tsx src/styles/page.module.css src/routes/__tests__/about.test.tsx
git commit -m "fix: restore Dosaki emphasis and reattach the photo aside"
```

---

## Task 7: Project and talk cards

**Files:**
- Create: `src/components/ProjectCard.module.css`, `src/components/TalkCard.module.css`
- Modify: `src/components/ProjectCard.tsx`, `src/components/TalkCard.tsx`, `src/routes/projects.tsx`, `src/routes/talks.tsx`

**Interfaces:**
- Consumes: tokens, `.sectionLabel` and `.rule` from `page.module.css`
- Produces: nothing later tasks depend on

Both existing card test files assert accessible names and ordering. Restyling must not change any string, list `aria-label`, heading level, or link text.

- [ ] **Step 1: Write `src/components/ProjectCard.module.css`**

```css
.card {
  position: relative;
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: var(--space-3);
  align-items: start;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: var(--space-3);
  margin-bottom: var(--space-3);
}

.icon { grid-row: span 2; border-radius: 3px; }

.body { min-width: 0; }

.name { margin: 0 0 var(--space-1); }
.name a { color: var(--color-text); text-decoration: none; }
.name a:hover { color: var(--color-link); text-decoration: underline; }

.badge {
  display: inline-block;
  background: var(--color-badge-bg);
  color: var(--color-badge-text);
  font-size: var(--size-small);
  text-transform: uppercase;
  letter-spacing: var(--track-label);
  padding: 0 var(--space-2);
  border-radius: 2px;
  margin-bottom: var(--space-2);
}

.description { color: var(--color-text); }
.description :global(a) { color: var(--color-link); }

.tags {
  color: var(--color-text-muted);
  font-size: var(--size-small);
  margin: var(--space-2) 0 0;
}

/* The board's corner device, replacing the old rotated ribbon. */
.source {
  position: absolute;
  top: 0;
  right: 0;
  font-size: var(--size-small);
  text-transform: uppercase;
  letter-spacing: var(--track-label);
  color: var(--color-accent);
  text-decoration: none;
  padding: var(--space-1) var(--space-2);
  border-left: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  border-radius: 0 4px 0 4px;
}
.source:hover { color: var(--color-accent); text-decoration: underline; }
```

- [ ] **Step 2: Apply the classes in `src/components/ProjectCard.tsx`**

Keep every string and the element structure; only class names and the status element change.

```tsx
import type { Project } from '../content/types'
import styles from './ProjectCard.module.css'

export function ProjectCard({ project }: { project: Project }) {
  return (
    <li className={styles.card}>
      <img
        src={project.icon}
        alt=""
        width={64}
        height={64}
        className={`${styles.icon} ${project.pixelatedImage ? 'pixelated' : ''}`}
      />
      <div className={styles.body}>
        <h2 className={styles.name}>
          {project.link ? <a href={project.link}>{project.name}</a> : project.name}
        </h2>
        {project.status === 'inactive' ? (
          <p className={styles.badge}>{project.status}</p>
        ) : null}
        <div
          className={styles.description}
          dangerouslySetInnerHTML={{ __html: project.description }}
        />
        <p className={styles.tags}>
          {[project.type, ...project.tags].map((tag) => `#${tag}`).join(' ')}
        </p>
      </div>
      {project.source ? (
        <a className={styles.source} href={project.source}>
          {`${project.name} source`}
        </a>
      ) : null}
    </li>
  )
}
```

`dangerouslySetInnerHTML` stays — the content genuinely holds raw HTML and that is deliberate. `:global(a)` in the CSS is what styles those injected links, since CSS Modules would otherwise scope the selector and never match them.

- [ ] **Step 3: Write `src/components/TalkCard.module.css`**

```css
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-left: 2px solid var(--color-accent);
  border-radius: 4px;
  padding: var(--space-3);
  margin-bottom: var(--space-3);
}

.name { display: flex; align-items: center; gap: var(--space-2); margin: 0 0 var(--space-1); }
.name a { color: var(--color-text); text-decoration: none; }
.name a:hover { color: var(--color-link); text-decoration: underline; }
.icon { color: var(--color-accent); flex: none; }

.meta { color: var(--color-text-muted); font-size: var(--size-small); margin: 0 0 var(--space-2); }

.badge {
  display: inline-block;
  background: var(--color-badge-bg);
  color: var(--color-badge-text);
  font-size: var(--size-small);
  text-transform: uppercase;
  letter-spacing: var(--track-label);
  padding: 0 var(--space-2);
  border-radius: 2px;
}

.description { color: var(--color-text); }
.description :global(a) { color: var(--color-link); }

.tags { color: var(--color-text-muted); font-size: var(--size-small); margin: var(--space-2) 0 0; }
```

- [ ] **Step 4: Apply the classes in `src/components/TalkCard.tsx`**

```tsx
import { Icon } from '../icons/Icon'
import type { Talk } from '../content/types'
import styles from './TalkCard.module.css'

export function TalkCard({ talk }: { talk: Talk }) {
  return (
    <li className={styles.card}>
      <h2 className={styles.name}>
        <Icon name={talk.type} className={styles.icon} />
        {talk.link ? <a href={talk.link}>{talk.name}</a> : talk.name}
      </h2>
      <p className={talk.status ? styles.badge : styles.meta}>
        {talk.status ?? talk.date}
      </p>
      <div
        className={styles.description}
        dangerouslySetInnerHTML={{ __html: talk.description }}
      />
      <p className={styles.tags}>
        {[talk.type, ...talk.tags].map((tag) => `#${tag}`).join(' ')}
      </p>
    </li>
  )
}
```

- [ ] **Step 5: Add the section label and rule to both list routes**

In `src/routes/projects.tsx` and `src/routes/talks.tsx`, import `page.module.css` and wrap the heading:

```tsx
import styles from '../styles/page.module.css'
```

Then, inside the `<section>`, replace the bare `<h1>` with:

```tsx
      <p className={styles.sectionLabel}>Portfolio</p>
      <h1>{site.titles.projects}</h1>
      <hr className={styles.rule} />
```

For `talks.tsx` use the label `Speaking` and `site.titles.talks`. Do not change the `<h1>` text or the list `aria-label` — the existing tests assert both.

- [ ] **Step 6: Add the between-band dividers on Projects**

The spec calls for a hairline rule between the status bands (active, then done, then
everything else), not only beneath the page heading.

An `<hr>` is not valid inside a `<ul>`, and splitting the list into three would break
the existing test that reads every level-2 heading from one list labelled "Projects".
So the rule is rendered *inside* the first `<li>` of each band after the first.

Add to `ProjectCard.module.css`:

```css
.bandRule {
  grid-column: 1 / -1;   /* .card is a grid; the rule spans icon + body */
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin: 0 0 var(--space-3);
  border: 0;
  padding: 0;
}
.bandRule::before {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(
    to right,
    var(--color-accent),
    color-mix(in srgb, var(--color-accent) 15%, transparent)
  );
}
.bandRule::after {
  content: '';
  flex: none;
  width: 6px;
  height: 6px;
  transform: rotate(45deg);
  border: 1px solid var(--color-accent);
}
```

Give `ProjectCard` an optional prop and render the rule above the grid content:

```tsx
export function ProjectCard({
  project,
  startsBand = false,
}: {
  project: Project
  /** Draws a divider above this card — set on the first card of each status band. */
  startsBand?: boolean
}) {
  return (
    <li className={styles.card}>
      {startsBand ? <hr className={styles.bandRule} /> : null}
      {/* ...unchanged content... */}
```

The `<hr>` must sit inside the `<li>`; `.bandRule` already carries
`grid-column: 1 / -1` so it spans both columns of `.card`'s grid.

In `src/routes/projects.tsx`, mark the first card of each band:

```tsx
function Projects() {
  const ordered = orderProjects(projects)
  return (
    <section>
      <p className={styles.sectionLabel}>Portfolio</p>
      <h1>{site.titles.projects}</h1>
      <hr className={styles.rule} />
      <ul className="list" aria-label="Projects">
        {ordered.map((project, index) => (
          <ProjectCard
            key={project.name}
            project={project}
            startsBand={index > 0 && project.status !== ordered[index - 1].status}
          />
        ))}
      </ul>
    </section>
  )
}
```

The index is used only to look backwards for a band change; the React key stays
`project.name`.

- [ ] **Step 7: Run the tests**

Run: `npm test`
Expected: all pass. The projects and talks tests assert headings, ordering and the "Sqlow source" link name — none of which this task changes. If the projects ordering test fails, the `<hr>` has been placed outside the `<li>` and is breaking the list structure.

- [ ] **Step 8: Commit**

```bash
git add src/components src/routes/projects.tsx src/routes/talks.tsx
git commit -m "feat: brand the project and talk cards"
```

---

## Task 8: The About page and chart chrome

**REQUIRED: load the `dataviz` skill before touching any chart colour or option.** This task changes chart styling, which is exactly what that skill governs.

**Files:**
- Modify: `src/routes/about.tsx`, `src/components/LanguageChart.tsx`, `src/styles/page.module.css`

**Interfaces:**
- Consumes: `.sectionLabel`, `.rule`, `.measure`, `.emphasis`, `.aside` from `page.module.css`
- Produces: nothing later tasks depend on

**The ten language colours stay.** They are language-identity colours — JavaScript yellow, Go cyan — and they carry meaning. Only the chart's chrome changes: title, labels, tooltip. Do not replace the series palette with brand colours.

- [ ] **Step 1: Add the About layout classes to `src/styles/page.module.css`**

```css
.aboutHead { display: flex; flex-wrap: wrap; align-items: baseline; gap: var(--space-3); }

.social { display: flex; gap: var(--space-3); margin: 0; padding: 0; list-style: none; }
.social a { color: var(--color-accent); font-size: 1.25rem; display: inline-flex; }
.social a:hover { color: var(--color-link); }

.portrait {
  border: 1px solid var(--color-accent);
  border-radius: 3px;
  padding: var(--space-1);
  max-width: 200px;
}

.chartFrame {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: var(--space-3);
  margin: var(--space-4) 0;
}
```

- [ ] **Step 2: Rebrand the chart chrome in `src/components/LanguageChart.tsx`**

Only the `title`, `label`, `tooltip` and `itemStyle` options change. Leave `COLOURS` and `chartValue` untouched.

Replace the `title` and `tooltip` option objects, and add label/itemStyle to the series:

```tsx
    title: {
      text: by === 'projects' ? 'Languages used (by project)' : 'Languages used (by years used)',
      left: 'center',
      textStyle: {
        color: '#F8F5E9',
        fontFamily: 'Poppins, system-ui, sans-serif',
        fontWeight: 600,
        fontSize: 15,
      },
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: '#0B0F16',
      borderColor: '#334155',
      textStyle: { color: '#F8F5E9', fontFamily: 'Inter, system-ui, sans-serif' },
      formatter: (params: { name: string; value: number }) =>
        `${params.name}: ${params.value} ${by}`,
    },
```

and inside the single series object:

```tsx
        label: {
          show: true,
          color: '#F8F5E9',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontWeight: 600,
        },
        itemStyle: { borderColor: '#0B0F16', borderWidth: 2 },
```

**These hex values are the one sanctioned exception to the tokens-only rule**, because echarts is configured in TypeScript and cannot read CSS custom properties. Add a comment above the option object saying so and naming the tokens they mirror (`--color-text`, `--color-surface`, `--color-border`). Record this exception in your report.

Also update the canvas-unavailable fallback text to sit in the branded frame rather than bare.

- [ ] **Step 3: Apply the layout in `src/routes/about.tsx`**

Wrap the chart in `<div className={styles.chartFrame}>`, add `className={styles.sectionLabel}` with the text `About` above the `h1`, add `<hr className={styles.rule} />` beneath it, apply `styles.measure` to the biography paragraphs, `styles.portrait` to the photo, and `styles.social` to the social list. Do not change the `h1` text, the social links' `aria-label`s, or the `languagesIntro` link text — three existing tests assert those.

- [ ] **Step 4: Run the tests**

Run: `npm test`
Expected: all pass, including the five About tests and the two added in Task 6.

- [ ] **Step 5: Commit**

```bash
git add src/routes/about.tsx src/components/LanguageChart.tsx src/styles/page.module.css
git commit -m "feat: brand the about page and chart chrome"
```

---

## Task 9: Asset cleanup and full verification

**Files:**
- Delete: `public/images/t_snow.jpg`, `public/images/logo.png`
- Modify: none

- [ ] **Step 1: Confirm both assets are genuinely unreferenced**

```bash
grep -rn "t_snow\|logo\.png" src/ index.html public/manifest.json || echo "NO REFERENCES — safe to delete"
```

Expected: `NO REFERENCES`. If either name appears, stop and report — deleting a referenced asset breaks the build output silently, since a missing `public/` file produces a 404 rather than a build error.

- [ ] **Step 2: Delete them**

```bash
git rm public/images/t_snow.jpg public/images/logo.png
```

`minime.jpg` stays (used on About) and `big-logo.jpg` stays (the OG image).

- [ ] **Step 3: Full local verification**

```bash
npm run typecheck
npm test
npm run build
ls build/index.html build/favicon.svg build/fonts/
```

Expected: zero type errors, all tests passing with pristine output, `build/` populated including the fonts and the SVG favicon.

If `npm run build` regenerates `src/content/languages.generated.ts` with different data, that is the GitHub fetch succeeding — commit it separately with a clear message. If it is unchanged, nothing to do.

- [ ] **Step 4: Verify deep links and assets still serve**

```bash
(npx serve -s build -l 4173 > /tmp/serve.log 2>&1 &) ; sleep 4
for p in / /about /projects /talks "/about?by=years" /favicon.svg /fonts/inter-variable.woff2; do
  printf "%-34s %s\n" "$p" "$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:4173$p")"
done
lsof -ti:4173 | xargs kill
```

Expected: `200` for every path.

- [ ] **Step 5: Screenshot every page for the review**

```bash
mkdir -p /tmp/brandshots
(npx serve -s build -l 4173 > /tmp/serve.log 2>&1 &) ; sleep 4
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
for p in "home:/" "about:/about" "projects:/projects" "talks:/talks"; do
  name="${p%%:*}"; path="${p##*:}"
  "$CHROME" --headless --disable-gpu --hide-scrollbars \
    --window-size=1280,1600 --screenshot="/tmp/brandshots/$name.png" \
    "http://localhost:4173$path" 2>/dev/null
done
"$CHROME" --headless --disable-gpu --hide-scrollbars --window-size=390,1400 \
  --screenshot=/tmp/brandshots/mobile-home.png "http://localhost:4173/" 2>/dev/null
lsof -ti:4173 | xargs kill
ls /tmp/brandshots/
```

Report the screenshot paths. The controller shows them to the user — a design change is not verifiable from a diff.

- [ ] **Step 6: Measure the bundle**

```bash
find build/assets -name "*.js" -exec sh -c 'printf "%8s B gz  %s\n" "$(gzip -c "$1" | wc -c | tr -d " ")" "$(basename $1)"' _ {} \; | sort -rn
find build/assets -name "*.css" -exec sh -c 'printf "%8s B gz  %s\n" "$(gzip -c "$1" | wc -c | tr -d " ")" "$(basename $1)"' _ {} \;
du -sh public/fonts
```

Report the CSS total and the font weight honestly against the pre-overhaul figures: 257.5 KB gzipped JS, no fonts.

- [ ] **Step 7: Confirm the tokens rule held**

```bash
grep -rnE "#[0-9a-fA-F]{6}" src/ --include="*.css" | grep -v "tokens.css" || echo "CSS: tokens.css only — rule held"
grep -rnE "#[0-9a-fA-F]{6}" src/ --include="*.tsx" || echo "TSX: no raw hex"
```

Expected: the CSS check passes. The TSX check will report the chart chrome values from Task 8 — that is the sanctioned exception; confirm those are the only hits and that they carry the explanatory comment.

- [ ] **Step 8: Confirm master is untouched and commit**

```bash
git log --oneline master -1
git ls-remote --heads origin rebuild/tanstack-foundation | wc -l
git add -A
git commit -m "chore: remove assets superseded by the brand mark"
```

Expected: `master` still at `cf1c616`; `0` remote refs for the branch. **Do not push.**

---

## Done

The brand identity is applied end to end: tokens with a contrast guard rail, self-hosted type, the mark, a branded shell, and every route restyled — with the site's own voice preserved word for word in the biography. The four-route structure, all content, and the deployment contract are unchanged.
