import { useEffect, useState } from 'react'
import { api, API_ENABLED } from '../services/api'
import profileFallback from '../data/profile.json'

const cache = new Map()

function fetchOnce(resource) {
  if (!cache.has(resource)) {
    const promise = api.get(`/api/${resource}`).catch((err) => {
      cache.delete(resource)
      throw err
    })
    cache.set(resource, promise)
  }
  return cache.get(resource)
}

/**
 * Static mode (no VITE_API_URL): returns the bundled JSON.
 * API mode: returns data from the backend; falls back to the JSON if the API is unreachable.
 */
export default function useContent(resource, fallback) {
  const empty = Array.isArray(fallback) ? [] : {}
  const [data, setData] = useState(API_ENABLED ? empty : fallback)
  const [loading, setLoading] = useState(API_ENABLED)

  useEffect(() => {
    if (!API_ENABLED) return undefined
    let alive = true
    fetchOnce(resource)
      .then((d) => alive && setData(d))
      .catch(() => alive && setData(fallback))
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [resource, fallback])

  return { data, loading }
}

export function useProfile() {
  const { data } = useContent('profile', profileFallback)
  return data && Object.keys(data).length ? data : (API_ENABLED ? {} : profileFallback)
}
