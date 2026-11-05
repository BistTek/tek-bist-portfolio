import { useState, useMemo } from 'react'
import useContent from '../hooks/useContent'
import usePageMeta from '../hooks/usePageMeta'
import projectsJson from '../data/projects.json'
import ProjectCard from '../components/ProjectCard'

const categories = ['All', 'Web', 'Python', 'AI/ML', 'Healthcare', 'Data', 'Other']

export default function Projects() {
  usePageMeta('Projects', 'Software, AI/ML and healthcare technology projects.')
  const { data: projects, loading } = useContent('projects', projectsJson)
  const [active, setActive] = useState('All')

  const filtered = useMemo(
    () => (active === 'All' ? projects : projects.filter((p) => p.category === active)),
    [active, projects],
  )

  return (
    <div className="section">
      <h1 className="text-3xl font-bold mb-2">Projects</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-8">Sample placeholder projects appear until you add your own.</p>

      <div className="flex flex-wrap gap-2 mb-10" role="group" aria-label="Filter projects">
        {categories.map((c) => (
          <button key={c} onClick={() => setActive(c)} aria-pressed={active === c} className={`pill ${active === c ? 'pill-active' : ''}`}>
            {c}
          </button>
        ))}
      </div>

      {loading ? <p className="text-slate-500">Loading…</p> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => <ProjectCard key={p.id} project={p} />)}
          {filtered.length === 0 && <p className="text-slate-500">No projects in this category yet.</p>}
        </div>
      )}
    </div>
  )
}
