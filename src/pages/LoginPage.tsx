import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import './login.css'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) setError(error)
    else navigate('/admin')
  }

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>Entrar</h1>
        <p className="login-sub">Acesse sua conta para gerenciar o catálogo</p>
        {error && <div className="login-error">{error}</div>}
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Senha</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'center', marginTop: 4 }}>
          <Link to="/esqueci-senha" style={{ fontSize: 13, color: 'var(--color-text-2)' }}>Esqueceu a senha?</Link>
          <Link to="/cadastro" style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 600 }}>Criar conta</Link>
        </div>
      </form>
    </div>
  )
}
