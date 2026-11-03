import { Link } from '@tanstack/react-router'
import { site } from '../../content/site'
import page from '../../styles/page.module.css'
import { Drift } from './Drift'
import { Explorer } from './Explorer'
import { Gimbal } from './Gimbal'
import s from './QuaternionCube.module.css'

export function QuaternionCube() {
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
      <Drift />
      <Gimbal />

      <p className={s.muted}>
        Right-handed axes: <span className={s.lx}>X</span> right, <span className={s.ly}>Y</span> up,{' '}
        <span className={s.lz}>Z</span> toward you (before the camera tilt). Positive angles turn counter-clockwise
        when you look down the axis toward the origin.
      </p>
    </article>
  )
}
