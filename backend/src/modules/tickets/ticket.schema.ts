import {z} from "zod"

export const ticketStatusSchema = z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"])

export const ticketPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH"])

export const createTicketSchema = z.object({
    title: z.string().trim().min(1, "Título é obrigatório"),
    description: z.string().trim().min(1, "Descrição é obrigatória"),
    priority: ticketPrioritySchema,
    createdById: z.string().trim().min(1, "createdById é obrigatório"),
    assignedToId: z.string().trim().min(1).optional().nullable(),
})

export const ticketParamsSchema = z.object({
    id: z.string().trim().min(1, "id é obrigatório")
})

export const updateTicketParamsSchema = z.object({
    priority: ticketPrioritySchema
})

export const assignTicketSchema = z.object({
    assignedToId: z.string().trim().min(1, "assignedToId é obrigatório")
})