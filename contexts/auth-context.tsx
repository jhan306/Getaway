// contexts/auth-context.tsx
"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs"

type AuthContextType = {
  user: User | null
  loading: boolean
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error?: string; needsConfirmation?: boolean }>
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  resendConfirmation: (email: string) => Promise<{ error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Create a Supabase client that lives entirely on the browser side:
  const supabase = createPagesBrowserClient()

  useEffect(() => {
    // 1) Fetch the initial session (if any), so we know if a user is already logged in:
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    // 2) Listen for any auth state changes (sign-in, sign-out, token refresh, etc):
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)

        // If a new user just signed up or just confirmed their email:
        if (
          (event === "SIGNED_UP" || event === "TOKEN_REFRESHED") &&
          session?.user
        ) {
          // Only create/update profile once the email is confirmed
          if (session.user.email_confirmed_at) {
            await supabase
              .from("users")
              .upsert({
                id: session.user.id,
                email: session.user.email!,
                full_name: session.user.user_metadata?.full_name || null,
                avatar_url: session.user.user_metadata?.avatar_url || null,
              })
              .select()
          }
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const signUp = async (
    email: string,
    password: string,
    fullName: string
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          // When they click the confirmation link, Supabase will redirect
          // back to your Auth Callback route. Adjust this as needed:
          emailRedirectTo: `${window.location.origin}/auth/callback?type=signup`,
        },
      })

      if (error) {
        return { error: error.message }
      }

      // If the user needs to confirm their email (i.e. no session yet):
      if (data.user && !data.session) {
        return { needsConfirmation: true }
      }
      return {}
    } catch (err) {
      return { error: "An unexpected error occurred" }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        return { error: error.message }
      }
      return {}
    } catch (err) {
      return { error: "An unexpected error occurred" }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const resendConfirmation = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?type=signup`,
        },
      })
      if (error) {
        return { error: error.message }
      }
      return {}
    } catch (err) {
      return { error: "An unexpected error occurred" }
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, signUp, signIn, signOut, resendConfirmation }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
