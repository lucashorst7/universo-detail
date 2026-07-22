import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true)
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { display_name: displayName } } })
    setLoading(false)
    if (error) { setError(error.message); return }
    if (data.user) {
      await supabase.from('user_profiles').upsert({ user_id: data.user.id, display_name: displayName })
    }
    navigate('/perfil')
  }

  return (
    <div className="container page auth-page">
      <div className="auth-card">
        <h1>Criar conta</h1>
        <p className="auth-subtitle">Junte-se à comunidade de detalhamento automotivo</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <label className="form-label">Nome<input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required className="form-input" /></label>
          <label className="form-label">E-mail<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="form-input" /></label>
          <label className="form-label">Senha<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="form-input" /></label>
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Criando...' : 'Criar conta'}</button>
        </form>
        <p className="auth-footer">Já tem conta? <Link to="/login">Entrar</Link></p>
      </div>
    </div>
  )
}
