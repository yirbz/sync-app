"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { login, logout, restoreSession, type SessionData } from "@/lib/jellyfin"

interface AuthContextValue {
  session: SessionData | null
  loading: boolean
  signIn: (serverUrl: string, username: string, password: string) => Promise<void>
  signOut: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = restoreSession()
    if (saved) setSession(saved)
    setLoading(false)
  }, [])

  const signIn = useCallback(async (serverUrl: string, username: string, password: string) => {
    const result = await login(serverUrl, username, password)
    const s: SessionData = {
      serverUrl,
      token: result.token,
      userId: result.user.id,
      userName: result.user.name,
      serverName: result.serverName,
    }
    setSession(s)
  }, [])

  const signOut = useCallback(() => {
    logout()
    setSession(null)
  }, [])

  return (
    <AuthContext.Provider value={{ session, loading, signIn, signOut, isAuthenticated: !!session }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}