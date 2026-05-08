import type {Request, Response, NextFunction} from "express"
import {loginSchema, registerSchema} from "./auth.schema"
import {AuthService} from "./auth.service"

export class AuthController {
    // controller deve usar o service
    private authService: AuthService

    // instância da dependência do controller
    constructor() {
        this.authService = new AuthService()
    }

    // função para registrar um usuário, validando os dados de entrada com o schema e usando a função do service para criar usuário e token
    async register(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const body = registerSchema.parse(req.body)
            const response = await this.authService.register(body)

            return res.status(201).json(response)
        } catch (error) {
            return next(error)
        }
    }

    // função para fazer login, validando os dados de entrada com o schema e usando a função do service para retornar token e usuário
    async login(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const body = loginSchema.parse(req.body)
            const response = await this.authService.login(body)

            return res.status(200).json(response)
        } catch (error) {
            return next(error)
        }
    }

    // função para retornar os dados do usuário autenticado usando as informações salvas pelo authMiddleware
    async me(req: Request, res: Response): Promise<Response> {
        if (!req.user) {
            return res.status(401).json({
                message: "Usuário não autenticado"
            })
        }

        return res.status(200).json(req.user)
    }
}
