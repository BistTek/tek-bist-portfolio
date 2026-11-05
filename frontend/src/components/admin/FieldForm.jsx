import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { api } from '../../services/api'
import Img from '../Img'

export const defaultFor = (f) => {
  if (f.type === 'checkbox') return f.default ?? true
  if (f.type === 'images') return []
  return f.default ?? ''
}
export const emptyValues = (fields) => Object.fromEntries(fields.map((f) => [f.name, defaultFor(f)]))

export function toForm(item, fields) {
  const out = {}
  for (const f of fields) {
    const v = item[f.name]
    if (f.type === 'list') out[f.name] = (v || []).join(f.sep === '\n' ? '\n' : ', ')
    else if (f.type === 'images') out[f.name] = v || []
    else if (f.type === 'checkbox') out[f.name] = v ?? true
    else out[f.name] = v ?? ''
  }
  return out
}

export function fromForm(values, fields) {
  const out = {}
  for (const f of fields) {
    const v = values[f.name]
    if (f.type === 'list') {
      out[f.name] = String(v || '').split(f.sep === '\n' ? /\r?\n/ : ',').map((s) => s.trim()).filter(Boolean)
    } else {
      out[f.name] = v
    }
  }
  return out
}

function UploadControl({ endpoint, accept, token, onDone, onAuthError, onError, label }) {
  const [busy, setBusy] = useState(false)
  const onFile = async (e) => {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    setBusy(true)
    try {
      for (const file of files) {
        const res = await api.upload(endpoint, file, token)
        onDone(res.url)
      }
    } catch (err) {
      if (err.status === 401) onAuthError()
      else onError(err.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <label className="btn-outline cursor-pointer !py-1.5 !text-sm">
      {busy ? 'Uploading…' : label}
      <input type="file" accept={accept} onChange={onFile} multiple={label.includes('add')} className="sr-only" disabled={busy} />
    </label>
  )
}

function MarkdownField({ field, value, onChange }) {
  const [preview, setPreview] = useState(false)
  return (
    <div>
      <div className="flex gap-2 mb-2">
        <button type="button" className={`pill !py-0.5 !text-xs ${!preview ? 'pill-active' : ''}`} onClick={() => setPreview(false)}>Write</button>
        <button type="button" className={`pill !py-0.5 !text-xs ${preview ? 'pill-active' : ''}`} onClick={() => setPreview(true)}>Preview</button>
      </div>
      {preview ? (
        <div className="prose prose-slate dark:prose-invert max-w-none border border-slate-300 dark:border-slate-700 rounded-lg p-4 min-h-[12rem]">
          <ReactMarkdown>{value || '*Nothing to preview*'}</ReactMarkdown>
        </div>
      ) : (
        <textarea id={`f-${field.name}`} value={value} onChange={(e) => onChange(e.target.value)} rows={14} className="field font-mono text-sm" />
      )}
    </div>
  )
}

export default function FieldForm({ fields, values, setValues, token, onAuthError, onError }) {
  const set = (name, v) => setValues((s) => ({ ...s, [name]: v }))
  const up = { token, onAuthError, onError }

  return (
    <div className="space-y-5">
      {fields.map((f) => {
        const id = `f-${f.name}`
        const v = values[f.name]
        let control
        switch (f.type) {
          case 'textarea':
            control = <textarea id={id} value={v} onChange={(e) => set(f.name, e.target.value)} rows={f.rows || 4} className="field" />
            break
          case 'markdown':
            control = <MarkdownField field={f} value={v} onChange={(x) => set(f.name, x)} />
            break
          case 'list':
            control = f.sep === '\n'
              ? <textarea id={id} value={v} onChange={(e) => set(f.name, e.target.value)} rows={4} className="field" placeholder="One per line" />
              : <input id={id} value={v} onChange={(e) => set(f.name, e.target.value)} className="field" placeholder="Comma-separated" />
            break
          case 'select':
            control = (
              <select id={id} value={v} onChange={(e) => set(f.name, e.target.value)} className="field">
                {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            )
            break
          case 'checkbox':
            control = (
              <input id={id} type="checkbox" checked={Boolean(v)} onChange={(e) => set(f.name, e.target.checked)} className="h-5 w-5 accent-cyan-600" />
            )
            break
          case 'image':
          case 'pdf':
            control = (
              <div className="space-y-2">
                {f.type === 'image' && v && <Img src={v} alt="" thumb className="h-24 w-40 rounded-lg" />}
                <div className="flex flex-wrap gap-3 items-center">
                  <UploadControl
                    endpoint={f.type === 'image' ? '/api/uploads/image' : '/api/uploads/pdf'}
                    accept={f.type === 'image' ? 'image/png,image/jpeg,image/webp,image/gif' : 'application/pdf'}
                    label={f.type === 'image' ? 'Upload image' : 'Upload PDF'}
                    onDone={(url) => set(f.name, url)} {...up}
                  />
                  {v && <button type="button" className="text-sm link" onClick={() => set(f.name, '')}>Remove</button>}
                </div>
                <input id={id} value={v} onChange={(e) => set(f.name, e.target.value)} className="field text-sm" placeholder="…or paste a link (https://… or /uploads/…)" />
              </div>
            )
            break
          case 'images':
            control = (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-3">
                  {v.map((url, i) => (
                    <div key={url} className="relative">
                      <Img src={url} alt="" thumb className="h-20 w-32 rounded-lg" />
                      <button type="button" aria-label="Remove screenshot" onClick={() => set(f.name, v.filter((_, j) => j !== i))}
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-600 text-white text-xs">✕</button>
                    </div>
                  ))}
                </div>
                <UploadControl endpoint="/api/uploads/image" accept="image/png,image/jpeg,image/webp,image/gif" label="Upload & add images"
                  onDone={(url) => setValues((s) => ({ ...s, [f.name]: [...s[f.name], url] }))} {...up} />
              </div>
            )
            break
          default:
            control = <input id={id} value={v} onChange={(e) => set(f.name, e.target.value)} className="field" />
        }
        return (
          <div key={f.name}>
            <label htmlFor={id} className="block text-sm font-medium mb-1">{f.label}{f.required ? ' *' : ''}</label>
            {control}
            {f.help && <p className="text-xs text-slate-500 mt-1">{f.help}</p>}
          </div>
        )
      })}
    </div>
  )
}
