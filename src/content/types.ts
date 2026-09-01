import type { IconName } from '../icons/paths.generated'

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

export interface LanguageStat {
  projects: string[]
  startYear: number | null
  endYear: number | null
}

export type LanguageMap = Record<string, LanguageStat>
