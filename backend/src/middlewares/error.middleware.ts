import type {NextFunction, Request, Response} from "express"
import {ZodError} from "zod"
import {AppError} from "../errors/AppError"

// middleware para tratar erros da aplicação em um único lugar
export function errorMiddleware(error: unknown, _req: Request, res: Response, _next: NextFunction) {
    // trata erros de validação do zod, retornando os campos inválidos para o cliente
    if (error instanceof ZodError) {
        return res.status(400).json({
            message: "Dados de entrada inválidos",
            errors: error.flatten().fieldErrors
        })
    }

    // trata erros esperados da aplicação, usando a mensagem e o status definidos no service
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            message: error.message
        })
    }

    // trata erros inesperados, evitando expor detalhes internos do servidor
    return res.status(500).json({
        message: "Erro interno do servidor"
    })
}
