import { Link } from 'react-router-dom'
import { useProfile } from '../hooks/useContent'
import usePageMeta from '../hooks/usePageMeta'
import { mediaUrl } from '../services/api'
import Img from '../components/Img'
import SocialLinks from '../components/SocialLinks'

const techStack = ['Python', 'JavaScript', 'React', 'FastAPI', 'Django', 'SQL', 'Git', 'Docker', 'Linux', 'Machine Learning', 'AI', 'REST APIs', 'FHIR', 'Cloud']

export default function Home() {
  const profile = useProfile()
  usePageMeta('', profile.tagline)
  const cv = mediaUrl(profile.cvFile)

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-accent/10 via-transparent to-transparent" aria-hidden="true" />
        <div className="section grid md:grid-cols-[1fr_auto] items-center gap-10">
          <div className="animate-fadeIn">
            <p className="font-mono text-accent-dark dark:text-accent mb-3">Hi, I'm</p>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">{profile.name}</h1>
            <p className="text-xl md:text-2xl font-semibold text-slate-600 dark:text-slate-300 mb-6">{profile.title}</p>
            <p className="max-w-xl text-slate-600 dark:text-slate-400 mb-8">{profile.tagline}</p>
            <div className="flex flex-wrap gap-4 mb-8">
              <Link to="/projects" className="btn-primary">View My Projects</Link>
              {cv && <a href={cv} download className="btn-outline">Download CV</a>}
              <Link to="/contact" className="btn-outline">Contact Me</Link>
            </div>
            <SocialLinks profile={profile} />
          </div>
          <Img
            src={profile.profilePhoto}
            alt={`Portrait of ${profile.name}`}
            className="h-44 w-44 md:h-60 md:w-60 rounded-2xl shrink-0 shadow-lg"
          />
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-16" aria-label="Technologies">
        <p className="text-sm uppercase tracking-widest text-slate-500 mb-4">Technologies I work with</p>
        <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <div className="marquee gap-3">
            {[...techStack, ...techStack].map((t, i) => (
              <span
                key={`${t}-${i}`}
                aria-hidden={i >= techStack.length}
                className="mr-3 px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 text-sm font-mono whitespace-nowrap"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
