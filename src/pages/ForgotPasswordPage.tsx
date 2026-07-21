import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './auth.css'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    setLoading(false)
    if (error) { setError(error.message); return }
    setSent(true)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Esqueceu a senha?</h1>
        <p className="auth-sub">Enviaremos um link para redefinir sua senha no e-mail cadastrado.</p>
        {sent ? (
          <div className="auth-success">
            Verifique seu e-mail para o link de redefinição.<br />
            <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Voltar para login</Link>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="auth-error">{error}</div>}
            <div className="auth-field">
              <label>E-mail</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" required />
            </div>
            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar link'}
            </button>
          </form>
        )}
        <p className="auth-link">Lembrou a senha? <Link to="/login">Entrar</Link></p>
      </div>
    </div>
  )
}
