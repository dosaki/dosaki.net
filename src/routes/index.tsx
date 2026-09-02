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
      <h1 className={styles.positioning}>{site.brand.positioning}</h1>
      <h2 className={styles.heroWarm}>{site.home.heading}</h2>
      <p className={styles.heroAside}>{site.home.small}</p>
      <p className={styles.heroAside}>{site.home.smaller}</p>
    </section>
  )
}
