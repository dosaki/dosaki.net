import type { Project } from '../content/types'
import styles from './ProjectCard.module.css'

export function ProjectCard({ project }: { project: Project }) {
  return (
    <li className={styles.card}>
      <img
        src={project.icon}
        alt=""
        width={240}
        height={150}
        className={`${styles.icon} ${project.pixelatedImage ? 'pixelated' : ''}`}
      />
      <div className={styles.body}>
        <h2 className={styles.name}>
          {project.link ? <a href={project.link}>{project.name}</a> : project.name}
        </h2>
        {project.status === 'inactive' ? (
          <p className={styles.badge}>{project.status}</p>
        ) : null}
        <div
          className={styles.description}
          dangerouslySetInnerHTML={{ __html: project.description }}
        />
        <p className={styles.tags}>
          {[project.type, ...project.tags].map((tag) => `#${tag}`).join(' ')}
        </p>
      </div>
      {project.source ? (
        <a
          className={styles.source}
          href={project.source}
          aria-label={`${project.name} source`}
        >
          source
        </a>
      ) : null}
    </li>
  )
}
