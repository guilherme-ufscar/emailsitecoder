import { createContext, useContext, useState, useEffect } from 'react'
import api from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('hf_token')
    if (!token) { setLoading(false); return }
    api.get('/auth/verify')
      .then(r => setUser(r.data.user))
      .catch(() => { localStorage.removeItem('hf_token'); sessionStorage.removeItem('hf_pass') })
      .finally(() => setLoading(false))
  }, [])

  async function login(email, password, imapHost, smtpHost) {
    const r = await api.post('/auth/login', { email, password, imapHost, smtpHost })
    localStorage.setItem('hf_token', r.data.token)
    sessionStorage.setItem('hf_pass', password)
    setUser(r.data.user)
    return r.data
  }

  async function logout() {
    await api.post('/auth/logout').catch(() => {})
    localStorage.removeItem('hf_token')
    sessionStorage.removeItem('hf_pass')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
