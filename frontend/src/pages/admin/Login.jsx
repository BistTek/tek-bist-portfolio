import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import usePageMeta from '../../hooks/usePageMeta'
import { API_ENABLED } from '../../services/api'

export default function Login() {
  usePageMeta('Admin login', '', { noindex: true })
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await login(username, password)
      navigate('/admin')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (!API_ENABLED) {
    return (
      <div className="section max-w-md">
        <h1 className="text-2xl font-bold mb-3">Admin</h1>
        <p className="text-slate-600 dark:text-slate-400">
          The admin dashboard needs the backend. Copy <code>.env.example</code> to <code>.env</code> in the
          frontend folder, set <code>VITE_API_URL</code>, and restart <code>npm run dev</code>.
        </p>
      </div>
    )
  }

  return (
    <div className="section max-w-md">
      <h1 className="text-2xl font-bold mb-6">Admin login</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="u" className="block text-sm font-medium mb-1">Username</label>
          <input id="u" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required className="field" />
        </div>
        <div>
          <label htmlFor="p" className="block text-sm font-medium mb-1">Password</label>
          <input id="p" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required className="field" />
        </div>
        <button className="btn-primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      </form>
    </div>
  )
}
