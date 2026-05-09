import { useState, useEffect } from 'react'
import api from '../lib/api'
import Button from '../components/ui/Button'
import { showToast } from '../components/ui/Toast'
import { useAuth } from '../context/AuthContext'

export default function Settings() {
  const { user } = useAuth()
  const [profile, setProfile] = useState({ display_name: '', signature: '' })
  const [resendKey, setResendKey] = useState('')
  const [hasResend, setHasResend] = useState(false)
  const [password, setPassword] = useState('')
  const [mailConfig, setMailConfig] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/settings').then(r => {
      setProfile({ display_name: r.data.display_name || '', signature: r.data.signature || '' })
      setHasResend(r.data.has_resend_key)
      setMailConfig({ imap_host: r.data.imap_host, imap_port: r.data.imap_port, imap_secure: r.data.imap_secure, smtp_host: r.data.smtp_host, smtp_port: r.data.smtp_port, smtp_secure: r.data.smtp_secure })
    })
  }, [])

  async function saveProfile() {
    setSaving(true)
    try {
      await api.patch('/settings', { display_name: profile.display_name, signature: profile.signature })
      showToast('Perfil salvo')
    } catch { showToast('Erro ao salvar', 'error') }
    finally { setSaving(false) }
  }

  async function saveResend() {
    await api.patch('/settings', { resend_api_key: resendKey || null })
    setHasResend(!!resendKey); setResendKey('')
    showToast(resendKey ? 'Chave Resend salva' : 'Chave Resend removida')
  }

  async function savePassword() {
    if (!password) return
    await api.patch('/settings', { password })
    setPassword(''); showToast('Senha atualizada')
  }

  return (
    <div className="max-w-2xl mx-auto p-6 flex flex-col gap-6">
      <div className="card p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Perfil</h2>
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome de exibição</label>
            <input value={profile.display_name} onChange={e => setProfile(p => ({ ...p, display_name: e.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assinatura</label>
            <textarea value={profile.signature} onChange={e => setProfile(p => ({ ...p, signature: e.target.value }))} className="input-field h-24 resize-none" />
          </div>
          <Button onClick={saveProfile} disabled={saving} className="self-end">Salvar Perfil</Button>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Configuração do Servidor</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-gray-500">IMAP Host:</span> <span className="font-medium">{mailConfig.imap_host}</span></div>
          <div><span className="text-gray-500">IMAP Porta:</span> <span className="font-medium">{mailConfig.imap_port} {mailConfig.imap_secure ? '(SSL)' : '(plain)'}</span></div>
          <div><span className="text-gray-500">SMTP Host:</span> <span className="font-medium">{mailConfig.smtp_host}</span></div>
          <div><span className="text-gray-500">SMTP Porta:</span> <span className="font-medium">{mailConfig.smtp_port} {mailConfig.smtp_secure ? '(SSL)' : '(plain)'}</span></div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Resend API</h2>
        <p className="text-sm text-gray-500 mb-4">{hasResend ? 'Chave configurada. Emails serão enviados via Resend com fallback para SMTP.' : 'Sem chave. Emails enviados diretamente via SMTP.'}</p>
        <div className="flex gap-3">
          <input type="password" value={resendKey} onChange={e => setResendKey(e.target.value)} placeholder={hasResend ? 'Nova chave (deixe vazio para remover)' : 're_...'} className="input-field flex-1" />
          <Button onClick={saveResend} variant="secondary">Salvar</Button>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Alterar Senha</h2>
        <div className="flex gap-3">
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Nova senha" className="input-field flex-1" />
          <Button onClick={savePassword} variant="secondary">Alterar</Button>
        </div>
      </div>
    </div>
  )
}
