import { useCallback, useState, type ReactNode } from 'react'
import { api } from './api'
import { AuthContext } from './auth-context'
import { ROLE_REDIRECTS, type User } from './Users'

const getStoredUser = (): User | null => {
  const stored = localStorage.getItem('auth_user')
  return stored ? JSON.parse(stored) : null
}

const toAppUser = (payload: {
  accessToken: string
  user: { id: number; name: string; email: string; role: 'admin' | 'user' }
}): User => ({
  id: String(payload.user.id),
  name: payload.user.name,
  email: payload.user.email,
  role: payload.user.role,
  token: payload.accessToken,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getStoredUser())
  const [loading, setLoading] = useState(false)

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    try {
      const payload = await api.login(email, password)
      const loggedUser = toAppUser(payload)
      setUser(loggedUser)
      localStorage.setItem('auth_user', JSON.stringify(loggedUser))
      return { success: true, redirect: ROLE_REDIRECTS[loggedUser.role] }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Email ou mot de passe incorrect.',
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('auth_user')
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    setLoading(true)
    try {
      const payload = await api.register(name, email, password)
      const registeredUser = toAppUser(payload)
      setUser(registeredUser)
      localStorage.setItem('auth_user', JSON.stringify(registeredUser))
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Impossible de creer le compte.',
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const getRedirect = useCallback(() => {
    if (!user) return '/login'
    return ROLE_REDIRECTS[user.role]
  }, [user])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        register,
        getRedirect,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
