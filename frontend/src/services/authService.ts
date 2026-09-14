import { api } from "./api"
import type { AuthUser, LoginRequest, LoginResponse } from "../types/auth"

export async function loginRequest(data: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/auth/login", data)

  return response.data
}

export async function getMeRequest(): Promise<AuthUser> {
  const response = await api.get<AuthUser>("/auth/me")

  return response.data
}
