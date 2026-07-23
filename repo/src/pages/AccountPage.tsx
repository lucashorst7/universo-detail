import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AccountPage() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function check() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { navigate('/login'); return }
      setUser({ id: session.user.id, email: session.user.email })
      const { data } = await supabase.rpc('is_admin')
      setIsAdmin(Boolean(data))
      setLoading(false)
    }
    check()
  }, [navigate])

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-3 border-neutral-200 border-t-primary-500" /></div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-bold text-secondary-900">Minha conta</h1>
      <p className="mt-2 text-neutral-500">{user?.email}</p>

      <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6">
        <h2 className="font-heading text-xl font-semibold text-secondary-900">Detalhes</h2>
        <p className="mt-2 text-sm text-neutral-600">ID: {user?.id}</p>
        {isAdmin && (
          <Link to="/admin" className="mt-6 inline-flex rounded-full bg-secondary-950 px-5 py-2.5 text-sm font-semibold text-primary-400 transition-colors hover:bg-secondary-900">Painel administrativo</Link>
        )}
      </div>

      <button onClick={handleLogout} className="mt-6 rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:border-error-300 hover:text-error-600">Sair</button>
    </div>
  )
}
