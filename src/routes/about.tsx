import { Link, createFileRoute } from '@tanstack/react-router'
import { Icon } from '../icons/Icon'
import { LanguageChart, type ChartMode } from '../components/LanguageChart'
import { languages } from '../content/languages.generated'
import { site } from '../content/site'

interface AboutSearch {
  by: ChartMode
}

export const Route = createFileRoute('/about')({
  validateSearch: (search: Record<string, unknown>): AboutSearch => ({
    by: search.by === 'years' ? 'years' : 'projects',
  }),
  component: About,
})

function About() {
  const { by } = Route.useSearch()
  const { heading, photo, aside, social, paragraphs, languagesIntro } = site.about
  const other: ChartMode = by === 'projects' ? 'years' : 'projects'

  return (
    <section>
      <h1>{heading}</h1>

      <p>
        {social.map((link) => (
          <a key={link.href} href={link.href} aria-label={link.label}>
            <Icon name={link.icon} title={link.label} />
          </a>
        ))}
      </p>

      {paragraphs.map((parts, index) => (
        <p key={index}>
          {parts.map((part, partIndex) =>
            part.href ? (
              <a key={partIndex} href={part.href}>{part.text}</a>
            ) : (
              <span key={partIndex}>{part.text}</span>
            ),
          )}
        </p>
      ))}

      <img src={photo.src} alt={photo.alt} width={200} />
      <p>{aside}</p>

      <p data-testid="chart-mode">{by}</p>
      <LanguageChart languages={languages} by={by} />

      <p>
        {languagesIntro.prefix}
        {by === 'projects' ? (
          languagesIntro.byProjects
        ) : (
          <Link from={Route.fullPath} search={{ by: 'projects' }}>
            {languagesIntro.byProjects}
          </Link>
        )}
        {languagesIntro.middle}
        {by === 'years' ? (
          languagesIntro.byYears
        ) : (
          <Link from={Route.fullPath} search={{ by: 'years' }}>
            {languagesIntro.byYears}
          </Link>
        )}
        {languagesIntro.suffix}
      </p>
      <p>
        <Link from={Route.fullPath} search={{ by: other }}>
          {`Show by ${other}`}
        </Link>
      </p>
    </section>
  )
}
