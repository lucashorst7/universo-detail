import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase, isConfigured } from './supabase'
import type { UserProfile } from '../types/database'

interface AuthContextValue {
  session: Session | null
  isAdmin: boolean
  loading: boolean
  profile: UserProfile | null
  emailVerified: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  isAdmin: false,
  loading: true,
  profile: null,
  emailVerified: false,
  signIn: async () => ({ error: 'not configured' }),
  signUp: async () => ({ error: 'not configured' }),
  signOut: async () => {},
  refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const emailVerified = Boolean(session?.user?.email_confirmed_at)

  useEffect(() => {
    if (!isConfigured) { setLoading(false); return }
    let mounted = true

    supabase.auth.getSession()
      .then(({ data }: { data: { session: Session | null } }) => {
        if (!mounted) return
        setSession(data.session)
        if (data.session) {
          Promise.all([checkAdmin(data.session.user.id), loadProfile(data.session.user.id)])
            .finally(() => { if (mounted) setLoading(false) })
        } else {
          setLoading(false)
        }
      })
      .catch(() => { if (mounted) setLoading(false) })

    const { data: sub } = supabase.auth.onAuthStateChange((_e: string, s: Session | null) => {
      setSession(s)
      if (s) {
        (async () => {
          await Promise.all([checkAdmin(s.user.id), loadProfile(s.user.id)])
        })()
      } else {
        setIsAdmin(false)
        setProfile(null)
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

  async function loadProfile(userId: string) {
    try {
      const { data } = await supabase.from('user_profiles').select('*').eq('user_id', userId).maybeSingle()
      setProfile(data as UserProfile | null)
    } catch {
      setProfile(null)
    }
  }

  async function refreshProfile() {
    if (session) await loadProfile(session.user.id)
  }

  async function signIn(email: string, password: string) {
    if (!isConfigured) return { error: 'Supabase não configurado' }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  async function signUp(email: string, password: string, displayName: string) {
    if (!isConfigured) return { error: 'Supabase não configurado' }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    })
    return { error: error?.message ?? null }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setSession(null)
    setIsAdmin(false)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ session, isAdmin, loading, profile, emailVerified, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() { return useContext(AuthContext) }
