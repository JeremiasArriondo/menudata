"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase, type AuthUser, isSupabaseConfigured } from "@/lib/supabase"
import type { Session } from "@supabase/supabase-js"

interface AuthContextType {
  user: AuthUser | null
  session: Session | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>
  signUpWithEmail: (email: string, password: string, name: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  isConfigured: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const configured = isSupabaseConfigured()

  useEffect(() => {
    if (!configured || !supabase) {
      setLoading(false)
      return
    }

    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser((session?.user as AuthUser) || null)
      setLoading(false)
    })

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser((session?.user as AuthUser) || null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [configured])

  const signInWithGoogle = async () => {
    if (!configured || !supabase) {
      throw new Error("Supabase no está configurado")
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/admin`,
      },
    })
    if (error) throw error
  }

  const signInWithEmail = async (email: string, password: string) => {
    if (!configured || !supabase) {
      return { error: "Supabase no está configurado" }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error: error.message }
    }

    return {}
  }

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    if (!configured || !supabase) {
      return { error: "Supabase no está configurado" }
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          name: name,
        },
      },
    })

    if (error) {
      return { error: error.message }
    }

    return {}
  }

  const signOut = async () => {
    if (!configured || !supabase) {
      throw new Error("Supabase no está configurado")
    }

    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const value = {
    user,
    session,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    isConfigured: configured,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
