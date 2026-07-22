import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) { setError(error.message); return }
    navigate('/perfil')
  }

  return (
    <div className="container page auth-page">
      <div className="auth-card">
        <h1>Entrar</h1>
        <p className="auth-subtitle">Acesse sua conta para avaliar produtos e salvar favoritos</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <label className="form-label">E-mail<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="form-input" /></label>
          <label className="form-label">Senha<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="form-input" /></label>
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
        </form>
        <p className="auth-footer">Não tem conta? <Link to="/cadastro">Criar conta</Link></p>
      </div>
    </div>
  )
}
