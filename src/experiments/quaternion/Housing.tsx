import { useState, type ReactNode } from 'react'
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
    {
      title: 'Saved as Euler angles',
      about: (
        <>Converted to three Euler angles, saved, converted back.</>
      ),
      pane: euler,
    },
    {
      title: 'Saved as a quaternion',
      about: (
        <>Drop the biggest of the four numbers (it can be recalculated), save the other three.</>
      ),
      pane: quat,
    },
  ]

  return (
    <section className={s.card}>
      <h2>Leave the house and come back</h2>
      <p className={s.muted}>
        WoW housing decor sometimes comes back slightly rotated. Blizzard hasn&apos;t said how rotations are stored,
        so this is a guess: they&apos;re saved with too few bits. Dashed outline: where you put it. Solid cube: what
        came back.
      </p>
      <div className={s.twin}>
        {panes.map(({ title, about, pane }) => (
          <HousingPane key={title} title={title} about={about} placed={placed} pane={pane} visits={visits} />
        ))}
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
        {bits} bits: each Euler angle snaps to {(360 / 2 ** bits).toPrecision(3)}° steps.
      </p>
      <p className={s.muted}>
        Euler angles: the object moves on the first visit, then stays put. Quaternion: about 40% closer, but it can
        flip between two positions on later visits. At 16 bits both are off by under 0.01°, so a visible jump means
        far fewer bits.
      </p>
    </section>
  )
}

interface PaneProps {
  title: string
  about: ReactNode
  placed: Quat
  pane: Pane
  visits: number
}

function HousingPane({ title, about, placed, pane, visits }: PaneProps) {
  const off = angleBetween(placed, pane.q)
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
      <p className={`${s.muted} ${s.paneAbout}`}>{about}</p>
      <canvas ref={ref} className={s.canvas} aria-label={`${title}: the object as loaded, over an outline of where it was placed`} />
      <pre className={s.pre}>
        {`saved   ${pane.saved}\n` + (visits ? pane.log.join('\n') : '(press "Leave and come back")')}
      </pre>
    </div>
  )
}
