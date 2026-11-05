import { useState } from 'react'
import { useProfile } from '../hooks/useContent'
import usePageMeta from '../hooks/usePageMeta'
import { api, API_ENABLED, safeLink } from '../services/api'
import SocialLinks from '../components/SocialLinks'

const empty = { name: '', email: '', subject: '', message: '', website: '' }

export default function Contact() {
  const profile = useProfile()
  usePageMeta('Contact', `Get in touch with ${profile.name}.`)
  const [form, setForm] = useState(empty)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const mail = profile.email && profile.email.includes('@') ? profile.email : ''

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    setError('')
    try {
      await api.post('/api/contact', form)
      setStatus('success')
      setForm(empty)
    } catch (err) {
      setError(err.message || 'Something went wrong.')
      setStatus('error')
    }
  }

  return (
    <div className="section max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Contact</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-6">Have a project, job or collaboration in mind? Send me a message.</p>
      <SocialLinks profile={profile} className="mb-8" />
      {profile.phone && <p className="text-sm mb-6">Phone: {profile.phone}</p>}

      {!API_ENABLED ? (
        <p className="card p-5 text-sm text-slate-600 dark:text-slate-400">
          The contact form needs the backend. Until it is connected, please email{' '}
          {mail ? <a className="link" href={safeLink(`mailto:${mail}`)}>{mail}</a> : 'me directly'}.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4" noValidate={false}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
            <input id="name" name="name" value={form.name} onChange={onChange} required maxLength={100} className="field" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={onChange} required className="field" />
          </div>
          <div>
            <label htmlFor="subject" className="block text-sm font-medium mb-1">Subject</label>
            <input id="subject" name="subject" value={form.subject} onChange={onChange} required maxLength={200} className="field" />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-1">Message</label>
            <textarea id="message" name="message" value={form.message} onChange={onChange} required minLength={10} maxLength={5000} rows={6} className="field" />
          </div>
          {/* Honeypot: hidden from people, bots tend to fill it */}
          <div className="absolute -left-[9999px]" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input id="website" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={onChange} />
          </div>
          <button type="submit" disabled={status === 'sending'} className="btn-primary">
            {status === 'sending' ? 'Sending…' : 'Send message'}
          </button>
          <div aria-live="polite">
            {status === 'success' && <p className="text-emerald-700 dark:text-emerald-400 text-sm">Thanks! Your message was sent.</p>}
            {status === 'error' && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}
          </div>
        </form>
      )}
    </div>
  )
}
