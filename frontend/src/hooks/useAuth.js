import { useState } from 'react'
import { api } from '../services/api'

const KEY = 'admin_token'

// sessionStorage: the token is cleared when the tab closes.
export default function useAuth() {
  const [token, setToken] = useState(() => sessionStorage.getItem(KEY))

  const login = async (username, password) => {
    const res = await api.post('/api/auth/login', { username, password })
    sessionStorage.setItem(KEY, res.access_token)
    setToken(res.access_token)
  }
  const logout = () => {
    sessionStorage.removeItem(KEY)
    setToken(null)
  }
  return { token, login, logout }
}
