import { AppError } from "../../errors/AppError"
import type {CreateCommentBody, CommentRecord} from "./comment.types"
import {CommentRepository} from "./comment.repository"
import {prisma} from "../../prisma/client"
import type {UserRole} from "../users/user.types"

export class CommentService {
    // service usa repository
    private commentRepository: CommentRepository

    // instância da dependência do service
    constructor() {
        this.commentRepository = new CommentRepository()
    }

    // função para criar um comentário, verificando se o usuário autor existe, se o ticket existe e se usuário comum é dono do ticket
    async createComment(ticketId: string, userId: string, userRole: UserRole, data: CreateCommentBody): Promise<CommentRecord> {
        const authorUser = await prisma.user.findUnique({
            where: {id: data.authorId}
        })

        const ticket = await prisma.ticket.findUnique({
            where: {id: ticketId}
        })

        if (!authorUser) {
            throw new AppError("Usuário autor do comentário não encontrado", 404)
        }
        
        if (!ticket) {
            throw new AppError("Ticket não encontrado", 404)
        }

        if (userRole === "USER" && ticket.createdById !== userId) {
            throw new AppError("Usuário não autorizado", 403)
        }

        return this.commentRepository.create(ticketId, data)
    }

    // função para listar todos os comentários de um ticket específico, verificando se o ticket existe e se usuário comum é dono do ticket
    async listCommentsByTicketId(ticketId: string, userId: string, userRole: UserRole): Promise<CommentRecord[]> {
        const ticket = await prisma.ticket.findUnique({
            where: {id: ticketId}
        })

        if (!ticket) {
            throw new AppError("Ticket não encontrado", 404)
        }

        if (userRole === "USER" && ticket.createdById !== userId) {
            throw new AppError("Usuário não autorizado", 403)
        }

        return this.commentRepository.listAll(ticketId)
    }
}
