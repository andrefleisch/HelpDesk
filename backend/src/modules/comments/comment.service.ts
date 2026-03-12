import type {CreateCommentBody, CommentRecord} from "./comment.types"
import {CommentRepository} from "./comment.repository"
import {prisma} from "../../prisma/client"

export class CommentService {
    // service usa repository
    private commentRepository: CommentRepository

    // instância da dependência do service
    constructor() {
        this.commentRepository = new CommentRepository()
    }

    // função para criar um comentário, verificando se o usuário autor do comentário e o ticket existem antes de criar o comentário
    async createComment( ticketId: string, data: CreateCommentBody): Promise<CommentRecord> {
        const authorUser = await prisma.user.findUnique({
            where: {id: data.authorId}
        })

        const ticket = await prisma.ticket.findUnique({
            where: {id: ticketId}
        })

        if (!authorUser) {
            throw new Error("Usuário autor do comentário não encontrado")
        }
        
        if (!ticket) {
            throw new Error("Ticket não encontrado")
        }

        return this.commentRepository.create(ticketId, data)
    }

    // função para listar todos os comentários de um ticket específico, usando função do repository e verificando se o ticket existe
    async listCommentsByTicketId(ticketId: string): Promise<CommentRecord[]> {
        const ticket = await prisma.ticket.findUnique({
            where: {id: ticketId}
        })

        if (!ticket) {
            throw new Error("Ticket não encontrado")
        }

        return this.commentRepository.listAll(ticketId)
    }
}