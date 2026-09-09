import { ref, computed } from 'vue'
import type { User, Session } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient'

const user = ref<User | null>(null)
const session = ref<Session | null>(null)
const loading = ref(true)
const authInitialized = ref(false)

export function useAuth() {
  const isAuthenticated = computed(() => !!session.value)

  async function initAuth(): Promise<Session | null> {
    if (authInitialized.value) {
      return session.value
    }

    loading.value = true
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          console.warn('Error fetching Supabase session:', error.message)
        } else {
          session.value = data.session
          user.value = data.session?.user || null
        }

        // Listen to auth changes
        supabase.auth.onAuthStateChange((_event, newSession) => {
          session.value = newSession
          user.value = newSession?.user || null
          loading.value = false
        })
      }
    } catch (err) {
      console.error('Failed to initialize Supabase auth:', err)
    } finally {
      loading.value = false
      authInitialized.value = true
    }

    return session.value
  }

  async function signIn(email: string, password: string) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase no está configurado en las variables de entorno.')
    }

    loading.value = true
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      })

      if (error) {
        throw error
      }

      session.value = data.session
      user.value = data.user
      return data
    } finally {
      loading.value = false
    }
  }

  async function signUp(email: string, password: string) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase no está configurado en las variables de entorno.')
    }

    loading.value = true
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password
      })

      if (error) {
        throw error
      }

      session.value = data.session
      user.value = data.user
      return data
    } finally {
      loading.value = false
    }
  }

  async function signOut() {
    loading.value = true
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut()
      }
      session.value = null
      user.value = null
    } catch (err) {
      console.warn('Error signing out:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    session,
    loading,
    isAuthenticated,
    initAuth,
    signIn,
    signUp,
    signOut
  }
}
