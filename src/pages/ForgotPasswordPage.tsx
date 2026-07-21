import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) { setError(error.message); setLoading(false); return }
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-center font-display text-4xl font-bold text-secondary-900">Esqueceu a senha?</h1>
      <p className="mt-2 text-center text-neutral-500">Enviaremos um link para redefinição</p>

      {sent ? (
        <div className="mt-8 rounded-2xl border border-success-200 bg-success-50 p-6 text-center">
          <p className="text-success-800">Verifique seu email para o link de redefinição.</p>
          <Link to="/login" className="mt-4 inline-block text-sm text-primary-600">Voltar para login</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border border-neutral-200 bg-white p-6">
          <div><label className="text-sm font-medium text-secondary-900">Email</label><input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-neutral-300 p-2.5 text-sm outline-none focus:border-primary-400" /></div>
          {error && <p className="text-sm text-error-600">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-full bg-primary-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-50">{loading ? 'Enviando...' : 'Enviar link'}</button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-neutral-500">Lembrou a senha? <Link to="/login" className="text-primary-600 hover:text-primary-700">Entrar</Link></p>
    </div>
  )
}
