import { createFileRoute } from '@tanstack/react-router'
import { TalkCard } from '../components/TalkCard'
import { orderTalks } from '../content/ordering'
import { talks } from '../content/talks'
import { site } from '../content/site'

export const Route = createFileRoute('/talks')({
  component: Talks,
})

function Talks() {
  return (
    <section>
      <h1>{site.titles.talks}</h1>
      <ul className="list" aria-label="Talks">
        {orderTalks(talks).map((talk) => (
          <TalkCard key={talk.name} talk={talk} />
        ))}
      </ul>
    </section>
  )
}
