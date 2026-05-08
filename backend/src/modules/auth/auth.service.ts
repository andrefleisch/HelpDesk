import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import {AuthRepository} from "./auth.repository"
import type {AuthUserResponse, LoginInput, LoginResponse, RegisterInput} from "./auth.types"
import type {CreateUserInput, UserRecord} from "../users/user.types"
import { AppError } from "../../errors/AppError"
import { getAuthSecret } from "../../config/auth"

export class AuthService {
    // service deve usar repository
    private authRepository: AuthRepository

    // instância da dependência do service
    constructor() {
        this.authRepository = new AuthRepository()
    }

    // função para tirar o passwordHash da resposta do auth antes de retornar para o cliente
    private toAuthUserResponse(user: UserRecord): AuthUserResponse {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }
    }

    // função para criar o token JWT usando os dados do usuário autenticado
    private generateToken(user: UserRecord): string {
        const secret = getAuthSecret()
        
        return jwt.sign({
            email: user.email,
            name: user.name,
            role: user.role
        }, secret, {
            subject: user.id,
            expiresIn: "1d"
        })
    }

    // função para registrar um usuário, verificando se o email já existe, criptografando a senha e retornando token com usuário sem passwordHash
    async register(data: RegisterInput): Promise<LoginResponse> {
        const existingUser = await this.authRepository.findUserByEmail(data.email)

        if (existingUser) {
            throw new AppError("Email já cadastrado", 409)
        }

        const passwordHash = await bcrypt.hash(data.password, 10)

        const userToCreate: CreateUserInput = {
            name: data.name,
            email: data.email,
            passwordHash
        }

        const createdUser = await this.authRepository.createUser(userToCreate)

        return {
            token: this.generateToken(createdUser),
            user: this.toAuthUserResponse(createdUser)
        }
    }

    // função para fazer login, verificando se o usuário existe, comparando a senha e retornando token com usuário sem passwordHash
    async login(data: LoginInput): Promise<LoginResponse> {
        const user = await this.authRepository.findUserByEmail(data.email)

        if (!user) {
            throw new AppError("Email ou senha inválidos", 401)
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash)

        if (!isPasswordValid) {
            throw new AppError("Email ou senha inválidos", 401)
        }

        return {
            token: this.generateToken(user),
            user: this.toAuthUserResponse(user)
        }
    }
}
