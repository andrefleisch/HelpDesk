import {prisma} from "../../prisma/client"
import type {CreateCommentBody, CommentRecord} from "./comment.types"

export class CommentRepository {
    // cria um novo comentário usando função do prisma
    async create (ticketId: string, data: CreateCommentBody): Promise<CommentRecord> {
        const comment = await prisma.comment.create({
            data: {
                ticketId,
                authorId: data.authorId,
                content: data.content,
            }
        })
        return comment
    }

    // lista todos os comentários de um ticket específico, ordenados por data de criação
    async listAll(ticketId: string): Promise<CommentRecord[]> {
        const commentsByTicket = await prisma.comment.findMany({
            where: {ticketId},
            orderBy: {
                createdAt: "asc"
            }
        })

        return commentsByTicket
    }

}