import { Link, createFileRoute } from '@tanstack/react-router'
import { Icon } from '../icons/Icon'
import { LanguageChart, type ChartMode } from '../components/LanguageChart'
import { languages } from '../content/languages.generated'
import { site } from '../content/site'
import styles from '../styles/page.module.css'

interface AboutSearch {
  by: ChartMode
}

// TypeScript infers a disjoint union of literal shapes for the `paragraphs`
// array (one shape per distinct combination of optional keys actually used),
// which prevents accessing `part.href` etc. across the whole union. This type
// mirrors the `satisfies` clause in site.ts so the map callback can read any
// of the optional flags without re-triggering that inference.
type ParagraphPart = { text: string; href?: string; emphasis?: boolean; aside?: boolean }

export const Route = createFileRoute('/about')({
  validateSearch: (search: Record<string, unknown>): AboutSearch => ({
    by: search.by === 'years' ? 'years' : 'projects',
  }),
  component: About,
})

function About() {
  const { by } = Route.useSearch()
  const { heading, photo, social, paragraphs, languagesIntro } = site.about
  const other: ChartMode = by === 'projects' ? 'years' : 'projects'

  return (
    <section>
      <p className={styles.sectionLabel}>About</p>
      <div className={styles.aboutHead}>
        <h1>{heading}</h1>

        <ul className={styles.social}>
          {social.map((link) => (
            <li key={link.href}>
              <a href={link.href} aria-label={link.label}>
                <Icon name={link.icon} title={link.label} />
              </a>
            </li>
          ))}
        </ul>
      </div>
      <hr className={styles.rule} />

      {paragraphs.map((parts: ParagraphPart[], index) => (
        <p key={index} className={styles.measure}>
          {parts.map((part, partIndex) => {
            if (part.href) {
              return <a key={partIndex} href={part.href}>{part.text}</a>
            }
            if (part.emphasis) {
              return <em key={partIndex} className={styles.emphasis}>{part.text}</em>
            }
            if (part.aside) {
              return <span key={partIndex} className={styles.aside}>{part.text}</span>
            }
            return <span key={partIndex}>{part.text}</span>
          })}
        </p>
      ))}

      <img src={photo.src} alt={photo.alt} width={200} className={styles.portrait} />

      <div className={styles.chartFrame}>
        <LanguageChart languages={languages} by={by} />
      </div>

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
