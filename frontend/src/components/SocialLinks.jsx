import { safeLink } from '../services/api'

export default function SocialLinks({ profile, className = '' }) {
  const email = profile.email && profile.email.includes('@') ? `mailto:${profile.email}` : ''
  const core = [
    ['GitHub', safeLink(profile.github)],
    ['LinkedIn', safeLink(profile.linkedin)],
    ['Email', email],
  ]
  const optional = [
    ['Facebook', safeLink(profile.facebook)],
    ['Instagram', safeLink(profile.instagram)],
    ['X', safeLink(profile.x)],
  ].filter(([, url]) => url)

  return (
    <ul className={`flex flex-wrap gap-x-5 gap-y-2 text-sm ${className}`}>
      {[...core, ...optional].map(([label, url]) => (
        <li key={label}>
          {url ? (
            <a href={url} className="link" target={url.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
              {label}
            </a>
          ) : (
            <span className="text-slate-500" title="Add this link in your profile">{label}</span>
          )}
        </li>
      ))}
    </ul>
  )
}
