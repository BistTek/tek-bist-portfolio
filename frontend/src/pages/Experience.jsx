import useContent from '../hooks/useContent'
import usePageMeta from '../hooks/usePageMeta'
import experienceJson from '../data/experience.json'

export default function Experience() {
  usePageMeta('Experience', 'Professional experience and internships.')
  const { data: jobs, loading } = useContent('experience', experienceJson)

  return (
    <div className="section max-w-3xl">
      <h1 className="text-3xl font-bold mb-10">Experience</h1>
      {loading ? <p className="text-slate-500">Loading…</p> : (
        <ol className="relative border-l border-slate-200 dark:border-slate-800 ml-3">
          {jobs.map((job) => (
            <li key={job.id} className="relative mb-10 ml-6 animate-slideUp">
              <span className="absolute -left-[31px] top-2 h-3.5 w-3.5 rounded-full bg-accent" aria-hidden="true" />
              <div className="flex flex-wrap justify-between gap-2 mb-1">
                <h2 className="font-semibold text-lg">{job.title} · {job.company}</h2>
                <span className="text-xs font-mono text-slate-500">{job.start} – {job.end}</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{job.type} · {job.location}</p>
              <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 mb-3 space-y-1">
                {(job.responsibilities || []).map((r) => <li key={r}>{r}</li>)}
              </ul>
              <div className="flex flex-wrap gap-2 mb-3">{(job.tech || []).map((t) => <span key={t} className="chip">{t}</span>)}</div>
              {(job.achievements || []).map((a) => <p key={a} className="text-sm text-accent-dark dark:text-accent">★ {a}</p>)}
            </li>
          ))}
          {jobs.length === 0 && <p className="text-slate-500 ml-6">No experience added yet.</p>}
        </ol>
      )}
    </div>
  )
}
