import { createContext, useContext } from 'react';
import type { User } from '@supabase/supabase-js';

export interface AdminAuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  validating: boolean;
  authError: string | null;
  lastValidatedAt: string | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  validateSession: () => Promise<boolean>;
}

export const AdminAuthContext = createContext<AdminAuthContextType>({
  user: null,
  isAdmin: false,
  loading: true,
  validating: false,
  authError: null,
  lastValidatedAt: null,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
  validateSession: async () => false,
});

export const useAdminAuth = () => useContext(AdminAuthContext);
