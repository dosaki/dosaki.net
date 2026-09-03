import { createFileRoute } from '@tanstack/react-router'
import { TalkCard } from '../components/TalkCard'
import { orderTalks } from '../content/ordering'
import { talks } from '../content/talks'
import { site } from '../content/site'
import styles from '../styles/page.module.css'

export const Route = createFileRoute('/talks')({
  component: Talks,
})

function Talks() {
  return (
    <section>
      <p className={styles.sectionLabel}>Speaking</p>
      <h1>{site.titles.talks}</h1>
      <hr className={styles.rule} aria-hidden="true" />
      <ul className={styles.list} aria-label="Talks" role="list">
        {orderTalks(talks).map((talk) => (
          <TalkCard key={talk.name} talk={talk} />
        ))}
      </ul>
    </section>
  )
}
