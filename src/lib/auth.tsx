import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase, isConfigured } from './supabase'

interface AuthContextValue {
  session: Session | null
  isAdmin: boolean
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  isAdmin: false,
  loading: true,
  signIn: async () => ({ error: 'not configured' }),
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isConfigured) { setLoading(false); return }
    let mounted = true

    supabase.auth.getSession()
      .then(({ data }: { data: { session: Session | null } }) => {
        if (!mounted) return
        setSession(data.session)
        if (data.session) {
          checkAdmin(data.session.user.id).finally(() => { if (mounted) setLoading(false) })
        } else {
          setLoading(false)
        }
      })
      .catch(() => { if (mounted) setLoading(false) })

    const { data: sub } = supabase.auth.onAuthStateChange((_e: string, s: Session | null) => {
      setSession(s)
      if (s) {
        (async () => { await checkAdmin(s.user.id) })()
      } else {
        setIsAdmin(false)
      }
    })

    return () => { mounted = false; sub.subscription.unsubscribe() }
  }, [])

  async function checkAdmin(userId: string) {
    try {
      const { data } = await supabase.from('admin_users').select('id').eq('user_id', userId).maybeSingle()
      setIsAdmin(Boolean(data))
    } catch {
      setIsAdmin(false)
    }
  }

  async function signIn(email: string, password: string) {
    if (!isConfigured) return { error: 'Supabase não configurado' }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setSession(null)
    setIsAdmin(false)
  }

  return (
    <AuthContext.Provider value={{ session, isAdmin, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() { return useContext(AuthContext) }
