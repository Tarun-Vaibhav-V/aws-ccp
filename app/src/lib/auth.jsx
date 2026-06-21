import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isCloudEnabled } from './supabase.js'
import { setSyncUser } from './storage.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!supabase) {
      setReady(true)
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setReady(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const u = session?.user
    setSyncUser(
      u?.id || null,
      u ? { email: u.email, name: u.user_metadata?.full_name || u.user_metadata?.name || '' } : null
    )
  }, [session])

  const origin = typeof window !== 'undefined' ? window.location.origin : undefined

  const value = {
    session,
    user: session?.user || null,
    ready,
    isCloudEnabled,
    signInWithGoogle: () =>
      supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: origin } }),
    signInWithPassword: (email, password) =>
      supabase.auth.signInWithPassword({ email, password }),
    signUp: (email, password, fullName) =>
      supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: origin, data: fullName ? { full_name: fullName } : undefined },
      }),
    signInWithMagicLink: (email) =>
      supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: origin } }),
    signOut: () => supabase.auth.signOut(),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
