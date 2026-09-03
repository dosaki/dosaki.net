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
      <ul className={styles.list} aria-label="Projects" role="list">
        {ordered.map((project, index) => (
          <ProjectCard
            key={project.name}
            project={project}
            startsBand={index > 0 && project.status !== ordered[index - 1].status}
          />
        ))}
      </ul>
    </section>
  )
}
