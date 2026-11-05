import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import useContent from '../hooks/useContent'
import usePageMeta from '../hooks/usePageMeta'
import notesJson from '../data/notes.json'
import Img from '../components/Img'

export default function NoteDetail() {
  const { id } = useParams()
  const { data: notes, loading } = useContent('notes', notesJson)
  const note = notes.find((n) => String(n.id) === id)
  usePageMeta(note ? note.title : 'Note', note ? (note.content || '').replace(/[#`*_>\n]/g, ' ').slice(0, 150).trim() : '')

  if (loading) return <div className="section text-slate-500">Loading…</div>
  if (!note) {
    return (
      <div className="section">
        <p className="mb-4">Note not found.</p>
        <Link to="/notes" className="link">← Back to notes</Link>
      </div>
    )
  }

  const related = notes
    .filter((n) => n.id !== note.id && (n.category === note.category || (n.tags || []).some((t) => (note.tags || []).includes(t))))
    .slice(0, 3)

  return (
    <article className="section max-w-3xl">
      <Link to="/notes" className="link text-sm">← Back to notes</Link>
      <p className="text-xs font-mono text-accent-dark dark:text-accent mt-4">{note.category}</p>
      <h1 className="text-3xl font-bold my-3">{note.title}</h1>
      <p className="flex flex-wrap gap-4 text-sm text-slate-500 mb-6">
        <span>{note.author}</span><span>{note.date}</span><span>{note.readingTime}</span>
      </p>
      {note.featuredImage && <Img src={note.featuredImage} alt="" className="w-full h-64 rounded-xl mb-8" />}

      <div className="prose prose-slate dark:prose-invert max-w-none prose-pre:bg-slate-900 prose-pre:text-slate-100">
        <ReactMarkdown>{note.content}</ReactMarkdown>
      </div>

      <div className="flex flex-wrap gap-2 mt-8">
        {(note.tags || []).map((t) => <span key={t} className="chip">#{t}</span>)}
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="font-semibold text-lg mb-4">Related notes</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {related.map((n) => <Link key={n.id} to={`/notes/${n.id}`} className="card p-4 text-sm font-medium">{n.title}</Link>)}
          </div>
        </section>
      )}
    </article>
  )
}
