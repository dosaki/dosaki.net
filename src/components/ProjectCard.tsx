import type { Project } from '../content/types'

export function ProjectCard({ project }: { project: Project }) {
  return (
    <li className={`project ${project.status}`}>
      <img
        src={project.icon}
        alt=""
        width={64}
        height={64}
        className={project.pixelatedImage ? 'pixelated' : undefined}
      />
      <h2>
        {project.link ? <a href={project.link}>{project.name}</a> : project.name}
      </h2>
      {project.status === 'inactive' ? (
        <p className="status">{project.status}</p>
      ) : null}
      <div dangerouslySetInnerHTML={{ __html: project.description }} />
      <p className="tags">
        {[project.type, ...project.tags].map((tag) => `#${tag}`).join(' ')}
      </p>
      {project.source ? (
        <a href={project.source}>{`${project.name} source`}</a>
      ) : null}
    </li>
  )
}
