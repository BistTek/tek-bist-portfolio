import { useMemo } from 'react'
import useContent, { useProfile } from '../hooks/useContent'
import usePageMeta from '../hooks/usePageMeta'
import Img from '../components/Img'
import educationJson from '../data/education.json'
import experienceJson from '../data/experience.json'
import certsJson from '../data/certifications.json'
import projectsJson from '../data/projects.json'

const TYPE_STYLE = {
  Education: 'text-sky-700 dark:text-sky-300',
  Internship: 'text-amber-700 dark:text-amber-300',
  Work: 'text-emerald-700 dark:text-emerald-300',
  Project: 'text-violet-700 dark:text-violet-300',
  Certification: 'text-rose-700 dark:text-rose-300',
}

export default function About() {
  const profile = useProfile()
  usePageMeta('About', `About ${profile.name}: background, education and interests.`)
  const { data: education } = useContent('education', educationJson)
  const { data: experience } = useContent('experience', experienceJson)
  const { data: certs } = useContent('certifications', certsJson)
  const { data: projects } = useContent('projects', projectsJson)

  const entries = useMemo(
    () =>
      [
        ...education.map((e) => ({ key: `ed${e.id}`, year: e.start, type: 'Education', title: e.degree, org: e.institution })),
        ...experience.map((e) => ({
          key: `ex${e.id}`, year: e.start, type: /intern/i.test(e.type) ? 'Internship' : 'Work', title: e.title, org: e.company,
        })),
        ...certs.map((c) => ({ key: `ce${c.id}`, year: (c.date || '').slice(0, 4), type: 'Certification', title: c.name, org: c.issuer })),
        ...projects.filter((p) => p.year).slice(0, 3).map((p) => ({ key: `pr${p.id}`, year: p.year, type: 'Project', title: p.title, org: p.category })),
      ].sort((a, b) => (parseInt(b.year, 10) || 0) - (parseInt(a.year, 10) || 0)),
    [education, experience, certs, projects],
  )

  const interests = [
    ['Career interests', profile.careerInterests],
    ['Technical interests', profile.technicalInterests],
    ['Personal development goals', profile.goals],
  ].filter(([, v]) => v)

  return (
    <div className="section">
      <h1 className="text-3xl font-bold mb-8">About Me</h1>
      <div className="grid md:grid-cols-[auto_1fr] gap-10 mb-12">
        <Img src={profile.profilePhoto} alt={`Portrait of ${profile.name}`} className="h-48 w-48 rounded-2xl" />
        <div>
          <p className="text-slate-600 dark:text-slate-400 mb-4">{profile.shortBio}</p>
          {profile.location && <p className="text-sm text-slate-500">📍 {profile.location}</p>}
        </div>
      </div>

      {interests.length > 0 && (
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {interests.map(([label, text]) => (
            <div key={label} className="card p-5">
              <h2 className="font-semibold mb-2">{label}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">{text}</p>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-2xl font-bold mb-6">Timeline</h2>
      <ol className="relative border-l border-slate-200 dark:border-slate-800 ml-3">
        {entries.map((item) => (
          <li key={item.key} className="relative mb-8 ml-6 animate-slideUp">
            <span className="absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full bg-accent" aria-hidden="true" />
            <p className={`text-xs font-mono font-semibold ${TYPE_STYLE[item.type]}`}>{item.year} · {item.type}</p>
            <h3 className="font-semibold">{item.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{item.org}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}
