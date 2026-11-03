import { useState } from 'react'
import { drawCube } from './draw'
import { Q, fromEuler, type Angles, type Quat } from './math'
import { angleBetween, loadEuler, loadQuat, saveEuler, saveQuat } from './storage'
import { useDrawnCanvas } from './useDrawnCanvas'
import s from './QuaternionCube.module.css'

const START: Angles = { yaw: 37, pitch: 21, roll: -12 }

const SLIDERS = [
  { key: 'yaw', label: 'Yaw (Y)', cls: s.ly, min: -180, max: 180 },
  { key: 'pitch', label: 'Pitch (X)', cls: s.lx, min: -90, max: 90 },
  { key: 'roll', label: 'Roll (Z)', cls: s.lz, min: -180, max: 180 },
] as const

interface Pane {
  q: Quat // the orientation the object came back with
  saved: string
  log: string[]
}

const fresh = (q: Quat): Pane => ({ q, saved: '(not saved yet)', log: [] })
const n = (v: number) => v.toFixed(2)

function visit(pane: Pane, placed: Quat, count: number, save: (q: Quat) => { q: Quat; saved: string }): Pane {
  const { q, saved } = save(pane.q)
  const moved = angleBetween(pane.q, q)
  const line =
    `visit ${count}: off by ${angleBetween(placed, q).toFixed(2)}°` +
    (count > 1 ? (moved > 1e-4 ? `, moved ${moved.toFixed(2)}° since last visit` : ', same as last visit') : '')
  return { q, saved, log: [line, ...pane.log].slice(0, 5) }
}

export function Housing() {
  const [angles, setAngles] = useState(START)
  const [bits, setBits] = useState(6)
  const [visits, setVisits] = useState(0)
  const placed = fromEuler(angles)
  const [euler, setEuler] = useState(() => fresh(placed))
  const [quat, setQuat] = useState(() => fresh(placed))

  const place = (next: Angles, nextBits = bits) => {
    setAngles(next)
    setBits(nextBits)
    setVisits(0)
    setEuler(fresh(fromEuler(next)))
    setQuat(fresh(fromEuler(next)))
  }

  const comeBack = () => {
    const count = visits + 1
    setVisits(count)
    setEuler((p) =>
      visit(p, placed, count, (q) => {
        const e = saveEuler(q, bits)
        return { q: loadEuler(e), saved: `yaw ${n(e.yaw)}°  pitch ${n(e.pitch)}°  roll ${n(e.roll)}°` }
      }),
    )
    setQuat((p) =>
      visit(p, placed, count, (q) => {
        const t = saveQuat(q, bits)
        return { q: loadQuat(t), saved: `drop ${'wxyz'[t.dropped]}, keep ${t.rest.map((c) => c.toFixed(3)).join('  ')}` }
      }),
    )
  }

  const panes = [
    { title: 'Saved as Euler angles', pane: euler },
    { title: 'Saved as a quaternion', pane: quat },
  ]

  return (
    <section className={s.card}>
      <h2>8 · Leave the house and come back</h2>
      <p className={s.muted}>
        In World of Warcraft housing, decor sometimes comes back rotated slightly differently after you leave the house
        and return. How the game stores rotations isn&apos;t public, so this is a guess at the mechanism, not a copy of
        it: the object is placed as a quaternion, but saved with only a few bits per number, then loaded back. Each pane
        draws the loaded object over a dashed outline of where you placed it.
      </p>
      <p className={s.muted}>
        <b>Left:</b> the quaternion is converted to three Euler angles to save it, and back to a quaternion when you
        return. <b>Right:</b> the quaternion is saved directly, using the same number of bits: the largest of its four
        numbers is dropped, because it can be worked out from the other three (<span className={s.mono}>|q| = 1</span>
        ), and the other three are saved.
      </p>
      <div className={s.twin}>
        {panes.map(({ title, pane }) => {
          const off = angleBetween(placed, pane.q)
          return (
            <HousingPane key={title} title={title} placed={placed} pane={pane} off={off} visits={visits} />
          )
        })}
      </div>
      <div className={s.btns}>
        <button type="button" className={`${s.button} ${s.primary}`} onClick={comeBack}>
          Leave and come back
        </button>
        <button type="button" className={s.button} onClick={() => place(angles)}>
          Reset visits
        </button>
        <button
          type="button"
          className={s.button}
          onClick={() =>
            place({
              yaw: Math.round(Math.random() * 360 - 180),
              pitch: Math.round(Math.random() * 180 - 90),
              roll: Math.round(Math.random() * 360 - 180),
            })
          }
        >
          Random placement
        </button>
      </div>
      {SLIDERS.map(({ key, label, cls, min, max }) => (
        <div className={`${s.row} ${s.wideLabel}`} key={key}>
          <label className={cls} htmlFor={`h-${key}`}>
            {label}
          </label>
          <input
            id={`h-${key}`}
            type="range"
            min={min}
            max={max}
            step={0.5}
            value={angles[key]}
            onChange={(e) => place({ ...angles, [key]: +e.target.value })}
          />
          <output htmlFor={`h-${key}`}>{angles[key].toFixed(1)}°</output>
        </div>
      ))}
      <div className={`${s.row} ${s.wideLabel}`}>
        <label htmlFor="h-bits">Bits per number</label>
        <input
          id="h-bits"
          type="range"
          min={3}
          max={16}
          step={1}
          value={bits}
          onChange={(e) => place(angles, +e.target.value)}
        />
        <output htmlFor="h-bits">{bits}</output>
      </div>
      <p className={s.muted}>
        With {bits} bits, an Euler angle can only land on steps of {(360 / 2 ** bits).toPrecision(3)}°.
      </p>
      <p className={s.muted}>
        What to notice: converting to Euler angles moves the object on the first visit, by up to half a step on each
        angle, and after that it stays put, because saving the loaded angles gives the same angles again. Saving the
        quaternion itself is usually closer (about 40% less error on average) since its steps are spread more evenly
        over all orientations. It has its own quirk: when two of its numbers are almost equal, it can flip between two
        nearby saves on every visit. Real games use more bits than this. At 16 bits the error is under 0.01°, so a
        visible jump means the angles are saved more coarsely, such as rounded to whole degrees.
      </p>
    </section>
  )
}

function HousingPane({ title, placed, pane, off, visits }: { title: string; placed: Quat; pane: Pane; off: number; visits: number }) {
  const ref = useDrawnCanvas((cv, pal) =>
    drawCube(cv, pal, (p) => Q.rotate(pane.q, p), { labelSize: 13, ghost: (p) => Q.rotate(placed, p) }),
  )
  const exact = off < 0.005
  return (
    <div className={s.pane}>
      <div className={s.paneHead}>
        <span>{title}</span>
        <span className={`${s.chip} ${exact ? s.ok : s.bad}`}>{exact ? 'where you left it' : `off by ${off.toFixed(2)}°`}</span>
      </div>
      <canvas ref={ref} className={s.canvas} aria-label={`${title}: the object as loaded, over an outline of where it was placed`} />
      <pre className={s.pre}>
        {`saved   ${pane.saved}\n` + (visits ? pane.log.join('\n') : '(press "Leave and come back")')}
      </pre>
    </div>
  )
}
