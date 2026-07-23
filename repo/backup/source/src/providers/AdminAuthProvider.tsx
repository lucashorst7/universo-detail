import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { AdminAuthContext } from '../lib/adminAuth';

const SESSION_REVALIDATION_INTERVAL_MS = 5 * 60 * 1000;

type SessionValidationPayload = {
  is_admin?: boolean;
  validated_at?: string;
};

function getAuthErrorMessage(message?: string) {
  if (!message) return 'Não foi possível validar a sessão administrativa.';
  const normalized = message.toLowerCase();
  if (normalized.includes('jwt') || normalized.includes('token') || normalized.includes('session')) {
    return 'Sua sessão expirou. Entre novamente para continuar.';
  }
  return 'Não foi possível validar sua autorização administrativa.';
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [lastValidatedAt, setLastValidatedAt] = useState<string | null>(null);
  const userRef = useRef<User | null>(null);
  const validationPromiseRef = useRef<Promise<boolean> | null>(null);

  const clearAuthorization = useCallback(() => {
    userRef.current = null;
    setUser(null);
    setIsAdmin(false);
    setLastValidatedAt(null);
  }, []);

  const validateSession = useCallback(async () => {
    if (validationPromiseRef.current) return validationPromiseRef.current;

    const validationPromise = (async () => {
      setValidating(true);
      setAuthError(null);

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      const session = sessionData.session;

      if (sessionError || !session?.user) {
        clearAuthorization();
        if (sessionError) setAuthError(getAuthErrorMessage(sessionError.message));
        setValidating(false);
        return false;
      }

      userRef.current = session.user;
      setUser(session.user);

      const { data, error } = await supabase.rpc('validate_admin_session');
      if (error) {
        setIsAdmin(false);
        setAuthError(getAuthErrorMessage(error.message));
        setValidating(false);
        return false;
      }

      const payload = (data ?? {}) as SessionValidationPayload;
      const authorized = payload.is_admin === true;
      setIsAdmin(authorized);
      setLastValidatedAt(payload.validated_at ?? new Date().toISOString());
      if (!authorized) setAuthError('Seu acesso administrativo foi revogado.');
      setValidating(false);
      return authorized;
    })().finally(() => {
      validationPromiseRef.current = null;
    });

    validationPromiseRef.current = validationPromise;
    return validationPromise;
  }, [clearAuthorization]);

  const applySession = useCallback(async (session: Session | null) => {
    if (!session?.user) {
      clearAuthorization();
      setAuthError(null);
      setLoading(false);
      return;
    }

    userRef.current = session.user;
    setUser(session.user);
    await validateSession();
    setLoading(false);
  }, [clearAuthorization, validateSession]);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (active) void applySession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === 'SIGNED_OUT') {
        clearAuthorization();
        setAuthError(null);
        setLoading(false);
        return;
      }
      void applySession(session);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [applySession, clearAuthorization]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (userRef.current) void validateSession();
    }, SESSION_REVALIDATION_INTERVAL_MS);

    const revalidateWhenActive = () => {
      if (document.visibilityState === 'visible' && userRef.current) void validateSession();
    };

    window.addEventListener('focus', revalidateWhenActive);
    document.addEventListener('visibilitychange', revalidateWhenActive);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', revalidateWhenActive);
      document.removeEventListener('visibilitychange', revalidateWhenActive);
    };
  }, [validateSession]);

  const signIn = async (email: string, password: string) => {
    setAuthError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: 'E-mail ou senha inválidos.' };

    userRef.current = data.user;
    setUser(data.user);
    const authorized = await validateSession();
    if (!authorized) {
      await supabase.auth.signOut();
      clearAuthorization();
      return { error: 'Acesso administrativo não autorizado.' };
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    clearAuthorization();
    setAuthError(null);
  };

  return (
    <AdminAuthContext.Provider value={{
      user,
      isAdmin,
      loading,
      validating,
      authError,
      lastValidatedAt,
      signIn,
      signOut,
      validateSession,
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
}
