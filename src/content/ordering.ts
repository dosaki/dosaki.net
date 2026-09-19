import type { Project, Talk } from './types'

// Archived projects sit below a divider on the page; nothing else is grouped.
// Within each side, the most recently committed project comes first.
export function orderProjects(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => {
    const archived = Number(a.status === 'inactive') - Number(b.status === 'inactive')
    if (archived !== 0) return archived
    // ISO dates compare correctly as strings, so no Date parsing is needed.
    if (a.lastCommit !== b.lastCommit) return a.lastCommit < b.lastCommit ? 1 : -1
    return a.name.localeCompare(b.name)
  })
}

export function orderTalks(talks: Talk[]): Talk[] {
  return [...talks].sort((a, b) => b.date - a.date)
}

