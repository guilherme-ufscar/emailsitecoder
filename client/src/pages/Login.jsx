import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/ui/Spinner'
import logo from '../assets/logo.svg'

function deriveHost(email) {
  if (!email.includes('@')) return null
  const domain = email.trim().toLowerCase().split('@').pop()
  const common = {
    'gmail.com': 'imap.gmail.com',
    'googlemail.com': 'imap.gmail.com',
    'outlook.com': 'outlook.office365.com',
    'outlook.com.br': 'outlook.office365.com',
    'hotmail.com': 'outlook.office365.com',
    'hotmail.com.br': 'outlook.office365.com',
    'live.com': 'outlook.office365.com',
    'live.com.br': 'outlook.office365.com',
    'msn.com': 'outlook.office365.com',
    'yahoo.com': 'imap.mail.yahoo.com',
    'yahoo.com.br': 'imap.mail.yahoo.com',
    'icloud.com': 'imap.mail.me.com',
    'me.com': 'imap.mail.me.com',
    'bol.com.br': 'imap.bol.com.br',
    'uol.com.br': 'imap.uol.com.br',
    'terra.com.br': 'imap.terra.com.br',
    'ig.com.br': 'imap.ig.com.br',
    'protonmail.com': '127.0.0.1',
    'proton.me': '127.0.0.1',
    'zoho.com': 'imap.zoho.com',
    'aol.com': 'imap.aol.com',
    'mail.com': 'imap.mail.com',
    'gmx.com': 'imap.gmx.com',
    'gmx.net': 'imap.gmx.net',
  }
  return common[domain] || `imap.${domain}`
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [host, setHost] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const autoHost = useMemo(() => deriveHost(email), [email])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password, host || undefined)
      navigate('/inbox')
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao conectar. Verifique suas credenciais.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-brand-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="flex justify-center mb-8">
          <img src={logo} alt="Logo" className="h-12" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900 text-center mb-6">Acesse seu email</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@seudominio.com" required className="input-field" />
          </div>
          {autoHost && (
            <div className="flex items-center gap-2 text-xs text-gray-400 -mt-2">
              <span>Servidor detectado:</span>
              <span className="text-brand-700 font-medium">{autoHost}</span>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="input-field" />
          </div>
          <details className="text-xs text-gray-400">
            <summary className="cursor-pointer">Configuração avançada</summary>
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Servidor IMAP/SMTP</label>
              <input value={host} onChange={e => setHost(e.target.value)} placeholder={autoHost || 'mail.seudominio.com'} className="input-field" />
            </div>
          </details>
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2 flex items-center justify-center gap-2">
            {loading ? (
              <>
                <Spinner size="sm" />
                <span>Conectando ao servidor de email...</span>
              </>
            ) : 'Entrar'}
          </button>
        </form>
        <p className="text-xs text-gray-400 text-center mt-6">
          O servidor é detectado automaticamente pelo seu email.
        </p>
      </div>
    </div>
  )
}
