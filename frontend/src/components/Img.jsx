import { mediaUrl, thumbUrl } from '../services/api'

export default function Img({ src, alt, thumb = false, className = '' }) {
  const url = thumb ? thumbUrl(src) : mediaUrl(src)
  if (!url) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`bg-slate-100 dark:bg-slate-800 grid place-items-center text-xs text-slate-500 ${className}`}
      >
        No image
      </div>
    )
  }
  return <img src={url} alt={alt} loading="lazy" decoding="async" className={`object-cover ${className}`} />
}
