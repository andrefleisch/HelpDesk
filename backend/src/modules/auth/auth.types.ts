import type {UserRole} from "../users/user.types"

// dados necessários para registrar um usuário
export type RegisterInput = {
    name: string
    email: string
    password: string
}

// dados necessários para fazer login
export type LoginInput = {
    email: string
    password: string
}

// resposta do usuário autenticado, sem retornar o passwordHash para o cliente
export type AuthUserResponse = {
    id: string
    name: string
    email: string
    role: UserRole
    createdAt: Date
    updatedAt: Date
}

// resposta do login e registro, retornando token e usuário autenticado
export type LoginResponse = {
    token: string
    user: AuthUserResponse
}
