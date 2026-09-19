import type { IconName } from '../icons/paths.generated'
import type { LanguageName } from '../icons/languages.generated'

export type ProjectType = 'bot' | 'game' | 'mod' | 'site' | 'tool'
export type ProjectStatus = 'active' | 'done' | 'inactive'
export type TalkType = 'talk' | 'blog' | 'workshop' | 'podcast'

export interface Project {
  name: string
  /** Legacy: contains raw HTML. Flagged for the design overhaul. */
  description: string
  icon: string
  link: string | null
  /** Shown as the source badge. Null hides it, whether or not a repo exists. */
  source: string | null
  /** GitHub `owner/name` to derive from when `source` is hidden. Private repos
      need GITHUB_TOKEN set when running scripts/derive-from-github.mjs. */
  repo?: string
  type: ProjectType
  status: ProjectStatus
  tags: string[]
  /** Derived from GitHub by scripts/derive-from-github.mjs. Empty is meaningful:
      it says the repo has no programming language, not that we didn't look. */
  languages: LanguageName[]
  /** ISO date (YYYY-MM-DD) of the newest commit on the repo's default branch.
      Derived from GitHub by scripts/derive-from-github.mjs; drives page order. */
  lastCommit: string
  pixelatedImage?: boolean
}

export interface Talk {
  name: string
  /** Legacy: contains raw HTML. Flagged for the design overhaul. */
  description: string
  type: TalkType
  date: number
  link: string | null
  status: string | null
  tags: string[]
}

export interface SocialLink {
  label: string
  href: string
  icon: IconName
}

