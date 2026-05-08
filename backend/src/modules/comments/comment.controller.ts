import { commentParamsSchema, createCommentSchema } from "./comment.schema";
import { CommentService } from "./comment.service";
import type {Request, Response, NextFunction} from "express";

export class CommentController {
    private commentService: CommentService

    constructor() {
        this.commentService = new CommentService()
    }

    // função para criar um comentário, validando os dados de entrada com o schema e usando a função do service para criar o comentário
    async create(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const body = createCommentSchema.parse(req.body)
            const params = commentParamsSchema.parse(req.params)

            if (!req.user) {
                return res.status(401).json({
                    message: "Usuário não autenticado"
                })
            }

            const comment = await this.commentService.createComment(params.ticketId, req.user.id, req.user.role, {
                ...body,
                authorId: req.user.id
            })

            return res.status(201).json(comment)
        } catch (error) {
            return next(error)
        }
    }

    // função para listar todos os comentários de um ticket específico, validando o id do ticket de entrada com o schema e usando a função do service para obter os comentários, retornando-os na resposta
    async findByTicketId(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const params = commentParamsSchema.parse(req.params)

            if (!req.user) {
                return res.status(401).json({
                    message: "Usuário não autenticado"
                })
            }

            const comments = await this.commentService.listCommentsByTicketId(params.ticketId, req.user.id, req.user.role)

            return res.status(200).json(comments)
        } catch (error) {
            return next(error)
        }
    }
}
