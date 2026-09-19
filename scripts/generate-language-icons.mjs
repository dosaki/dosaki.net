// Vendors the Simple Icons path data for the languages projects.ts actually
// uses, into src/icons/languages.generated.ts.
//
// Simple Icons releases its SVGs under CC0, so no attribution is required —
// but the marks themselves are the languages' trademarks, used here only to
// identify what a project is written in.
//
//   node scripts/generate-language-icons.mjs
import { readFileSync, writeFileSync } from 'node:fs'

// Language name in projects.ts -> Simple Icons slug. Shell has no mark of its
// own; GNU Bash is the closest honest stand-in.
const SLUGS = {
  javascript: 'javascript',
  terraform: 'terraform',
  python: 'python',
  go: 'go',
  shell: 'gnubash',
  typescript: 'typescript',
}
const LABELS = { shell: 'Shell', go: 'Go', javascript: 'JavaScript', python: 'Python', terraform: 'Terraform', typescript: 'TypeScript' }

// Simple Icons draws every mark into a 24x24 box, but does not scale the glyph
// to fill it: Go's logo is a short, wide wordmark that occupies about a third
// of the box's height, so rendered in a square viewport beside JavaScript's
// full-bleed square it looked like a rendering bug rather than a smaller logo.
//
// So we measure each path and emit a viewBox cropped tight to the glyph. The
// stylesheet then sizes marks by height, giving them all the same optical
// weight whatever their aspect ratio.
//
// Curves are bounded by their control points (a bezier never leaves its control
// hull) and arcs by their endpoints grown by how far the arc bulges from its
// chord. Both over-estimate slightly, which can only ever render a mark a shade
// small — never clip it. Growing arcs by the full radius instead is not "a
// shade": TypeScript's mark rounds a corner with a 27.72-unit radius, and that
// turned its 24-unit box into a 55-unit one, shrinking the glyph by half.
function pathBBox(d) {
  let i = 0
  const ws = () => {
    while (i < d.length && (d[i] === ' ' || d[i] === ',' || d[i] === '\n')) i++
  }
  const num = () => {
    ws()
    const m = /^[+-]?(?:\d*\.\d+|\d+\.?)(?:[eE][+-]?\d+)?/.exec(d.slice(i))
    if (!m) throw new Error(`Expected a number at offset ${i} of "${d.slice(i, i + 12)}"`)
    i += m[0].length
    return Number(m[0])
  }
  // Arc flags are single characters and may be packed against the numbers
  // either side of them: "a1.6 1.6 0 01.36.1" is rx ry rot 0 1 .36 .1, not a
  // value of 01. Reading them with the number scanner silently shifts every
  // following coordinate, which is what turned Go's bounding box into NaN.
  const flag = () => {
    ws()
    const c = d[i++]
    if (c !== '0' && c !== '1') throw new Error(`Expected an arc flag, got "${c}"`)
    return c === '1'
  }

  let cx = 0
  let cy = 0
  let startX = 0
  let startY = 0
  let cmd = ''
  const xs = []
  const ys = []
  const add = (x, y) => {
    xs.push(x)
    ys.push(y)
  }

  ws()
  while (i < d.length) {
    if (/[A-Za-z]/.test(d[i])) cmd = d[i++]
    const rel = cmd === cmd.toLowerCase()
    const ox = rel ? cx : 0
    const oy = rel ? cy : 0

    switch (cmd.toUpperCase()) {
      case 'M':
        cx = ox + num()
        cy = oy + num()
        startX = cx
        startY = cy
        add(cx, cy)
        // Further coordinate pairs after an M are implicit L commands.
        cmd = rel ? 'l' : 'L'
        break
      case 'L':
        cx = ox + num()
        cy = oy + num()
        add(cx, cy)
        break
      case 'H':
        cx = ox + num()
        add(cx, cy)
        break
      case 'V':
        cy = oy + num()
        add(cx, cy)
        break
      case 'C': {
        const x1 = ox + num(), y1 = oy + num()
        const x2 = ox + num(), y2 = oy + num()
        cx = ox + num()
        cy = oy + num()
        add(x1, y1)
        add(x2, y2)
        add(cx, cy)
        break
      }
      case 'S':
      case 'Q': {
        const x1 = ox + num(), y1 = oy + num()
        cx = ox + num()
        cy = oy + num()
        add(x1, y1)
        add(cx, cy)
        break
      }
      case 'T':
        cx = ox + num()
        cy = oy + num()
        add(cx, cy)
        break
      case 'A': {
        const rx = Math.abs(num()), ry = Math.abs(num())
        num() // x-axis-rotation
        const largeArc = flag()
        flag() // sweep
        const x0 = cx, y0 = cy
        cx = ox + num()
        cy = oy + num()
        // How far the arc can stray from its chord. A short arc on a big circle
        // is nearly straight, so its bulge is the sagitta r - sqrt(r² - h²); the
        // long way round it is the rest of the circle, r + sqrt(r² - h²). Radii
        // too small to span the chord are scaled up per the SVG spec; scaling by
        // the smaller radius bounds that scale-up, and using the larger radius
        // as a circle bounds the ellipse. Rotation is irrelevant to a bound.
        const h = Math.hypot(cx - x0, cy - y0) / 2
        const r = Math.max(rx, ry) * Math.max(1, h / Math.min(rx, ry))
        const leg = Math.sqrt(Math.max(0, r * r - h * h))
        const bulge = largeArc ? r + leg : r - leg
        add(x0 - bulge, y0 - bulge)
        add(x0 + bulge, y0 + bulge)
        add(cx - bulge, cy - bulge)
        add(cx + bulge, cy + bulge)
        break
      }
      case 'Z':
        cx = startX
        cy = startY
        break
      default:
        throw new Error(`Unhandled path command "${cmd}"`)
    }
    ws()
  }

  const minX = Math.min(...xs), maxX = Math.max(...xs)
  const minY = Math.min(...ys), maxY = Math.max(...ys)
  if (![minX, maxX, minY, maxY].every(Number.isFinite)) throw new Error('Path produced no finite bounds')
  const round = (n) => Number(n.toFixed(2))
  // A tight box, not a padded square: the CSS sizes every mark to the same
  // height, so a wordmark like Go's simply renders wider than a square logo
  // rather than shrinking to fit one.
  return [round(minX), round(minY), round(maxX - minX), round(maxY - minY)].join(' ')
}

const projects = JSON.parse(
  readFileSync('src/content/projects.ts', 'utf8').slice(
    readFileSync('src/content/projects.ts', 'utf8').indexOf('= [') + 2,
  ),
)
const used = [...new Set(projects.flatMap((p) => p.languages))].sort()

const missing = used.filter((l) => !SLUGS[l])
if (missing.length) throw new Error(`No Simple Icons slug mapped for: ${missing.join(', ')}`)

const icons = {}
for (const lang of used) {
  const url = `https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/${SLUGS[lang]}.svg`
  const res = await fetch(url, { headers: { 'User-Agent': 'dosaki.net' } })
  if (!res.ok) throw new Error(`${res.status} fetching ${SLUGS[lang]}`)
  const svg = await res.text()
  const d = svg.match(/\bd="([^"]+)"/)?.[1]
  if (!d) throw new Error(`No path found in ${SLUGS[lang]}.svg`)
  icons[lang] = { label: LABELS[lang] ?? lang, d, viewBox: pathBBox(d) }
}

const body = Object.entries(icons)
  .map(([k, v]) => `  ${k}: { label: '${v.label}', viewBox: '${v.viewBox}', d: '${v.d}' },`)
  .join('\n')

writeFileSync(
  'src/icons/languages.generated.ts',
  `// GENERATED by scripts/generate-language-icons.mjs — do not edit by hand.
// Path data from Simple Icons (CC0). The marks are the languages' own
// trademarks, used here to identify what a project is written in.
// Regenerate with: node scripts/generate-language-icons.mjs

export type LanguageName =
${used.map((l) => `  | '${l}'`).join('\n')}

export const LANGUAGE_ICONS: Record<\n  LanguageName,\n  { label: string; viewBox: string; d: string }\n> = {
${body}
}
`,
)
console.log(`wrote src/icons/languages.generated.ts with ${used.length} icons: ${used.join(', ')}`)
