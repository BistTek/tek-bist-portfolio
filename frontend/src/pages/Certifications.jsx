import { useState, useMemo } from 'react'
import useContent from '../hooks/useContent'
import usePageMeta from '../hooks/usePageMeta'
import certsJson from '../data/certifications.json'
import Img from '../components/Img'
import { safeLink } from '../services/api'

export default function Certifications() {
  usePageMeta('Certifications', 'Professional certifications and credentials.')
  const { data: certs, loading } = useContent('certifications', certsJson)
  const [category, setCategory] = useState('All')
  const categories = useMemo(() => ['All', ...new Set(certs.map((c) => c.category))], [certs])
  const filtered = category === 'All' ? certs : certs.filter((c) => c.category === category)

  return (
    <div className="section">
      <h1 className="text-3xl font-bold mb-2">Certifications</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-8">Credentials with verification links where available.</p>
      <div className="flex flex-wrap gap-2 mb-8" role="group" aria-label="Filter certifications">
        {categories.map((c) => (
          <button key={c} onClick={() => setCategory(c)} aria-pressed={category === c} className={`pill ${category === c ? 'pill-active' : ''}`}>{c}</button>
        ))}
      </div>
      {loading ? <p className="text-slate-500">Loading…</p> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((c) => {
            const verify = safeLink(c.verifyUrl)
            return (
              <article key={c.id} className="card p-5 animate-slideUp">
                <Img src={c.image} alt={`${c.name} certificate`} thumb className="h-32 w-full rounded-lg mb-4" />
                <h2 className="font-semibold">{c.name}</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">{c.issuer} · {c.date}</p>
                {c.credentialId && <p className="text-xs text-slate-500 mt-2">Credential ID: {c.credentialId}</p>}
                {verify && <a href={verify} className="link text-sm mt-2 inline-block" target="_blank" rel="noopener noreferrer">Verify →</a>}
              </article>
            )
          })}
          {filtered.length === 0 && <p className="text-slate-500">No certifications yet.</p>}
        </div>
      )}
    </div>
  )
}
