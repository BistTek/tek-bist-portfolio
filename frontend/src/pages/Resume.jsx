import useContent, { useProfile } from '../hooks/useContent'
import usePageMeta from '../hooks/usePageMeta'
import { mediaUrl } from '../services/api'
import educationJson from '../data/education.json'
import experienceJson from '../data/experience.json'
import certsJson from '../data/certifications.json'
import skillsJson from '../data/skills.json'
import projectsJson from '../data/projects.json'

const H = ({ children }) => <h2 className="font-semibold text-lg mb-3 border-b border-slate-200 dark:border-slate-800 pb-1">{children}</h2>

export default function Resume() {
  const profile = useProfile()
  usePageMeta('Resume', `Resume of ${profile.name}.`)
  const { data: education } = useContent('education', educationJson)
  const { data: experience } = useContent('experience', experienceJson)
  const { data: certs } = useContent('certifications', certsJson)
  const { data: skills } = useContent('skills', skillsJson)
  const { data: projects } = useContent('projects', projectsJson)
  const cv = mediaUrl(profile.cvFile)
  const work = experience.filter((e) => !/intern/i.test(e.type))
  const interns = experience.filter((e) => /intern/i.test(e.type))

  const Job = ({ e }) => (
    <li className="mb-3">
      <p className="font-medium">{e.title}, {e.company} <span className="text-xs text-slate-500 font-mono">({e.start} – {e.end})</span></p>
      <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400">{(e.responsibilities || []).map((r) => <li key={r}>{r}</li>)}</ul>
    </li>
  )

  return (
    <div className="section max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">Resume</h1>
        {cv && <a href={cv} download className="btn-primary">Download CV (PDF)</a>}
      </div>

      <section className="mb-8"><H>Professional summary</H><p className="text-slate-600 dark:text-slate-400">{profile.shortBio}</p></section>
      <section className="mb-8"><H>Education</H>
        <ul>{education.map((e) => (
          <li key={e.id} className="mb-2"><span className="font-medium">{e.degree}</span>, {e.institution} <span className="text-xs text-slate-500 font-mono">({e.start} – {e.end})</span></li>
        ))}</ul>
      </section>
      <section className="mb-8"><H>Technical skills</H>
        <ul className="space-y-1 text-sm">{skills.map((g) => (
          <li key={g.id ?? g.category}><span className="font-medium">{g.category}:</span> <span className="text-slate-600 dark:text-slate-400">{(g.items || []).join(', ')}</span></li>
        ))}</ul>
      </section>
      {work.length > 0 && <section className="mb-8"><H>Work experience</H><ul>{work.map((e) => <Job key={e.id} e={e} />)}</ul></section>}
      {interns.length > 0 && <section className="mb-8"><H>Internships</H><ul>{interns.map((e) => <Job key={e.id} e={e} />)}</ul></section>}
      <section className="mb-8"><H>Projects</H>
        <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400">{projects.slice(0, 5).map((p) => <li key={p.id}>{p.title}: {p.description}</li>)}</ul>
      </section>
      <section className="mb-8"><H>Certifications</H>
        <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400">{certs.map((c) => <li key={c.id}>{c.name}, {c.issuer} ({c.date})</li>)}</ul>
      </section>
      <section className="mb-8"><H>Achievements</H><p className="text-sm text-slate-600 dark:text-slate-400">[Add your achievements here.]</p></section>
      <section><H>Languages</H><p className="text-sm text-slate-600 dark:text-slate-400">[Add languages and proficiency here.]</p></section>
    </div>
  )
}
