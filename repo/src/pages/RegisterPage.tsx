import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
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

export function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const pwScore = scorePassword(password)
  const pwStrength = password.length > 0 ? STRENGTH_LABELS[pwScore] : ''
  const pwColor = password.length > 0 ? STRENGTH_COLORS[pwScore] : 'transparent'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('As senhas não coincidem.'); return }
    if (pwScore < 2) { setError('Senha muito fraca. Use ao menos 8 caracteres, com maiúsculas, minúsculas e números.'); return }
    setLoading(true)
    const { error } = await signUp(email, password, fullName)
    setLoading(false)
    if (error) { setError(error); return }
    navigate(`/verificar-email?email=${encodeURIComponent(email)}`)
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Criar conta</h1>
        <p className="auth-sub">Junte-se ao Universo Detail para comentar e avaliar produtos.</p>
        {error && <div className="auth-error">{error}</div>}
        <div className="auth-form">
          <div className="auth-field">
            <label>Nome completo</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Seu nome completo" required />
          </div>
          <div className="auth-field">
            <label>E-mail</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" required />
          </div>
          <div className="auth-field">
            <label>Senha</label>
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
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repita a senha" required />
          </div>
          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? 'Criando...' : 'Criar conta'}
          </button>
        </div>
        <p className="auth-link">Já tem conta? <Link to="/login">Entrar</Link></p>
      </form>
    </div>
  )
}
