import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { CAM, drawCube } from './draw'
import { AXES, DEG, IDENTITY, Q, clamp, fmt, fmtQ, type Axis, type Quat, type Vec3 } from './math'
import { useDrawnCanvas } from './useDrawnCanvas'
import s from './QuaternionCube.module.css'

// raw is what the component sliders show and may be non-unit; q is always unit.
// axis and angle keep their own values, so the axis survives θ = 0 and θ can
// reach 720° even though reading it back from q only gives 0–360°.
interface View {
  raw: Quat
  q: Quat
  axis: Vec3
  angle: number
}

// Start (and reset) slightly turned, so the cube reads as 3D straight away.
// Loaded as raw slider values: it isn't quite unit length, so the page
// normalises it like any other input.
const START: Quat = [0.99, 0.075, 0.07, -0.085]
const INITIAL: View = applyQ({ raw: [...IDENTITY], q: [...IDENTITY], axis: [0, 1, 0], angle: 0 }, START, 'comp')

function applyQ(prev: View, next: Quat, source?: 'comp' | 'axis'): View {
  const q = Q.normalize(next)
  const raw = source === 'comp' ? next : q
  if (source === 'axis') return { ...prev, raw, q }
  const w = clamp(q[0], -1, 1)
  const sinHalf = Math.sqrt(1 - w * w)
  return {
    raw,
    q,
    axis: sinHalf > 1e-6 ? [q[1] / sinHalf, q[2] / sinHalf, q[3] / sinHalf] : prev.axis,
    angle: (2 * Math.acos(w)) / DEG,
  }
}

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)

export function Explorer() {
  const [view, setView] = useState(INITIAL)
  const [frame, setFrame] = useState<'world' | 'local'>('world')
  const [history, setHistory] = useState<string[]>([])
  const [shortest, setShortest] = useState(false)
  const [showTrail, setShowTrail] = useState(true)
  const trail = useRef<Vec3[]>([])
  const raf = useRef(0)
  const drag = useRef<{ x: number; y: number } | null>(null)

  const { q, raw, axis, angle } = view
  const setQ = (next: Quat, source?: 'comp' | 'axis') => setView((v) => applyQ(v, next, source))

  const stopAnim = () => cancelAnimationFrame(raf.current)
  useEffect(() => stopAnim, [])

  // Any direct edit cancels a running animation and clears the step history.
  const edit = () => {
    stopAnim()
    setHistory([])
  }

  const setAxisAngle = (nextAxis: Vec3, nextAngle: number) => {
    edit()
    setView((v) => applyQ({ ...v, axis: nextAxis, angle: nextAngle }, Q.fromAxisAngle(nextAxis, nextAngle * DEG), 'axis'))
  }

  const animate = (from: Quat, to: Quat, ms: number, recordTrail: boolean) => {
    stopAnim()
    if (recordTrail) trail.current = []
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms)
      const cur = t < 1 ? Q.slerp(from, to, easeInOut(t)) : to
      if (recordTrail) trail.current.push(Q.rotate(cur, [1, 1, 1]))
      setQ(cur)
      if (t < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
  }

  const turn = (key: Axis, dir: 1 | -1) => {
    stopAnim()
    const r = Q.fromAxisAngle(AXES[key], dir * 90 * DEG)
    const rule = frame === 'world' ? 'q ← r·q' : 'q ← q·r'
    setHistory((h) => [...h, `${rule}   r = ${dir > 0 ? '+' : '−'}90° about ${key.toUpperCase()}   r = (${fmtQ(r)})`])
    animate(q, frame === 'world' ? Q.mul(r, q) : Q.mul(q, r), 450, false)
  }

  const onPointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    stopAnim()
    drag.current = { x: e.clientX, y: e.clientY }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!drag.current) return
    const dx = e.clientX - drag.current.x
    const dy = e.clientY - drag.current.y
    drag.current = { x: e.clientX, y: e.clientY }
    const len = Math.hypot(dx, dy)
    if (len < 0.5) return
    // Turn about the screen axis perpendicular to the drag, converted to world space.
    const r = Q.fromAxisAngle(Q.rotate(Q.conj(CAM), [dy / len, dx / len, 0]), len * 0.01)
    setHistory([])
    setView((v) => applyQ(v, Q.mul(r, v.q)))
  }
  const endDrag = () => {
    drag.current = null
  }

  const [w, x, y, z] = q
  const rawNorm = Q.norm(raw)
  const theta = 2 * Math.acos(clamp(w, -1, 1))
  const sinHalf = Math.sin(theta / 2)
  const n: Vec3 = [x / sinHalf, y / sinHalf, z / sinHalf]
  const qv = Q.mul(q, [0, 1, 1, 1])
  const sign = (v: number) => (v < 0 ? '−' : '+')

  const canvasRef = useDrawnCanvas((cv, pal) =>
    drawCube(cv, pal, (p) => Q.rotate(q, p), {
      trail: showTrail ? trail.current : null,
      marker: true,
      lines: sinHalf > 1e-4 ? [{ dir: n, len: 2.3, color: pal.ink, dash: [8, 6], label: 'n' }] : [],
    }),
  )

  return (
    <div className={s.explorer}>
      <div className={s.stage}>
        <canvas
          ref={canvasRef}
          className={s.canvas}
          aria-label="3D cube rotated by the current quaternion"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        />
        <div className={s.stageBar}>
          <span className={s.hint}>Drag the cube to rotate it. Dashed line = rotation axis.</span>
          <button
            type="button"
            className={s.button}
            onClick={() => {
              edit()
              trail.current = []
              setView(INITIAL)
            }}
          >
            Reset
          </button>
          <button
            type="button"
            className={s.button}
            title="Replace q with −q"
            onClick={() => {
              stopAnim()
              setQ(Q.neg(q))
            }}
          >
            Negate q
          </button>
          <button
            type="button"
            className={`${s.button} ${s.primary}`}
            onClick={() => animate([...IDENTITY], shortest && w < 0 ? Q.neg(q) : q, 1800, true)}
          >
            Animate from identity
          </button>
        </div>
      </div>

      <div className={s.panels}>
        <section className={s.card}>
          <h2>Current quaternion</h2>
          <div className={s.qbig}>
            <span className={s.lw}>{fmt(w)}</span> {sign(x)} <span className={s.lx}>{Math.abs(x).toFixed(3)}</span>i{' '}
            {sign(y)} <span className={s.ly}>{Math.abs(y).toFixed(3)}</span>j {sign(z)}{' '}
            <span className={s.lz}>{Math.abs(z).toFixed(3)}</span>k
          </div>
          <p className={s.muted}>
            {Math.abs(rawNorm - 1) < 5e-4
              ? '|q| = 1.000 — a unit quaternion.'
              : `Raw |q| = ${rawNorm.toFixed(3)}. Divided by ${rawNorm.toFixed(3)} to get the unit quaternion shown above.`}
          </p>
          <details>
            <summary>
              What are <span className={s.mono}>i</span>, <span className={s.mono}>j</span> and{' '}
              <span className={s.mono}>k</span>?
            </summary>
            <ul className={s.ijk}>
              <li>
                <span className={`${s.mono} ${s.lx}`}>i</span> is √−1, the imaginary unit you know from complex numbers
                <ul>
                  <li>
                    <span className={s.mono}>x = {x.toFixed(3)}</span> says how much of{' '}
                    <span className={s.mono}>i</span> this quaternion has
                  </li>
                </ul>
              </li>
              <li>
                <span className={`${s.mono} ${s.ly}`}>j</span> is also √−1, but a different one (
                <span className={s.mono}>j ≠ i</span>)
                <ul>
                  <li>
                    <span className={s.mono}>y = {y.toFixed(3)}</span> says how much of <span className={s.mono}>j</span>{' '}
                    it has
                  </li>
                </ul>
              </li>
              <li>
                <span className={`${s.mono} ${s.lz}`}>k</span> is also √−1, and is defined as{' '}
                <span className={s.mono}>k = i·j</span>
                <ul>
                  <li>
                    The order matters: <span className={s.mono}>j·i = −k</span>
                  </li>
                  <li>
                    <span className={s.mono}>z = {z.toFixed(3)}</span> says how much of <span className={s.mono}>k</span>{' '}
                    it has
                  </li>
                </ul>
              </li>
            </ul>
            <p className={s.muted}>
              <b>
                How can <span className={s.mono}>i</span> and <span className={s.mono}>j</span> be different if they are both <span className={s.mono}>√−1</span>?
              </b>
            </p>
            <p className={s.muted}>
              They are all imaginary numbers, like <span className={s.mono}>i</span> was when it was invented: none of
              them can be written with real numbers. <span className={s.mono}>i</span>, <span className={s.mono}>j</span> and{' '}
              <span className={s.mono}>k</span> are all <span className={s.mono}>√−1</span>, but they're all different. It helps to think of them as independent
              directions, like the axes of a graph.
            </p>
            <p className={s.muted}>
              <b>What's the first element of the quaternion and why isn't it an imaginary number?</b>
            </p>
            <p className={s.muted}>
              It's the real part, <span className={s.mono}>w</span>. It says how far the cube turns around the axis (the dashed line{' '}
              <span className={s.mono}>n</span>): <span className={s.mono}>w = cos(θ/2)</span>, so right now <span className={s.mono}>w = {w.toFixed(3)}</span> means a turn of{' '}
              <span className={s.mono}>θ = {(theta / DEG).toFixed(1)}°</span>. Unlike <span className={s.mono}>i</span>, <span className={s.mono}>j</span> and <span className={s.mono}>k</span>, it is a real number
              because it is an amount rather than a direction in space.
            </p>
          </details>
        </section>

        <section className={s.card}>
          <h2>1 · Edit the four components</h2>
          <p className={s.muted}>
            Each slider sets one raw component. A rotation needs a <em>unit</em> quaternion, so the cube uses{' '}
            <span className={s.mono}>q / |q|</span>. Notice that scaling all four numbers together changes nothing.
          </p>
          {(['w', 'x', 'y', 'z'] as const).map((key, i) => (
            <div className={s.row} key={key}>
              <label className={s[`l${key}`]} htmlFor={`qc-${key}`}>
                {key}
              </label>
              <input
                id={`qc-${key}`}
                type="range"
                min={-1}
                max={1}
                step={0.001}
                value={raw[i]}
                onChange={(e) => {
                  edit()
                  setQ(raw.map((c, j) => (j === i ? +e.target.value : c)) as Quat, 'comp')
                }}
              />
              <output htmlFor={`qc-${key}`}>{raw[i].toFixed(3)}</output>
            </div>
          ))}
          <p className={s.warn}>
            {rawNorm < 1e-6 ? 'All components are zero, which is not a rotation. Showing the identity.' : ''}
          </p>
        </section>

        <section className={s.card}>
          <h2>2 · Axis and angle</h2>
          <p className={s.muted}>
            A rotation by angle θ about unit axis <span className={s.mono}>n</span> is{' '}
            <span className={s.mono}>q = cos(θ/2) + sin(θ/2)(nₓi + n_yj + n_zk)</span>. The half angle is why θ goes to
            720°: at 360° the cube is back where it started but <span className={s.mono}>q = −1</span>.
          </p>
          {(['x', 'y', 'z'] as const).map((key, i) => (
            <div className={s.row} key={key}>
              <label className={s[`l${key}`]} htmlFor={`qa-${key}`}>
                {key === 'x' ? 'nₓ' : `n_${key}`}
              </label>
              <input
                id={`qa-${key}`}
                type="range"
                min={-1}
                max={1}
                step={0.01}
                value={axis[i]}
                onChange={(e) => setAxisAngle(axis.map((c, j) => (j === i ? +e.target.value : c)) as Vec3, angle)}
              />
              <output htmlFor={`qa-${key}`}>{axis[i].toFixed(2)}</output>
            </div>
          ))}
          <div className={s.row}>
            <label htmlFor="qa-angle">θ</label>
            <input
              id="qa-angle"
              type="range"
              min={0}
              max={720}
              step={0.5}
              value={angle}
              onChange={(e) => setAxisAngle(axis, +e.target.value)}
            />
            <output htmlFor="qa-angle">{angle.toFixed(1)}°</output>
          </div>
          <p className={s.muted}>
            {sinHalf > 1e-6
              ? `Read back from q: θ = 2·acos(w) = ${(theta / DEG).toFixed(1)}°, axis = (x, y, z) / sin(θ/2) = (${n.map((c) => fmt(c, 2)).join(', ')}).`
              : w > 0
                ? 'q = +1: no rotation, so the axis does not matter.'
                : 'q = −1: a full 360° turn. Same pose as q = +1, but a different quaternion.'}
          </p>
        </section>

        <section className={s.card}>
          <h2>3 · Combine rotations</h2>
          <p className={s.muted}>
            Rotations combine by multiplying quaternions, and the order matters. Pick a frame, then add 90° turns.
          </p>
          <div className={s.seg} role="group" aria-label="Frame">
            <button type="button" className={s.button} aria-pressed={frame === 'world'} onClick={() => setFrame('world')}>
              World: q ← r·q
            </button>
            <button type="button" className={s.button} aria-pressed={frame === 'local'} onClick={() => setFrame('local')}>
              Cube: q ← q·r
            </button>
          </div>
          <div className={s.btns}>
            {(['x', 'y', 'z'] as const).flatMap((key) =>
              ([1, -1] as const).map((dir) => (
                <button
                  type="button"
                  key={key + dir}
                  className={`${s.button} ${s[`l${key}`]}`}
                  onClick={() => turn(key, dir)}
                >
                  {dir > 0 ? '+' : '−'}90° {key.toUpperCase()}
                </button>
              )),
            )}
          </div>
          <p className={s.muted}>
            {frame === 'world'
              ? 'World frame: r is applied after q, so each turn is about the fixed world axes (the long thin lines).'
              : "Cube frame: r is applied before q, so each turn is about the cube's own axes (the face labels)."}
          </p>
          <pre className={s.pre}>{history.length ? history.join('\n') : '(no steps yet)'}</pre>
          <p className={s.muted}>
            Try it: reset, then +90° X followed by +90° Y. Reset and do +90° Y then +90° X. The cube ends in a different
            place.
          </p>
        </section>

        <section className={s.card}>
          <h2>4 · Slerp and the double cover</h2>
          <p className={s.muted}>
            <b>Animate from identity</b> interpolates along the 4D sphere with slerp:{' '}
            <span className={s.mono}>slerp(1, q, t)</span>. <span className={s.mono}>q</span> and{' '}
            <span className={s.mono}>−q</span> give the same final pose, but one route is shorter. Press <b>Negate q</b>{' '}
            and animate again to see the long way round.
          </p>
          <label className={s.check}>
            <input type="checkbox" checked={shortest} onChange={(e) => setShortest(e.target.checked)} /> Always take the
            shortest path (flip to −q when w &lt; 0)
          </label>
          <label className={s.check}>
            <input type="checkbox" checked={showTrail} onChange={(e) => setShowTrail(e.target.checked)} /> Draw the path
            of the corner (1, 1, 1)
          </label>
        </section>

        <section className={s.card}>
          <h2>5 · What the quaternion does to a point</h2>
          <p className={s.muted}>
            A point <span className={s.mono}>v</span> is written as the pure quaternion{' '}
            <span className={s.mono}>0 + vₓi + v_yj + v_zk</span> and rotated by the &ldquo;sandwich&rdquo;{' '}
            <span className={s.mono}>v′ = q v q*</span>, where <span className={s.mono}>q* = w − xi − yj − zk</span>.
          </p>
          <pre className={s.pre}>
            {`v        = (0, 1, 1, 1)
q        = (${fmtQ(q)})
q·v      = (${fmtQ(qv)})
q·v·q*   = (${fmtQ(Q.mul(qv, Q.conj(q)))})
              ↑ the w part is always 0,
                the rest is the rotated corner`}
          </pre>
          <details>
            <summary>Equivalent rotation matrix</summary>
            <pre className={s.pre}>
              {Q.matrix(q)
                .map((row) => `[ ${row.map((c) => fmt(c)).join('  ')} ]`)
                .join('\n') + "\n\nColumns = where the cube's X, Y and Z axes point."}
            </pre>
          </details>
          <details>
            <summary>Multiplication rules</summary>
            <pre className={s.pre}>
              {`i² = j² = k² = ijk = −1
ij =  k   jk =  i   ki =  j
ji = −k   kj = −i   ik = −j

(a,A)(b,B) = (ab − A·B,  aB + bA + A×B)`}
            </pre>
          </details>
        </section>
      </div>
    </div>
  )
}
