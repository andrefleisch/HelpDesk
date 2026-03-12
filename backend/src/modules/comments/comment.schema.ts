import {z} from "zod"

export const commentParamsSchema = z.object({
    ticketId: z.string().trim().min(1, "ID do ticket é obrigatório"),
})    
export const createCommentSchema = z.object({
    content: z.string().trim().min(1, "Comentário não pode ser vazio"),
    authorId: z.string().trim().min(1, "Autor do comentário é obrigatório")
})

