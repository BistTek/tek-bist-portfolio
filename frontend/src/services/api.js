const RAW = import.meta.env.VITE_API_URL || ''
export const API_BASE = RAW.replace(/\/$/, '')
export const API_ENABLED = Boolean(API_BASE)

/** Resolve an image/file path: backend uploads get the API origin prefixed, public assets stay as is. */
export function mediaUrl(path) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  if (path.startsWith('/uploads/')) return `${API_BASE}${path}`
  if (path.startsWith('/') && !path.startsWith('//')) return path
  return ''
}

/** Small (480px) version created automatically for uploaded images. */
export function thumbUrl(path) {
  if (path && path.startsWith('/uploads/') && path.endsWith('.webp')) {
    return mediaUrl(path.replace(/\.webp$/, '_sm.webp'))
  }
  return mediaUrl(path)
}

/** Only allow real web/mailto links to be rendered as anchors. */
export function safeLink(url) {
  return /^(https?:\/\/|mailto:)/i.test(url || '') ? url : ''
}

export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

async function request(path, { method = 'GET', body, token, form } = {}) {
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`
  let payload
  if (form) {
    payload = form
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }
  let res
  try {
    res = await fetch(`${API_BASE}${path}`, { method, headers, body: payload })
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Is the backend running?')
  }
  if (res.status === 204) return null
  let data = null
  try { data = await res.json() } catch { /* empty body */ }
  if (!res.ok) {
    let msg = 'Request failed'
    if (typeof data?.detail === 'string') msg = data.detail
    else if (Array.isArray(data?.detail)) {
      msg = data.detail.map((d) => `${(d.loc || []).slice(1).join('.')}: ${d.msg}`).join('; ')
    }
    throw new ApiError(res.status, msg)
  }
  return data
}

export const api = {
  get: (path, token) => request(path, { token }),
  post: (path, body, token) => request(path, { method: 'POST', body, token }),
  put: (path, body, token) => request(path, { method: 'PUT', body, token }),
  del: (path, token) => request(path, { method: 'DELETE', token }),
  upload: (path, file, token) => {
    const form = new FormData()
    form.append('file', file)
    return request(path, { method: 'POST', form, token })
  },
}
