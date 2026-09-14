import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import { AuthContext } from "./authContext"
import { getMeRequest, loginRequest } from "../services/authService"
import type { AuthUser, LoginRequest } from "../types/auth"

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("helpdesk.token"))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCurrentUser() {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const currentUser = await getMeRequest()
        setUser(currentUser)
      } catch {
        localStorage.removeItem("helpdesk.token")
        setToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    loadCurrentUser()
  }, [token])

  async function login(data: LoginRequest) {
    const response = await loginRequest(data)

    localStorage.setItem("helpdesk.token", response.token)
    setToken(response.token)
    setUser(response.user)
  }

  function logout() {
    localStorage.removeItem("helpdesk.token")
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
