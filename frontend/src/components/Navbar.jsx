import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useProfile } from '../hooks/useContent'

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/skills', label: 'Skills' },
  { to: '/projects', label: 'Projects' },
  { to: '/notes', label: 'Notes' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/experience', label: 'Experience' },
  { to: '/certifications', label: 'Certifications' },
  { to: '/resume', label: 'Resume' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar({ theme, toggleTheme }) {
  const [open, setOpen] = useState(false)
  const profile = useProfile()
  const [first = 'Tek', ...rest] = (profile.name || 'Tek Bist').replace(/^Er\.\s*/i, '').split(' ')

  const linkClass = ({ isActive }) =>
    `px-2.5 py-2 text-sm font-medium rounded-md transition-colors ${
      isActive ? 'text-accent-dark dark:text-accent' : 'text-slate-600 dark:text-slate-300 hover:text-accent-dark dark:hover:text-accent'
    }`

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-white/85 dark:bg-ink/85 border-b border-slate-200 dark:border-slate-800">
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between" aria-label="Main">
        <NavLink to="/" className="font-mono font-bold text-lg tracking-tight">
          {first}<span className="text-accent-dark dark:text-accent">.</span>{rest.join(' ')}
        </NavLink>

        <div className="hidden lg:flex items-center">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass} end={l.to === '/'}>{l.label}</NavLink>
          ))}
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="ml-3 h-9 w-9 grid place-items-center rounded-full border border-slate-300 dark:border-slate-700 hover:border-accent transition-colors"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>

        <button
          className="lg:hidden h-10 w-10 grid place-items-center text-2xl"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? '✕' : '☰'}
        </button>
      </nav>

      {open && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex flex-col gap-1 animate-slideUp">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass} end={l.to === '/'} onClick={() => setOpen(false)}>
              {l.label}
            </NavLink>
          ))}
          <button onClick={toggleTheme} className="text-left px-2.5 py-2 text-sm font-medium">
            {theme === 'dark' ? '☀️ Light mode' : '🌙 Dark mode'}
          </button>
        </div>
      )}
    </header>
  )
}
