import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { User } from '../types'

interface AuthState {
  user: User | null
  session: any
  loading: boolean
  setSession: (session: any) => void
  fetchUser: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: true,

  setSession: (session) => set({ session }),

  fetchUser: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { set({ loading: false, user: null, session: null }); return }
    set({ session })
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()
    set({ user: data ?? null, loading: false })
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    set({ session: data.session })
    await get().fetchUser()
    return {}
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null })
  },
}))
