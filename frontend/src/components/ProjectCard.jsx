import { Link } from 'react-router-dom'
import Img from './Img'
import { safeLink } from '../services/api'

export default function ProjectCard({ project }) {
  const github = safeLink(project.github)
  const demo = safeLink(project.demo)
  return (
    <article className="card p-5 flex flex-col animate-slideUp">
      <Img src={project.image} alt={`${project.title} preview`} className="h-40 w-full rounded-lg mb-4" />
      <span className="text-xs font-mono text-accent-dark dark:text-accent mb-1">{project.category}</span>
      <h3 className="font-semibold text-lg mb-2">{project.title}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 flex-1">{project.description}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {(project.tech || []).map((t) => <span key={t} className="chip">{t}</span>)}
      </div>
      <div className="flex flex-wrap gap-4 text-sm font-medium">
        <Link to={`/projects/${project.id}`} className="link">Details →</Link>
        {github && <a href={github} className="link" target="_blank" rel="noopener noreferrer">GitHub</a>}
        {demo && <a href={demo} className="link" target="_blank" rel="noopener noreferrer">Live demo</a>}
      </div>
    </article>
  )
}
