export type UserRole = "USER" | "AGENT" | "ADMIN"

export type AuthUser = {
  id: string
  name: string
  email: string
  role: UserRole
}

export type LoginRequest = {
  email: string
  password: string
}

export type LoginResponse = {
  token: string
  user: AuthUser
}
