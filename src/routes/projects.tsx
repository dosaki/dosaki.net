import { createFileRoute } from '@tanstack/react-router'
import { ProjectCard } from '../components/ProjectCard'
import { orderProjects } from '../content/ordering'
import { projects } from '../content/projects'
import { site } from '../content/site'
import styles from '../styles/page.module.css'

export const Route = createFileRoute('/projects')({
  component: Projects,
})

function Projects() {
  const ordered = orderProjects(projects)
  return (
    <section>
      <h1>{site.titles.projects}</h1>
      <hr className={styles.rule} aria-hidden="true" />
      <ul className={styles.grid} aria-label="Projects" role="list">
        {ordered.flatMap((project, index) => {
          const card = <ProjectCard key={project.name} project={project} />
          // The only division that matters is archived vs not — not one break
          // per status change.
          const startsBand =
            index > 0 &&
            project.status === 'inactive' &&
            ordered[index - 1].status !== 'inactive'
          return startsBand
            ? [
                <li
                  key="band-archived"
                  className={styles.bandBreak}
                  aria-hidden="true"
                >
                  <hr className={styles.bandBreakRule} />
                </li>,
                card,
              ]
            : [card]
        })}
      </ul>
    </section>
  )
}
