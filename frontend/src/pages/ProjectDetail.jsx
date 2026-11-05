import { useParams, Link } from 'react-router-dom'
import useContent from '../hooks/useContent'
import usePageMeta from '../hooks/usePageMeta'
import projectsJson from '../data/projects.json'
import Img from '../components/Img'
import { safeLink } from '../services/api'

function Block({ title, children }) {
  if (!children || (Array.isArray(children) && children.length === 0)) return null
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      {children}
    </section>
  )
}
const Text = ({ value }) => (value ? <p className="text-slate-600 dark:text-slate-400 whitespace-pre-line">{value}</p> : null)
const List = ({ items }) =>
  items && items.length ? (
    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">{items.map((i) => <li key={i}>{i}</li>)}</ul>
  ) : null

export default function ProjectDetail() {
  const { id } = useParams()
  const { data: projects, loading } = useContent('projects', projectsJson)
  const project = projects.find((p) => String(p.id) === id)
  usePageMeta(project ? project.title : 'Project', project?.description)

  if (loading) return <div className="section text-slate-500">Loading…</div>
  if (!project) {
    return (
      <div className="section">
        <p className="mb-4">Project not found.</p>
        <Link to="/projects" className="link">← Back to projects</Link>
      </div>
    )
  }
  const github = safeLink(project.github)
  const demo = safeLink(project.demo)

  return (
    <article className="section max-w-4xl">
      <Link to="/projects" className="link text-sm">← Back to projects</Link>
      <p className="font-mono text-xs text-accent-dark dark:text-accent mt-4">{project.category}{project.year ? ` · ${project.year}` : ''}</p>
      <h1 className="text-3xl md:text-4xl font-bold my-3">{project.title}</h1>
      <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">{project.description}</p>

      <div className="flex flex-wrap gap-3 mb-8">
        {github && <a href={github} className="btn-outline" target="_blank" rel="noopener noreferrer">GitHub repository</a>}
        {demo && <a href={demo} className="btn-primary" target="_blank" rel="noopener noreferrer">Live demo</a>}
      </div>

      <Img src={project.image} alt={`${project.title} cover`} className="w-full h-64 md:h-80 rounded-xl mb-10" />

      <Block title="Overview"><Text value={project.overview} /></Block>
      <Block title="Problem statement"><Text value={project.problem} /></Block>
      <Block title="Objectives"><List items={project.objectives} /></Block>
      <Block title="Features"><List items={project.features} /></Block>
      <Block title="Technology stack">
        <div className="flex flex-wrap gap-2">{(project.tech || []).map((t) => <span key={t} className="chip">{t}</span>)}</div>
      </Block>
      <Block title="Architecture"><Text value={project.architecture} /></Block>
      <Block title="Screenshots">
        {project.screenshots && project.screenshots.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-4">
            {project.screenshots.map((s, i) => <Img key={s} src={s} alt={`${project.title} screenshot ${i + 1}`} className="w-full h-52 rounded-lg" />)}
          </div>
        )}
      </Block>
      <Block title="Challenges"><Text value={project.challenges} /></Block>
      <Block title="Solutions"><Text value={project.solutions} /></Block>
      <Block title="Results"><Text value={project.results} /></Block>
      <Block title="Future improvements"><List items={project.futureImprovements} /></Block>
    </article>
  )
}
