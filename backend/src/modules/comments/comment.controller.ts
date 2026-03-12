import { ZodError } from "zod";
import { commentParamsSchema, createCommentSchema } from "./comment.schema";
import { CommentService } from "./comment.service";
import type {Request, Response} from "express";

export class CommentController {
    private commentService: CommentService

    constructor() {
        this.commentService = new CommentService()
    }

    // função para criar um comentário, validando os dados de entrada com o schema e usando a função do service para criar o comentário
    async create(req: Request, res: Response): Promise<Response> {
        try {
            const body = createCommentSchema.parse(req.body)
            const params = commentParamsSchema.parse(req.params)

            const comment = await this.commentService.createComment(params.ticketId, body)

            return res.status(201).json(comment)
            } catch (error) {
                if (error instanceof ZodError) {
                    return res.status(400).json({
                        message: "Dados de entrada inválidos",
                        errors: error.flatten().fieldErrors
                    })
                }
    
                return res.status(400).json({
                    message: error instanceof Error ? error.message : "Erro ao criar comentário"
                })
            }
    }

    // função para listar todos os comentários de um ticket específico, validando o id do ticket de entrada com o schema e usando a função do service para obter os comentários, retornando-os na resposta
    async findByTicketId(req: Request, res: Response): Promise<Response> {
        try {
            const params = commentParamsSchema.parse(req.params)
            const comments = await this.commentService.listCommentsByTicketId(params.ticketId)

            return res.status(200).json(comments)
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    message: "ID do ticket inválido",
                    errors: error.flatten().fieldErrors
                })
            }

            return res.status(400).json({
                message: error instanceof Error ? error.message : "Erro ao listar comentários"
            })
        }
    }


}