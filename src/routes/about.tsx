import { createFileRoute } from '@tanstack/react-router'
import { Icon } from '../icons/Icon'
import { ScribbleArrow } from '../components/ScribbleArrow'
import { site } from '../content/site'
import styles from '../styles/page.module.css'

// TypeScript infers a disjoint union of literal shapes for the `paragraphs`
// array (one shape per distinct combination of optional keys actually used),
// which prevents accessing `part.href` etc. across the whole union. This type
// mirrors the `satisfies` clause in site.ts so the map callback can read any
// of the optional flags without re-triggering that inference.
type ParagraphPart = { text: string; href?: string; emphasis?: boolean }

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  const { heading, photo, social, paragraphs } = site.about

  return (
    <section>
      <p className={styles.sectionLabel}>About</p>
      <div className={styles.aboutHead}>
        <h1>{heading}</h1>

        <ul className={styles.social} role="list">
          {social.map((link) => (
            <li key={link.href}>
              <a href={link.href} aria-label={link.label}>
                <Icon name={link.icon} title={link.label} />
              </a>
            </li>
          ))}
        </ul>
      </div>
      <hr className={styles.rule} aria-hidden="true" />

      <div className={styles.bio}>
        <div>
        {paragraphs.map((parts: ParagraphPart[], index) => (
          <p key={index} className={styles.measure}>
            {parts.map((part, partIndex) => {
              if (part.href) {
                return <a key={partIndex} href={part.href}>{part.text}</a>
              }
              if (part.emphasis) {
                return <em key={partIndex} className={styles.emphasis}>{part.text}</em>
              }
              return <span key={partIndex}>{part.text}</span>
            })}
          </p>
        ))}
        </div>

        <figure className={styles.portraitFigure}>
          <img src={photo.src} alt={photo.alt} width={200} className={styles.portrait} />
          <figcaption className={styles.portraitNote}>
            <ScribbleArrow className={styles.portraitArrow} />
            <span className={styles.portraitLabel}>That&apos;s me!</span>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
