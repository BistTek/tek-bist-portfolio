import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import useContent from '../hooks/useContent'
import usePageMeta from '../hooks/usePageMeta'
import notesJson from '../data/notes.json'
import Img from '../components/Img'

export default function Notes() {
  usePageMeta('Technical Notes', 'Programming notes, tutorials and project documentation.')
  const { data: notes, loading } = useContent('notes', notesJson)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [tag, setTag] = useState('')

  const categories = useMemo(() => ['All', ...new Set(notes.map((n) => n.category))], [notes])
  const tags = useMemo(() => [...new Set(notes.flatMap((n) => n.tags || []))].sort(), [notes])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return notes
      .filter((n) => category === 'All' || n.category === category)
      .filter((n) => !tag || (n.tags || []).includes(tag))
      .filter((n) => !q || n.title.toLowerCase().includes(q) || (n.tags || []).some((t) => t.includes(q)) || (n.content || '').toLowerCase().includes(q))
      .sort((a, b) => String(b.date).localeCompare(String(a.date)))
  }, [notes, query, category, tag])

  return (
    <div className="section">
      <h1 className="text-3xl font-bold mb-2">Technical Notes</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-8">Programming notes, tutorials and documentation, newest first.</p>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <input
          value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search notes…"
          aria-label="Search notes" className="field flex-1"
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category" className="field sm:w-48">
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8" aria-label="Filter by tag">
          {tags.map((t) => (
            <button key={t} onClick={() => setTag(tag === t ? '' : t)} aria-pressed={tag === t} className={`pill !py-0.5 !text-xs ${tag === t ? 'pill-active' : ''}`}>
              #{t}
            </button>
          ))}
        </div>
      )}

      {loading ? <p className="text-slate-500">Loading…</p> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((n) => (
            <Link key={n.id} to={`/notes/${n.id}`} className="card overflow-hidden block animate-slideUp">
              {n.featuredImage && <Img src={n.featuredImage} alt="" thumb className="h-36 w-full" />}
              <div className="p-5">
                <span className="text-xs font-mono text-accent-dark dark:text-accent">{n.category}</span>
                <h2 className="font-semibold text-lg my-2">{n.title}</h2>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{n.date}</span><span>{n.readingTime}</span>
                </div>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && <p className="text-slate-500">No notes match your filters.</p>}
        </div>
      )}
    </div>
  )
}
