import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password !== confirm) { setError('As senhas não coincidem.'); return }
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    navigate('/conta')
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-center font-display text-4xl font-bold text-secondary-900">Criar conta</h1>
      <p className="mt-2 text-center text-neutral-500">Junte-se ao PapoDetailer</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border border-neutral-200 bg-white p-6">
        <div><label className="text-sm font-medium text-secondary-900">Email</label><input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-neutral-300 p-2.5 text-sm outline-none focus:border-primary-400" /></div>
        <div><label className="text-sm font-medium text-secondary-900">Senha</label><input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-neutral-300 p-2.5 text-sm outline-none focus:border-primary-400" /></div>
        <div><label className="text-sm font-medium text-secondary-900">Confirmar senha</label><input required type="password" value={confirm} onChange={e => setConfirm(e.target.value)} className="mt-1 w-full rounded-lg border border-neutral-300 p-2.5 text-sm outline-none focus:border-primary-400" /></div>
        {error && <p className="text-sm text-error-600">{error}</p>}
        <button type="submit" disabled={loading} className="w-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50">{loading ? 'Criando...' : 'Criar conta'}</button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">Já tem conta? <Link to="/login" className="text-primary-600 hover:text-primary-700">Entrar</Link></p>
    </div>
  )
}
