import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/ui/Spinner'
import logo from '../assets/logo.svg'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [host, setHost] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password, host)
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Servidor de email</label>
            <input value={host} onChange={e => setHost(e.target.value)} placeholder="mail.seudominio.com" required className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@seudominio.com" required className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="input-field" />
          </div>
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
          Na primeira vez, o sistema detecta automaticamente as portas do servidor.
        </p>
      </div>
    </div>
  )
}
