import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
// lovable import eliminado — usamos Supabase OAuth directamente para Cloudflare Pages

export type Role = 'admin' | 'student'
export type Profile = { id: string; display_name: string | null; avatar_url: string | null; language: string; xp: number; streak: number }

type AuthValue = {
  user: User | null
  session: Session | null
  profile: Profile | null
  roles: Role[]
  loading: boolean
  isAdmin: boolean
  signUp: (email: string, password: string, name: string) => Promise<string | null>
  signIn: (email: string, password: string) => Promise<string | null>
  signInWithGoogle: () => Promise<string | null>
  signOut: () => Promise<void>
  setRole: (role: Role, enabled: boolean) => Promise<void>
  refresh: () => Promise<void>
}

const Ctx = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (uid: string | undefined) => {
    if (!uid) { setProfile(null); setRoles([]); return }
    const [p, r] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', uid).maybeSingle(),
      supabase.from('user_roles').select('role').eq('user_id', uid),
    ])
    setProfile((p.data as Profile) ?? null)
    setRoles(((r.data ?? []) as { role: Role }[]).map((x) => x.role))
  }, [])

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s)
      void load(s?.user?.id)
    })
    void supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session)
      await load(data.session?.user?.id)
      setLoading(false)
    })
    return () => sub.subscription.unsubscribe()
  }, [load])

  const value = useMemo<AuthValue>(() => ({
    user: session?.user ?? null,
    session,
    profile,
    roles,
    loading,
    isAdmin: roles.includes('admin'),
    signUp: async (email, password, name) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin, data: { full_name: name } },
      })
      return error?.message ?? null
    },
    signIn: async (email, password) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return error?.message ?? null
    },
    // Usa Supabase OAuth directamente — no necesita /~oauth/initiate de Lovable
    signInWithGoogle: async () => {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
          },
        })
        return error?.message ?? null
      } catch (e) {
        return e instanceof Error ? e.message : 'No se pudo iniciar sesión con Google'
      }
    },
    signOut: async () => { await supabase.auth.signOut() },
    setRole: async (role, enabled) => {
      const uid = session?.user?.id
      if (!uid) return
      if (enabled) await supabase.from('user_roles').insert({ user_id: uid, role })
      else await supabase.from('user_roles').delete().eq('user_id', uid).eq('role', role)
      await load(uid)
    },
    refresh: async () => load(session?.user?.id),
  }), [session, profile, roles, loading, load])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useAuth must be used inside AuthProvider')
  return c
}
