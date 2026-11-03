import { useState } from 'react'
import { drawCube } from './draw'
import { AXES, DEG, Q, dot3, fmtQ, fromEuler, toEuler, type Angles, type Axis } from './math'
import { useDrawnCanvas } from './useDrawnCanvas'
import s from './QuaternionCube.module.css'

const START: Angles = { yaw: 0, pitch: 30, roll: 0 }

const SLIDERS = [
  { key: 'yaw', label: 'Yaw (Y)', cls: s.ly, min: -180, max: 180 },
  { key: 'pitch', label: 'Pitch (X)', cls: s.lx, min: -90, max: 90 },
  { key: 'roll', label: 'Roll (Z)', cls: s.lz, min: -180, max: 180 },
] as const

// Signed change in degrees, wrapped to (−180, 180].
const delta = (after: number, before: number) => {
  const v = ((after - before + 540) % 360) - 180
  return (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(1).padStart(5) + '°'
}

export function Gimbal() {
  // The orientation lives in q; the angles are read back from it after a nudge.
  const [angles, setAngles] = useState(START)
  const [q, setQ] = useState(() => fromEuler(START))
  const [log, setLog] = useState<string[]>([])

  const setFromSliders = (next: Angles) => {
    setAngles(next)
    setQ(fromEuler(next))
    setLog([])
  }

  const nudge = (key: Axis) => {
    const before = toEuler(q)
    const next = Q.normalize(Q.mul(Q.fromAxisAngle(AXES[key], 2 * DEG), q))
    const after = toEuler(next)
    const line =
      `2° about ${key.toUpperCase()}:  yaw ${delta(after.yaw, before.yaw)}  pitch ${delta(after.pitch, before.pitch)}  roll ${delta(after.roll, before.roll)}` +
      (after.locked ? '  (locked: roll set to 0)' : '')
    setQ(next)
    setAngles(after)
    setLog((l) => [line, ...l].slice(0, 6))
  }

  const yawQ = Q.fromAxisAngle(AXES.y, angles.yaw * DEG)
  const pitchAxis = Q.rotate(yawQ, AXES.x)
  const rollAxis = Q.rotate(Q.mul(yawQ, Q.fromAxisAngle(AXES.x, angles.pitch * DEG)), AXES.z)
  const between = Math.acos(Math.min(1, Math.abs(dot3(AXES.y, rollAxis)))) / DEG
  const locked = between < 3

  const canvasRef = useDrawnCanvas((cv, pal) =>
    drawCube(cv, pal, (p) => Q.rotate(q, p), {
      axes: false,
      labelSize: 15,
      lines: [
        { dir: AXES.y, len: 2.2, color: pal.y, width: 3, label: 'yaw' },
        { dir: pitchAxis, len: 2.2, color: pal.x, width: 3, label: 'pitch' },
        { dir: rollAxis, len: 2.2, color: pal.z, width: 3, dash: [9, 5], label: 'roll' },
      ],
    }),
  )

  return (
    <section className={s.card}>
      <h2>7 · Gimbal lock: Euler angles vs a quaternion</h2>
      <p className={s.muted}>
        Euler angles describe an orientation as three turns in a fixed order. Here it is yaw about Y, then pitch about
        the new X, then roll about the newest Z:{' '}
        <span className={s.mono}>
          R = R<sub>y</sub>(yaw) · R<sub>x</sub>(pitch) · R<sub>z</sub>(roll)
        </span>
        . The three lines show the axis each angle turns about. Set pitch to ±90° and the roll axis lands on top of the
        yaw axis. Two angles now do the same job, and one direction of turning has no angle of its own.
      </p>
      <div className={s.split}>
        <div className={s.pane}>
          <div className={s.paneHead}>
            <span>Gimbal axes</span>
            <span className={`${s.chip} ${locked ? s.bad : s.ok}`}>{locked ? 'gimbal lock' : 'free'}</span>
          </div>
          <canvas ref={canvasRef} className={s.canvas} aria-label="Cube with its yaw, pitch and roll axes" />
        </div>
        <div>
          {SLIDERS.map(({ key, label, cls, min, max }) => (
            <div className={`${s.row} ${s.wideLabel}`} key={key}>
              <label className={cls} htmlFor={`g-${key}`}>
                {label}
              </label>
              <input
                id={`g-${key}`}
                type="range"
                min={min}
                max={max}
                step={0.5}
                value={angles[key]}
                onChange={(e) => setFromSliders({ ...angles, [key]: +e.target.value })}
              />
              <output htmlFor={`g-${key}`}>{angles[key].toFixed(1)}°</output>
            </div>
          ))}
          <p className={s.muted}>
            Angle between the yaw axis and the roll axis: {between.toFixed(1)}°.{' '}
            {locked
              ? 'They are (nearly) the same line, so yaw and roll now turn the cube the same way.'
              : 'At 0° they would be the same line.'}
          </p>
          <div className={s.btns}>
            <button type="button" className={s.button} onClick={() => setFromSliders({ ...angles, pitch: 90 })}>
              Set pitch to 90°
            </button>
            <button type="button" className={s.button} onClick={() => setFromSliders(START)}>
              Reset
            </button>
          </div>
          <p className={s.muted}>
            Now turn the cube by a small, ordinary amount about a fixed world axis. The quaternion just multiplies by a
            2° turn. The Euler angles are then read back from the result. Near the lock, a 2° turn can make yaw and roll
            jump by tens of degrees, and exactly at the lock they cannot be read back uniquely at all.
          </p>
          <div className={s.btns}>
            {(['x', 'y', 'z'] as const).map((key) => (
              <button type="button" key={key} className={`${s.button} ${s[`l${key}`]}`} onClick={() => nudge(key)}>
                2° about world {key.toUpperCase()}
              </button>
            ))}
          </div>
          <pre className={s.pre}>{log.length ? log.join('\n') : '(no turns yet)'}</pre>
          <pre className={s.pre}>{`q = (${fmtQ(q)})   ← changes smoothly, no special cases`}</pre>
        </div>
      </div>
    </section>
  )
}
