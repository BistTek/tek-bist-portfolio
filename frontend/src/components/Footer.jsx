import { Link } from 'react-router-dom'
import { useProfile } from '../hooks/useContent'
import SocialLinks from './SocialLinks'

const quick = [['About', '/about'], ['Projects', '/projects'], ['Notes', '/notes'], ['Resume', '/resume'], ['Contact', '/contact']]

export default function Footer() {
  const profile = useProfile()
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 mt-10">
      <div className="max-w-6xl mx-auto px-6 py-10 grid gap-8 md:grid-cols-3 text-sm text-slate-600 dark:text-slate-400">
        <div>
          <p className="font-semibold text-slate-900 dark:text-slate-100">{profile.name}</p>
          <p>{profile.title}</p>
          <p className="mt-2 max-w-xs">{profile.tagline}</p>
        </div>
        <nav aria-label="Footer">
          <p className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Quick links</p>
          <ul className="space-y-1">
            {quick.map(([label, to]) => <li key={to}><Link to={to} className="link">{label}</Link></li>)}
          </ul>
        </nav>
        <div>
          <p className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Find me online</p>
          <SocialLinks profile={profile} />
        </div>
      </div>
      <p className="text-center text-xs text-slate-500 pb-8">
        © {new Date().getFullYear()} {profile.name}. All rights reserved.
      </p>
    </footer>
  )
}
