import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './auth.css'

function scorePassword(pw: string): number {
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return Math.min(score, 4)
}

const STRENGTH_LABELS = ['Muito fraca', 'Fraca', 'Média', 'Forte', 'Muito forte']
const STRENGTH_COLORS = ['#dc2626', '#dc2626', '#d97706', '#16a34a', '#16a34a']

export function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data }) => {
        if (data.session) setReady(true)
        else setReady(true)
      })
      .catch(() => setReady(true))
  }, [])

  const pwScore = scorePassword(password)
  const pwStrength = password.length > 0 ? STRENGTH_LABELS[pwScore] : ''
  const pwColor = password.length > 0 ? STRENGTH_COLORS[pwScore] : 'transparent'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('As senhas não coincidem.'); return }
    if (pwScore < 2) { setError('Senha muito fraca. Use ao menos 8 caracteres, com maiúsculas, minúsculas e números.'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) { setError(error.message); return }
    setSuccess('Senha redefinida com sucesso!')
    setTimeout(() => navigate('/login'), 1500)
  }

  if (!ready) return null

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Redefinir senha</h1>
        <p className="auth-sub">Defina uma nova senha para sua conta.</p>
        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}
        <div className="auth-form">
          <div className="auth-field">
            <label>Nova senha</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" required minLength={8} />
            {password && (
              <>
                <div className="auth-pw-strength">
                  <div className="auth-pw-strength-bar" style={{ width: `${(pwScore / 4) * 100}%`, background: pwColor }} />
                </div>
                <span style={{ fontSize: 11, color: pwColor }}>{pwStrength}</span>
              </>
            )}
          </div>
          <div className="auth-field">
            <label>Confirmar senha</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repita a nova senha" required />
          </div>
          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? 'Redefinindo...' : 'Redefinir senha'}
          </button>
        </div>
        <p className="auth-link"><Link to="/login">Voltar para login</Link></p>
      </form>
    </div>
  )
}
