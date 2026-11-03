import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { site } from '../../content/site'
import page from '../../styles/page.module.css'
import { Drift } from './Drift'
import { Explorer } from './Explorer'
import { Gimbal } from './Gimbal'
import { Housing } from './Housing'
import s from './QuaternionCube.module.css'

const TABS = [
  { id: 'drift', label: '6 · Drift', panel: <Drift /> },
  { id: 'gimbal', label: '7 · Gimbal lock', panel: <Gimbal /> },
  { id: 'housing', label: '8 · WoW housing', panel: <Housing /> },
]

export function QuaternionCube() {
  const [tab, setTab] = useState(TABS[0].id)

  // Landing here directly serves this page's own HTML and title, so put the
  // site title back when navigating away.
  useEffect(() => {
    document.title = `Quaternion Cube · ${site.brand.name}`
    return () => {
      document.title = site.meta.title
    }
  }, [])

  return (
    <article className={s.page}>
      <Link to="/projects" className={s.back}>
        ← {site.titles.projects}
      </Link>
      <h1>Quaternion Cube</h1>
      <p className={s.intro}>
        A unit quaternion <span className={s.mono}>q = w + xi + yj + zk</span> encodes a 3D rotation. Change the
        numbers, drag the cube, or combine rotations, and watch every representation update together.
      </p>
      <hr className={page.rule} aria-hidden="true" />

      <Explorer />
      <div>
        <div className={s.tabs} role="tablist" aria-label="More experiments">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-controls={`panel-${t.id}`}
              aria-selected={tab === t.id}
              className={s.tab}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        {/* Hidden rather than unmounted, so each tab keeps its state. */}
        {TABS.map((t) => (
          <div key={t.id} role="tabpanel" id={`panel-${t.id}`} aria-labelledby={`tab-${t.id}`} hidden={tab !== t.id}>
            {t.panel}
          </div>
        ))}
      </div>

      <p className={s.muted}>
        Right-handed axes: <span className={s.lx}>X</span> right, <span className={s.ly}>Y</span> up,{' '}
        <span className={s.lz}>Z</span> toward you (before the camera tilt). Positive angles turn counter-clockwise
        when you look down the axis toward the origin.
      </p>
    </article>
  )
}
