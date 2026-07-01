import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/ui/Spinner'
import logo from '../assets/logo.svg'

const DEFAULT_HOST = '186.48.20.18'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [imapHost, setImapHost] = useState(DEFAULT_HOST)
  const [smtpHost, setSmtpHost] = useState(DEFAULT_HOST)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password, imapHost || undefined, smtpHost || undefined)
      navigate('/inbox')
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Erro ao conectar.'
      setError(msg)
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
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@codermaster.com.br" required className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="input-field" />
          </div>
          <details className="text-xs text-gray-400">
            <summary className="cursor-pointer select-none text-sm text-gray-500">▶ Configuração do servidor</summary>
            <div className="mt-3 flex flex-col gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Servidor IMAP</label>
                <input value={imapHost} onChange={e => setImapHost(e.target.value)} placeholder={DEFAULT_HOST} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Servidor SMTP</label>
                <input value={smtpHost} onChange={e => setSmtpHost(e.target.value)} placeholder={DEFAULT_HOST} className="input-field" />
              </div>
            </div>
          </details>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600 whitespace-pre-wrap">{error}</p>
            </div>
          )}
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2 flex items-center justify-center gap-2">
            {loading ? (
              <>
                <Spinner size="sm" />
                <span>Conectando ao servidor...</span>
              </>
            ) : 'Entrar'}
          </button>
        </form>
        <p className="text-xs text-gray-400 text-center mt-6">
          Servidor padrão: {DEFAULT_HOST}
        </p>
      </div>
    </div>
  )
}
