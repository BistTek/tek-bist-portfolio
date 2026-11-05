import { useState } from 'react'
import { Navigate, useNavigate, Link } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import usePageMeta from '../../hooks/usePageMeta'
import { API_ENABLED } from '../../services/api'
import ResourceManager from '../../components/admin/ResourceManager'
import { ProfileEditor, MessagesManager } from '../../components/admin/Extras'
import { TABS } from '../../components/admin/config'

const ALL_TABS = [
  ...TABS.map((t) => ({ key: t.key, label: t.label })),
  { key: 'profile', label: 'Profile' },
  { key: 'messages', label: 'Messages' },
]

export default function Dashboard() {
  usePageMeta('Admin', '', { noindex: true })
  const { token, logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('projects')

  if (!API_ENABLED || !token) return <Navigate to="/admin/login" replace />

  const onAuthError = () => { logout(); navigate('/admin/login') }
  const current = TABS.find((t) => t.key === tab)

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <header className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">Admin dashboard</h1>
        <div className="flex gap-3">
          <Link to="/" className="btn-outline !py-1.5 !text-sm">View site</Link>
          <button className="btn-outline !py-1.5 !text-sm" onClick={onAuthError}>Log out</button>
        </div>
      </header>

      <nav className="flex flex-wrap gap-2 mb-8" aria-label="Admin sections">
        {ALL_TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} aria-pressed={tab === t.key} className={`pill ${tab === t.key ? 'pill-active' : ''}`}>
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'profile' ? <ProfileEditor token={token} onAuthError={onAuthError} />
        : tab === 'messages' ? <MessagesManager token={token} onAuthError={onAuthError} />
        : <ResourceManager key={tab} title={current.label} endpoint={current.endpoint} fields={current.fields} labelKey={current.labelKey} token={token} onAuthError={onAuthError} />}
    </div>
  )
}
