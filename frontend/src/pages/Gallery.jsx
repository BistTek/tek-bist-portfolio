import { useState, useMemo, useEffect } from 'react'
import useContent from '../hooks/useContent'
import usePageMeta from '../hooks/usePageMeta'
import photosJson from '../data/photos.json'
import Img from '../components/Img'

export default function Gallery() {
  usePageMeta('Gallery', 'Photos from university, hackathons, conferences and projects.')
  const { data: photos, loading } = useContent('photos', photosJson)
  const [category, setCategory] = useState('All')
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState(null)

  const categories = useMemo(() => ['All', ...new Set(photos.map((p) => p.category))], [photos])
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return photos
      .filter((p) => category === 'All' || p.category === category)
      .filter((p) => !q || p.title.toLowerCase().includes(q) || (p.tags || []).some((t) => t.includes(q)))
  }, [photos, category, query])

  useEffect(() => {
    if (index === null) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setIndex(null)
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % filtered.length)
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + filtered.length) % filtered.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, filtered.length])

  const active = index !== null ? filtered[index] : null

  return (
    <div className="section">
      <h1 className="text-3xl font-bold mb-2">Gallery</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-8">University, hackathons, conferences, project demos and more.</p>

      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search photos or tags…" aria-label="Search photos" className="field lg:max-w-xs" />
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {categories.map((c) => (
            <button key={c} onClick={() => setCategory(c)} aria-pressed={category === c} className={`pill ${category === c ? 'pill-active' : ''}`}>{c}</button>
          ))}
        </div>
      </div>

      {loading ? <p className="text-slate-500">Loading…</p> : (
        <div className="columns-2 md:columns-3 gap-4">
          {filtered.map((p, i) => (
            <button
              key={p.id} onClick={() => setIndex(i)}
              className="mb-4 w-full break-inside-avoid block rounded-xl overflow-hidden card text-left"
              aria-label={`Open ${p.title}`}
            >
              <Img src={p.src} alt={p.title} thumb className={`w-full ${p.src ? 'h-auto' : 'h-40'}`} />
              <span className="block p-3">
                <span className="block text-sm font-medium">{p.title}</span>
                <span className="block text-xs text-slate-500">{p.date}</span>
              </span>
            </button>
          ))}
          {filtered.length === 0 && <p className="text-slate-500">No photos match your filters.</p>}
        </div>
      )}

      {active && (
        <div
          role="dialog" aria-modal="true" aria-label={active.title}
          className="fixed inset-0 z-[100] bg-black/85 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIndex(null)}
        >
          <div className="max-w-3xl w-full max-h-full overflow-auto bg-white dark:bg-slate-900 rounded-xl" onClick={(e) => e.stopPropagation()}>
            <Img src={active.src} alt={active.title} className="w-full max-h-[60vh] h-auto" />
            <div className="p-5">
              <h2 className="font-semibold text-lg">{active.title}</h2>
              <p className="text-sm text-slate-500 mb-2">{active.category} · {active.date}</p>
              {active.description && <p className="text-sm text-slate-600 dark:text-slate-400">{active.description}</p>}
              <div className="flex flex-wrap gap-3 mt-4">
                <button className="btn-outline" onClick={() => setIndex((i) => (i - 1 + filtered.length) % filtered.length)}>← Prev</button>
                <button className="btn-outline" onClick={() => setIndex((i) => (i + 1) % filtered.length)}>Next →</button>
                <button className="btn-primary ml-auto" onClick={() => setIndex(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
