import {prisma} from "../../prisma/client"
import type {CreateUserInput, UserRecord} from "./user.types"

export class UserRepository {
    // cria um novo usuário usando função do prisma
    async create(data: CreateUserInput): Promise<UserRecord> {
        const user = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                passwordHash: data.passwordHash 
            }
        })
        return user
    }

    // função get para mostrar uma intância específica usando id
    async findById(id: string): Promise<UserRecord | null> {
        const user = await prisma.user.findUnique({
            where: {id}
        })
        return user
    }

    // função get para mostrar uma intância específica usando email
    async findByEmail(email: string): Promise<UserRecord | null> {
        const user = await prisma.user.findUnique({
            where: {email}
        })
        return user
    }

    // função get para mostrar todas as intâncias ordenadas por data de criação
    async listAll(): Promise<UserRecord[]> {
        const users = await prisma.user.findMany({
            orderBy: {
                createdAt: "desc"
            }
        })
        return users
    }
}