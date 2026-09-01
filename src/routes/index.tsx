import { createFileRoute } from '@tanstack/react-router'
import { site } from '../content/site'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <section>
      <h1>{site.home.heading}</h1>
      <p>{site.home.small}</p>
      <p>{site.home.smaller}</p>
    </section>
  )
}
