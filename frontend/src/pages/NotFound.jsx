import { Link } from 'react-router-dom'
import usePageMeta from '../hooks/usePageMeta'

export default function NotFound() {
  usePageMeta('Page not found', '', { noindex: true })
  return (
    <div className="section text-center">
      <p className="font-mono text-accent-dark dark:text-accent mb-2">404</p>
      <h1 className="text-3xl font-bold mb-4">Page not found</h1>
      <Link to="/" className="btn-primary">Back to home</Link>
    </div>
  )
}
