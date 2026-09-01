import { Icon } from '../icons/Icon'
import type { Talk } from '../content/types'

export function TalkCard({ talk }: { talk: Talk }) {
  return (
    <li className={`talk ${talk.type}`}>
      <h2>
        <Icon name={talk.type} />{' '}
        {talk.link ? <a href={talk.link}>{talk.name}</a> : talk.name}
      </h2>
      <p className={talk.status ? 'status' : undefined}>
        {talk.status ?? talk.date}
      </p>
      <div dangerouslySetInnerHTML={{ __html: talk.description }} />
      <p className="tags">
        {[talk.type, ...talk.tags].map((tag) => `#${tag}`).join(' ')}
      </p>
    </li>
  )
}
