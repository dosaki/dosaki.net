import type { IconName } from '../icons/paths.generated'
import type { LanguageName } from '../icons/languages.generated'

export type ProjectType = 'bot' | 'game' | 'mod' | 'tool'
export type ProjectStatus = 'active' | 'done' | 'inactive'
export type TalkType = 'talk' | 'blog' | 'workshop' | 'podcast'

export interface Project {
  name: string
  /** Legacy: contains raw HTML. Flagged for the design overhaul. */
  description: string
  icon: string
  link: string | null
  source: string | null
  type: ProjectType
  status: ProjectStatus
  tags: string[]
  /** Derived from GitHub by scripts/derive-languages.mjs. Empty is meaningful:
      it says the repo has no programming language, not that we didn't look. */
  languages: LanguageName[]
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

