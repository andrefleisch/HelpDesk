import { createContext, useContext } from "react"
import type { AuthUser, LoginRequest } from "../types/auth"

// qualquer componente que usar useAuth() poderá acessar esses atributos
type AuthContextValue = {
  user: AuthUser | null
  token: string | null
  loading: boolean
  login: (data: LoginRequest) => Promise<void>
  logout: () => void
}


export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider")
  }

  return context
}
