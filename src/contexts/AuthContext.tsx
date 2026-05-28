import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Company, AuthState } from '../types'

interface AuthContextValue extends AuthState {
  login: (token: string, company: Company) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadState(): AuthState {
  try {
    const token = localStorage.getItem('sm_token')
    const raw = localStorage.getItem('sm_company')
    const company = raw ? (JSON.parse(raw) as Company) : null
    return { token, company, isAuthenticated: !!token && !!company }
  } catch {
    return { token: null, company: null, isAuthenticated: false }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(loadState)

  const login = useCallback((token: string, company: Company) => {
    localStorage.setItem('sm_token', token)
    localStorage.setItem('sm_company', JSON.stringify(company))
    setState({ token, company, isAuthenticated: true })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('sm_token')
    localStorage.removeItem('sm_company')
    setState({ token: null, company: null, isAuthenticated: false })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
