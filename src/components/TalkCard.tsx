import { Icon } from '../icons/Icon'
import type { Talk } from '../content/types'
import styles from './TalkCard.module.css'

export function TalkCard({ talk }: { talk: Talk }) {
  return (
    <li className={styles.card}>
      <h2 className={styles.name}>
        <Icon name={talk.type} className={styles.icon} />
        {talk.link ? <a href={talk.link}>{talk.name}</a> : talk.name}
      </h2>
      <p className={talk.status ? styles.badge : styles.meta}>
        {talk.status ?? talk.date}
      </p>
      <div
        className={styles.description}
        dangerouslySetInnerHTML={{ __html: talk.description }}
      />
      <p className={styles.tags}>
        {[talk.type, ...talk.tags].map((tag) => `#${tag}`).join(' ')}
      </p>
    </li>
  )
}
