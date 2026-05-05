import {ZodError} from "zod"
import type {Request, Response} from "express"
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
    async register(req: Request, res: Response): Promise<Response> {
        try {
            const body = registerSchema.parse(req.body)
            const response = await this.authService.register(body)

            return res.status(201).json(response)
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    message: "Dados de entrada inválidos",
                    errors: error.flatten().fieldErrors
                })
            }

            return res.status(400).json({
                message: error instanceof Error ? error.message : "Erro ao registrar usuário"
            })
        }
    }

    // função para fazer login, validando os dados de entrada com o schema e usando a função do service para retornar token e usuário
    async login(req: Request, res: Response): Promise<Response> {
        try {
            const body = loginSchema.parse(req.body)
            const response = await this.authService.login(body)

            return res.status(200).json(response)
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    message: "Dados de entrada inválidos",
                    errors: error.flatten().fieldErrors
                })
            }

            return res.status(401).json({
                message: error instanceof Error ? error.message : "Erro ao fazer login"
            })
        }
    }
}
