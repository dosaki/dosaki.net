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
