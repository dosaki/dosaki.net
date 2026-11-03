import { AXES, DEG, Q, add, cross, dot3, scale, sub, unit, type Axis, type Vec3 } from './math'

// Colours come from tokens.css (6-digit hex, so mixColor can blend them).
export function readPalette() {
  const style = getComputedStyle(document.documentElement)
  const v = (name: string) => style.getPropertyValue(name).trim()
  return {
    bg: v('--color-bg'),
    ink: v('--color-text'),
    shade: v('--color-surface'),
    x: v('--color-axis-x'),
    y: v('--color-axis-y'),
    z: v('--color-axis-z'),
    w: v('--color-axis-w'),
  }
}
export type Palette = ReturnType<typeof readPalette>

export function mixColor(from: string, amt: number, to: string) {
  const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) || 0)
  const b = rgb(to)
  return '#' + rgb(from).map((c, i) => Math.round(c + (b[i] - c) * amt).toString(16).padStart(2, '0')).join('')
}

// Fixed camera tilt so the world axes read as 3D.
export const CAM = Q.mul(Q.fromAxisAngle([1, 0, 0], 22 * DEG), Q.fromAxisAngle([0, 1, 0], -32 * DEG))
const DIST = 7
const toView = (p: Vec3) => Q.rotate(CAM, p)

// Each face's corners run counter-clockwise from outside, so (c1−c0)×(c3−c0) points out.
const face = (n: Vec3, u: Vec3, v: Vec3, label: string, col: Axis, dim = false) => ({
  label,
  col,
  dim,
  corners: [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => add(n, add(scale(u, a), scale(v, b)))),
})
const FACES = [
  face([1, 0, 0], [0, 1, 0], [0, 0, 1], '+X', 'x'),
  face([-1, 0, 0], [0, -1, 0], [0, 0, 1], '−X', 'x', true),
  face([0, 1, 0], [0, 0, 1], [1, 0, 0], '+Y', 'y'),
  face([0, -1, 0], [0, 0, -1], [1, 0, 0], '−Y', 'y', true),
  face([0, 0, 1], [1, 0, 0], [0, 1, 0], '+Z', 'z'),
  face([0, 0, -1], [-1, 0, 0], [0, 1, 0], '−Z', 'z', true),
]
const LIGHT = unit([-0.4, 0.7, 0.6])

export interface Line {
  dir: Vec3
  len: number
  color: string
  width?: number
  dash?: number[]
  label?: string
}

interface Options {
  axes?: boolean
  labelSize?: number
  trail?: Vec3[] | null
  marker?: boolean
  lines?: Line[]
  // Dashed outline of the cube under another transform, to compare against.
  ghost?: (p: Vec3) => Vec3
}

// The 12 edges of the cube, as pairs of corners that differ in one coordinate.
const CORNERS: Vec3[] = [-1, 1].flatMap((x) => [-1, 1].flatMap((y) => [-1, 1].map((z): Vec3 => [x, y, z])))
const EDGES = CORNERS.flatMap((a, i) =>
  CORNERS.slice(i + 1)
    .filter((b) => a.filter((c, k) => c !== b[k]).length === 1)
    .map((b) => [a, b]),
)

// Draws the cube transformed by xf. Any linear map works, so a skewed matrix shows as skewed.
export function drawCube(cv: HTMLCanvasElement, pal: Palette, xf: (p: Vec3) => Vec3, o: Options = {}) {
  const ctx = cv.getContext('2d')
  if (!ctx) return
  const W = cv.width
  const H = cv.height
  const dpr = W / Math.max(1, cv.clientWidth)
  const f = W * 1.2
  const project = (v: Vec3): [number, number] => {
    const d = DIST - v[2]
    return [W / 2 + (f * v[0]) / d, H / 2 - (f * v[1]) / d]
  }
  const screen = (p: Vec3) => project(toView(p))
  const path = (pts: [number, number][]) => {
    ctx.beginPath()
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
  }
  const stroke = (pts: Vec3[], color: string, width: number, dash: number[] = []) => {
    ctx.strokeStyle = color
    ctx.lineWidth = width * dpr
    ctx.setLineDash(dash.map((d) => d * dpr))
    path(pts.map(screen))
    ctx.stroke()
    ctx.setLineDash([])
  }
  const text = (x: number, y: number, s: string, color: string, size: number, weight = 600) => {
    ctx.font = `${weight} ${size * dpr}px system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = color
    ctx.fillText(s, x, y)
  }

  ctx.fillStyle = pal.bg
  ctx.fillRect(0, 0, W, H)

  if (o.axes !== false) {
    for (const [key, a] of Object.entries(AXES) as [Axis, Vec3][]) {
      stroke([scale(a, -2.4), scale(a, 2.4)], mixColor(pal[key], 0.55, pal.bg), 1.5, [4, 4])
      stroke([[0, 0, 0], scale(a, 2.4)], pal[key], 1.5)
      text(...screen(scale(a, 2.65)), key.toUpperCase(), pal[key], 15)
    }
  }

  const faces = FACES.map((fc) => {
    const view = fc.corners.map((c) => toView(xf(c)))
    const n = unit(cross(sub(view[1], view[0]), sub(view[3], view[0])))
    const center = scale(view.reduce(add), 1 / 4)
    const facing = dot3(n, [-center[0], -center[1], DIST - center[2]])
    return { fc, view, center, facing, lit: Math.max(0, dot3(n, LIGHT)) }
  })
    .filter((x) => x.facing > 0)
    .sort((a, b) => a.center[2] - b.center[2])

  for (const { fc, view, center, lit } of faces) {
    const base = fc.dim ? mixColor(pal[fc.col], 0.55, pal.bg) : pal[fc.col]
    path(view.map(project))
    ctx.closePath()
    ctx.fillStyle = mixColor(base, 0.45 * (1 - lit), pal.shade)
    ctx.globalAlpha = 0.92
    ctx.fill()
    ctx.globalAlpha = 1
    ctx.strokeStyle = pal.ink
    ctx.lineWidth = 1.2 * dpr
    ctx.stroke()
    // Light text with a dark outline reads on bright and shaded faces alike.
    const [cx, cy] = project(center)
    const size = o.labelSize ?? 18
    ctx.font = `700 ${size * dpr}px system-ui, sans-serif`
    ctx.lineJoin = 'round'
    ctx.lineWidth = 3 * dpr
    ctx.strokeStyle = pal.shade
    ctx.strokeText(fc.label, cx, cy)
    text(cx, cy, fc.label, pal.ink, size, 700)
  }

  if (o.ghost) for (const [a, b] of EDGES) stroke([o.ghost(a), o.ghost(b)], pal.w, 2, [6, 4])
  if (o.trail && o.trail.length > 1) stroke(o.trail, pal.w, 2.5)
  if (o.marker) {
    const [x, y] = screen(xf([1, 1, 1]))
    ctx.fillStyle = pal.w
    ctx.beginPath()
    ctx.arc(x, y, 5 * dpr, 0, Math.PI * 2)
    ctx.fill()
  }
  for (const l of o.lines ?? []) {
    stroke([scale(l.dir, -l.len), scale(l.dir, l.len)], l.color, l.width ?? 2, l.dash)
    if (l.label) text(...screen(scale(l.dir, l.len + 0.25)), l.label, l.color, 15)
  }
}
