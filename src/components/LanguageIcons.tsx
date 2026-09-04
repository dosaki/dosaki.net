import { LANGUAGE_ICONS, type LanguageName } from '../icons/languages.generated'
import styles from './LanguageIcons.module.css'

/**
 * The languages a project is written in, as marks rather than words.
 *
 * Rendered monochrome. Each language's real brand colour would be more
 * recognisable, but ten hard-coded hexes outside tokens.css is exactly the
 * drift the token system exists to prevent — and a row of saturated logos
 * would out-shout the card's own title.
 *
 * Renders nothing for a project with no languages, rather than an empty row
 * that would misalign the footer against its neighbours.
 */
export function LanguageIcons({ languages }: { languages: LanguageName[] }) {
  if (languages.length === 0) return null
  return (
    <ul className={styles.list}>
      {languages.map((language) => {
        const { label, viewBox, d } = LANGUAGE_ICONS[language]
        return (
          <li key={language}>
            {/* role="img" + <title> gives one accessible name and a hover
                tooltip from the same markup; the marks are unlabelled
                otherwise, and not everyone can name a language by its logo. */}
            <svg className={styles.icon} viewBox={viewBox} role="img">
              <title>{label}</title>
              <path d={d} fill="currentColor" />
            </svg>
          </li>
        )
      })}
    </ul>
  )
}
