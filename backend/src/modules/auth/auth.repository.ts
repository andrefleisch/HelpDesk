import {prisma} from "../../prisma/client"
import type {CreateUserInput, UserRecord} from "../users/user.types"

export class AuthRepository {
    // cria um usuário já com passwordHash para o fluxo de registro
    async createUser(data: CreateUserInput): Promise<UserRecord> {
        const user = await prisma.user.create({
            // sem role pois o prisma ja aplica automatico, nao queremos que o user escolha role
            data: {
                name: data.name,
                email: data.email,
                passwordHash: data.passwordHash
            }
        })

        return user
    }

    // busca usuário pelo email para login ou checagem de duplicidade
    async findUserByEmail(email: string): Promise<UserRecord | null> {
        const user = await prisma.user.findUnique({
            where: {email}
        })

        return user
    }

    // busca usuário pelo id para identificar o usuário autenticado quando necessário
    async findUserById(id: string): Promise<UserRecord | null> {
        const user = await prisma.user.findUnique({
            where: {id}
        })

        return user
    }
}
