import type { LanguageStat, Project, ProjectStatus, Talk } from './types'

const STATUS_BAND: Record<ProjectStatus, number> = {
  active: 0,
  done: 1,
  inactive: 2,
}

export function orderProjects(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => {
    const band = STATUS_BAND[a.status] - STATUS_BAND[b.status]
    if (band !== 0) return band
    return a.type.localeCompare(b.type)
  })
}

export function orderTalks(talks: Talk[]): Talk[] {
  return [...talks].sort((a, b) => b.date - a.date)
}

/**
 * A language's chart slice value: project count in 'projects' mode, or the
 * year span in 'years' mode. When both years are null (a language with no
 * tracked usage span, e.g. c#/lua in the seed data) the span is 0, which
 * falls back to 1 so it still renders a visible slice — matching the old
 * site's `|| 1` behaviour.
 */
export function chartValue(stat: LanguageStat, mode: 'projects' | 'years'): number {
  if (mode === 'projects') return stat.projects.length
  return (stat.endYear ?? 0) - (stat.startYear ?? 0) || 1
}
