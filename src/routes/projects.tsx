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
      <p className={styles.sectionLabel}>Portfolio</p>
      <h1>{site.titles.projects}</h1>
      <hr className={styles.rule} aria-hidden="true" />
      <ul className={styles.grid} aria-label="Projects" role="list">
        {ordered.flatMap((project, index) => {
          const card = <ProjectCard key={project.name} project={project} />
          const startsBand =
            index > 0 && project.status !== ordered[index - 1].status
          return startsBand
            ? [
                <li
                  key={`band-${project.status}`}
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
