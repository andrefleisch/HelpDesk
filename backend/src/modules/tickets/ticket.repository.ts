import {prisma} from "../../prisma/client"
import type {AssignTicketBody, CreateTicketBody, UpdateTicketPriorityBody, UpdateTicketStatusBody, TicketRecord} from "./ticket.types"

export class TickerRepository {
    // cria um novo ticket usando função do prisma
    async create (data: CreateTicketBody): Promise<TicketRecord> {
        const ticket = await prisma.ticket.create({
            data: {
                title: data.title,
                description: data.description,
                priority: data.priority,
                status: "OPEN",
                createdById: data.createdById,
                assignedToId: data.assignedToId ?? null
            }
        })
        return ticket
    }

    async listAll (): Promise<TicketRecord[]> {
        const tickets = await prisma.ticket.findMany({
            orderBy: {
                createdAt: "desc"
            }
        })
        return tickets
    }

    async findById (id: string): Promise<TicketRecord | null> {
        const ticket = await prisma.ticket.findUnique({
            where: {id}
        })
        return ticket
    }




}