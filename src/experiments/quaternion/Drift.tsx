import { useEffect, useReducer, useRef, useState } from 'react'
import { drawCube } from './draw'
import { DEG, IDENTITY, M3, Q, clamp, dot3, type Mat3, type Quat } from './math'
import { useDrawnCanvas } from './useDrawnCanvas'
import s from './QuaternionCube.module.css'

const STEP = Q.fromAxisAngle([1, 2, 3], 1 * DEG)

interface Sim {
  M: Mat3
  q: Quat
  n: number
  stopped: boolean
}
interface Settings {
  decimals: number
  normQ: boolean
  orthoM: boolean
}

const freshSim = (): Sim => ({ M: M3.I(), q: [...IDENTITY], n: 0, stopped: false })

function measure({ M, q }: Sim) {
  const cols = [0, 1, 2].map((j) => M3.col(M, j))
  const lens = cols.map((c) => Math.hypot(...c))
  const angXY = Math.acos(clamp(dot3(cols[0], cols[1]) / (lens[0] * lens[1] || 1), -1, 1)) / DEG
  // Largest entry of MᵀM − I, which is 0 for a true rotation.
  const mErr = Math.max(...M3.mul(M3.T(M), M).flatMap((row, i) => row.map((v, j) => Math.abs(v - +(i === j)))))
  const qn = Q.norm(q)
  return { lens, angXY, mErr, det: M3.det(M), qn, qScale: qn * qn }
}

// Advances the simulation in place, rounding every number after each step.
// Returns false once the error is too large to draw.
function step(sim: Sim, count: number, { decimals, normQ, orthoM }: Settings) {
  const k = 10 ** decimals
  const round = (x: number) => Math.round(x * k) / k
  const r = Q.map(STEP, round)
  const R = M3.map(Q.matrix(STEP), round)
  sim.stopped = false
  for (let i = 0; i < count; i++) {
    sim.M = M3.map(M3.mul(R, sim.M), round)
    if (orthoM) sim.M = M3.map(M3.gramSchmidt(sim.M), round)
    sim.q = Q.map(Q.mul(r, sim.q), round)
    const n = Q.norm(sim.q)
    if (normQ && n > 1e-9) sim.q = Q.map(sim.q, (c) => round(c / n))
    sim.n++
    const { mErr, qScale } = measure(sim)
    if (mErr > 2.5 || qScale > 3 || qScale < 0.3) {
      sim.stopped = true
      return false
    }
  }
  return true
}

export function Drift() {
  const sim = useRef(freshSim())
  const [, repaint] = useReducer((n: number) => n + 1, 0)
  const [running, setRunning] = useState(false)
  const [settings, setSettings] = useState<Settings>({ decimals: 3, normQ: true, orthoM: false })

  useEffect(() => {
    if (!running) return
    let raf = 0
    const loop = () => {
      const ok = step(sim.current, 8, settings)
      repaint()
      if (ok) raf = requestAnimationFrame(loop)
      else setRunning(false)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [running, settings])

  const { M, q, n, stopped } = sim.current
  const st = measure(sim.current)
  const mBad = st.mErr > 0.02
  const qBad = Math.abs(st.qScale - 1) > 0.02

  const mRef = useDrawnCanvas((cv, pal) => drawCube(cv, pal, (p) => M3.apply(M, p), { labelSize: 13 }))
  const qRef = useDrawnCanvas((cv, pal) => drawCube(cv, pal, (p) => Q.rotate(q, p), { labelSize: 13 }))

  const fixes = [
    ['normQ', 'Fix the quaternion each step (q ← q / |q|)'],
    ['orthoM', 'Fix the matrix each step (Gram–Schmidt)'],
  ] as const

  return (
    <section className={s.card}>
      <h2>Drift: matrix vs quaternion</h2>
      <p className={s.muted}>
        Both cubes repeat the same 1° turn thousands of times, rounding every number after each step. Real computers
        round far less, so this is exaggerated.
      </p>
      <div className={s.twin}>
        <div className={s.pane}>
          <div className={s.paneHead}>
            <span>Matrix: M ← R·M</span>
            <span className={`${s.chip} ${mBad ? s.bad : s.ok}`}>{mBad ? 'skewed' : 'square'}</span>
          </div>
          <canvas ref={mRef} className={s.canvas} aria-label="Cube transformed by the accumulated matrix" />
          <pre className={s.pre}>
            {`steps          ${n}
column lengths ${st.lens.map((l) => l.toFixed(3)).join('  ')}   (want 1)
angle X↔Y      ${st.angXY.toFixed(2)}°   (want 90°)
determinant    ${st.det.toFixed(3)}   (want 1)`}
          </pre>
        </div>
        <div className={s.pane}>
          <div className={s.paneHead}>
            <span>Quaternion: q ← r·q</span>
            <span className={`${s.chip} ${qBad ? s.bad : s.ok}`}>{qBad ? 'scaled, still square' : 'square'}</span>
          </div>
          <canvas ref={qRef} className={s.canvas} aria-label="Cube transformed by the accumulated quaternion" />
          <pre className={s.pre}>
            {`steps          ${n}
|q|            ${st.qn.toFixed(4)}   (want 1)
scale |q|²     ${st.qScale.toFixed(4)}   (same in every direction)
angle X↔Y      90.00°   (always: q v q* cannot skew)` +
              (stopped ? '\nStopped automatically: the error got too large to draw.' : '')}
          </pre>
        </div>
      </div>
      <div className={s.btns}>
        <button type="button" className={`${s.button} ${s.primary}`} onClick={() => setRunning((r) => !r)}>
          {running ? 'Pause' : 'Run'}
        </button>
        <button
          type="button"
          className={s.button}
          onClick={() => {
            if (!step(sim.current, 100, settings)) setRunning(false)
            repaint()
          }}
        >
          +100 steps
        </button>
        <button
          type="button"
          className={s.button}
          onClick={() => {
            sim.current = freshSim()
            setRunning(false)
            repaint()
          }}
        >
          Reset
        </button>
      </div>
      <div className={`${s.row} ${s.wideLabel}`}>
        <label htmlFor="drift-decimals">Decimals kept</label>
        <input
          id="drift-decimals"
          type="range"
          min={2}
          max={6}
          step={1}
          value={settings.decimals}
          onChange={(e) => setSettings({ ...settings, decimals: +e.target.value })}
        />
        <output htmlFor="drift-decimals">{settings.decimals}</output>
      </div>
      {fixes.map(([key, label]) => (
        <label className={s.check} key={key}>
          <input
            type="checkbox"
            checked={settings[key]}
            onChange={(e) => setSettings({ ...settings, [key]: e.target.checked })}
          />{' '}
          {label}
        </label>
      ))}
      <p className={s.muted}>
        The matrix skews. The quaternion can&apos;t: without the fix it only grows or shrinks, and the fix is one
        division.
      </p>
    </section>
  )
}
