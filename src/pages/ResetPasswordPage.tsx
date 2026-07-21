import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState(''); const [sent, setSent] = useState(false); const [loading, setLoading] = useState(false)
  const submit = async (e: React.FormEvent) => { e.preventDefault(); setLoading(true); await supabase.auth.resetPasswordForEmail(email); setSent(true); setLoading(false) }
  return (
    <div className="bg-secondary-950 min-h-screen flex items-center justify-center py-16">
      <div className="w-full max-w-md px-4">
        <form onSubmit={submit} className="bg-secondary-900 border border-secondary-800 rounded-2xl p-6 space-y-4">
          <h1 className="font-heading text-2xl text-white text-center">Resetar Senha</h1>
          {sent ? <p className="text-sm text-success-500 bg-success-500/10 rounded-lg p-3">Se o e-mail existir, você receberá um link de redefinição.</p> : (
            <>
              <div><label className="block text-xs uppercase tracking-widest text-neutral-400 mb-1">E-mail</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-secondary-950 border border-secondary-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-400" /></div>
              <button type="submit" disabled={loading} className="w-full bg-primary-500 text-secondary-950 font-medium py-2.5 rounded-lg text-sm hover:bg-primary-400 disabled:opacity-50">{loading ? 'Enviando...' : 'Enviar link'}</button>
            </>
          )}
        </form>
      </div>
    </div>
  )
}
