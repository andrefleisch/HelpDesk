import { UserRepository } from "./user.repository";
import { CreateUserBody, CreateUserInput, UserRecord, User } from "./user.types";
import bcrypt from "bcryptjs"

export class UserService {
    // service deve usar repository
    private userRepository: UserRepository

    // instância da dependência do service
    constructor() {
        this.userRepository = new UserRepository()
    }

    // função para tirar o passwordHash para fazer a resposta para o cliente
    private toUserResponse(user: UserRecord): User {
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };
    }
    
    // função para criar um usuário, verificando se o email já existe antes de criar o usuário e criptografando a senha antes de salvar no banco
    async createUser(data: CreateUserBody): Promise<User> {
        const existingUser = await this.userRepository.findByEmail(data.email)

        if (existingUser) {
            throw new Error("Email já cadastrado")
        }

        const passwordHash = await bcrypt.hash(data.password, 10)
        
        const userToCreate: CreateUserInput = {
            name: data.name,
            email: data.email,
            passwordHash
        } 

        const createdUser = await this.userRepository.create(userToCreate)

        return this.toUserResponse(createdUser)
    }
    
    // função para mostrar um usuário específico, usando função do repository e verificando se o usuário existe
    async getUserById(id: string): Promise<User> {
        const user = await this.userRepository.findById(id)

        if (!user) {
            throw new Error("Usuário não encontrado")
        }

        return this.toUserResponse(user)
    }

    // função para listar todos os usuários, usando função do repository e tirando o passwordHash para fazer a resposta para o cliente
    async getAllUsers(): Promise<User[]> {
        const users = await this.userRepository.listAll()

        return users.map(user => this.toUserResponse(user))
    }
}

