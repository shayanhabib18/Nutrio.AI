import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Listen for login, logout, and session changes.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!mounted) return

      setSession(currentSession)
      setUser(currentSession?.user ?? null)
      setLoading(false)
    })

    // Restore the existing session when the app loads.
    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return

      if (error) {
        console.error('Session error:', error.message)
      }

      setSession(data?.session ?? null)
      setUser(data?.session?.user ?? null)
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}