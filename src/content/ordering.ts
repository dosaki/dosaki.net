import type { Project, ProjectStatus, Talk } from './types'

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

