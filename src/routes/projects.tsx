import { createFileRoute } from '@tanstack/react-router'
import { ProjectCard } from '../components/ProjectCard'
import { orderProjects } from '../content/ordering'
import { projects } from '../content/projects'
import { site } from '../content/site'

export const Route = createFileRoute('/projects')({
  component: Projects,
})

function Projects() {
  return (
    <section>
      <h1>{site.titles.projects}</h1>
      <ul className="list" aria-label="Projects">
        {orderProjects(projects).map((project) => (
          <ProjectCard key={project.name} project={project} />
        ))}
      </ul>
    </section>
  )
}
