import { useCallback, useEffect, useState } from 'react'
import { api } from '../../services/api'
import FieldForm, { emptyValues, toForm, fromForm } from './FieldForm'

export default function ResourceManager({ title, endpoint, fields, labelKey, token, onAuthError }) {
  const [items, setItems] = useState([])
  const [editing, setEditing] = useState(null) // null | 'new' | item
  const [values, setValues] = useState({})
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const handle = useCallback((err) => {
    if (err.status === 401) onAuthError()
    else setError(err.message)
  }, [onAuthError])

  const load = useCallback(async () => {
    try {
      setItems(await api.get(endpoint, token))
    } catch (err) {
      handle(err)
    } finally {
      setLoading(false)
    }
  }, [endpoint, token, handle])

  useEffect(() => { load() }, [load])

  const startNew = () => { setValues(emptyValues(fields)); setEditing('new'); setError('') }
  const startEdit = (item) => { setValues(toForm(item, fields)); setEditing(item); setError('') }

  const save = async (e) => {
    e.preventDefault()
    const missing = fields.find((f) => f.required && !String(values[f.name] ?? '').trim())
    if (missing) { setError(`${missing.label} is required.`); return }
    setSaving(true)
    setError('')
    try {
      const body = fromForm(values, fields)
      if (editing === 'new') await api.post(endpoint, body, token)
      else await api.put(`${endpoint}/${editing.id}`, body, token)
      await load()
      setEditing(null)
    } catch (err) {
      handle(err)
    } finally {
      setSaving(false)
    }
  }

  const remove = async (item) => {
    if (!window.confirm(`Delete "${item[labelKey]}"? This cannot be undone.`)) return
    try {
      await api.del(`${endpoint}/${item.id}`, token)
      await load()
    } catch (err) {
      handle(err)
    }
  }

  if (editing !== null) {
    return (
      <form onSubmit={save} className="max-w-3xl">
        <h2 className="text-xl font-semibold mb-6">{editing === 'new' ? `New ${title.toLowerCase()}` : `Edit ${title.toLowerCase()}`}</h2>
        <FieldForm fields={fields} values={values} setValues={setValues} token={token} onAuthError={onAuthError} onError={setError} />
        {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400 mt-4">{error}</p>}
        <div className="flex gap-3 mt-6">
          <button className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          <button type="button" className="btn-outline" onClick={() => setEditing(null)}>Cancel</button>
        </div>
      </form>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">{title}</h2>
        <button className="btn-primary" onClick={startNew}>+ New</button>
      </div>
      {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>}
      {loading ? <p className="text-slate-500">Loading…</p> : items.length === 0 ? (
        <p className="text-slate-500">Nothing here yet. Click “+ New” to add the first one.</p>
      ) : (
        <ul className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl">
          {items.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <span className="font-medium flex-1 min-w-[10rem]">
                {item[labelKey] || '(untitled)'}
                {item.published === false && <span className="chip ml-2">Draft</span>}
              </span>
              <button className="btn-outline !py-1.5 !text-sm" onClick={() => startEdit(item)}>Edit</button>
              <button className="btn-danger" onClick={() => remove(item)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
