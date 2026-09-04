import { createFileRoute } from '@tanstack/react-router'
import { Mark } from '../components/Mark'
import { site } from '../content/site'
import styles from '../styles/page.module.css'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroMark}>
        <Mark size={120} />
      </div>
      {/* The positioning line is optional. When it is set it is the page's h1
          and the warm line sits under it; when it is empty the warm line is
          promoted, so the page always has exactly one top-level heading and
          never renders an empty one. */}
      {site.brand.positioning ? (
        <>
          <h1 className={styles.positioning}>{site.brand.positioning}</h1>
          <h2 className={styles.heroWarm}>{site.home.heading}</h2>
        </>
      ) : (
        <h1 className={styles.heroWarm}>{site.home.heading}</h1>
      )}
      <p className={styles.heroAside}>{site.home.small}</p>
    </section>
  )
}
