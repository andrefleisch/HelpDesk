import { createUserSchema, userParamsSchema } from "./user.schema";
import { UserService } from "./user.service";
import type { Request, Response, NextFunction } from "express";

export class UserController {
    // controller deve usar o service
    private userService: UserService

    // instância da dependência do controller
    constructor() {
        this.userService = new UserService()
    }

    // função para criar um usuário, validando os dados de entrada com o schema e usando a função do service para criar o usuário
    async create(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const body = createUserSchema.parse(req.body)
            const user = await this.userService.createUser(body)

            return res.status(201).json(user)
        } catch (error) {
            return next(error)
        }
    }

    // função para mostrar um usuário específico, validando o id de entrada com o schema e usando a função do service para obter o usuário, retornando-o na resposta
    async findById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const params = userParamsSchema.parse(req.params)
            const user = await this.userService.getUserById(params.id)

            return res.status(200).json(user)
        } catch (error) {
            return next(error)
        }
    }

    // função para listar todos os usuários, usando a função do service para obter os usuários e retornando-os na resposta
    async findMany(_req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const users = await this.userService.getAllUsers()

            return res.status(200).json(users)
        } catch (error) {
            return next(error)
        }
    }

    
}
