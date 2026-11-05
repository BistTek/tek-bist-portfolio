import { useCallback, useEffect, useState } from 'react'
import { api } from '../../services/api'
import FieldForm, { emptyValues, toForm, fromForm } from './FieldForm'
import { PROFILE_FIELDS } from './config'

export function ProfileEditor({ token, onAuthError }) {
  const [values, setValues] = useState(emptyValues(PROFILE_FIELDS))
  const [error, setError] = useState('')
  const [ok, setOk] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/api/profile')
      .then((p) => setValues({ ...emptyValues(PROFILE_FIELDS), ...toForm(p, PROFILE_FIELDS) }))
      .catch((e) => setError(e.message))
  }, [])

  const save = async (e) => {
    e.preventDefault()
    setSaving(true); setError(''); setOk(false)
    try {
      await api.put('/api/profile', fromForm(values, PROFILE_FIELDS), token)
      setOk(true)
    } catch (err) {
      if (err.status === 401) onAuthError()
      else setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={save} className="max-w-3xl">
      <h2 className="text-xl font-semibold mb-6">Profile</h2>
      <FieldForm fields={PROFILE_FIELDS} values={values} setValues={setValues} token={token} onAuthError={onAuthError} onError={setError} />
      {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400 mt-4">{error}</p>}
      {ok && <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-4">Profile saved.</p>}
      <button className="btn-primary mt-6" disabled={saving}>{saving ? 'Saving…' : 'Save profile'}</button>
    </form>
  )
}

export function MessagesManager({ token, onAuthError }) {
  const [items, setItems] = useState([])
  const [error, setError] = useState('')

  const handle = useCallback((err) => (err.status === 401 ? onAuthError() : setError(err.message)), [onAuthError])
  const load = useCallback(() => api.get('/api/contact', token).then(setItems).catch(handle), [token, handle])
  useEffect(() => { load() }, [load])

  const markRead = async (m) => { try { await api.post(`/api/contact/${m.id}/read`, {}, token); load() } catch (e) { handle(e) } }
  const remove = async (m) => {
    if (!window.confirm('Delete this message?')) return
    try { await api.del(`/api/contact/${m.id}`, token); load() } catch (e) { handle(e) }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Messages</h2>
      {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>}
      {items.length === 0 ? <p className="text-slate-500">No messages yet.</p> : (
        <ul className="space-y-4 max-w-3xl">
          {items.map((m) => (
            <li key={m.id} className={`card hover:!translate-y-0 p-4 ${m.isRead ? 'opacity-70' : ''}`}>
              <div className="flex flex-wrap justify-between gap-2 text-sm">
                <p className="font-semibold">{m.subject}</p>
                <p className="text-slate-500">{new Date(m.createdAt).toLocaleString()}</p>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                {m.name} · <a className="link" href={`mailto:${m.email}`}>{m.email}</a>
              </p>
              <p className="whitespace-pre-line text-sm mb-3">{m.message}</p>
              <div className="flex gap-3">
                {!m.isRead && <button className="btn-outline !py-1 !text-sm" onClick={() => markRead(m)}>Mark read</button>}
                <button className="btn-danger" onClick={() => remove(m)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
