import {prisma} from "../../prisma/client"
import type {AssignTicketBody, CreateTicketBody, UpdateTicketPriorityBody, UpdateTicketStatusBody, TicketRecord} from "./ticket.types"

export class TicketRepository {
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

    // função get para mostrar todas as intâncias ordenadas por data de criação
    async listAll (): Promise<TicketRecord[]> {
        const tickets = await prisma.ticket.findMany({
            orderBy: {
                createdAt: "desc"
            }
        })
        return tickets
    }

    // função get para mostrar uma intância específica usando id
    async findById (id: string): Promise<TicketRecord | null> {
        const ticket = await prisma.ticket.findUnique({
            where: {id}
        })
        return ticket
    }

    // função para atualizar o status do ticket
    async updateStatus (id: string, data: UpdateTicketStatusBody): Promise<TicketRecord> {
        const ticket = await prisma.ticket.update({
            where: {id},
            data: {
                status: data.status
            }
        })
        return ticket
    }

    // função para atualizar a prioridade do ticket
    async updatePriority (id: string, data: UpdateTicketPriorityBody) : Promise<TicketRecord> {
        const ticket = await prisma.ticket.update({
            where: {id},
            data: {
                priority: data.priority
            }
        })
        return ticket
    }

    // função para colocar responsável no ticket
    async assignResponsible (id: string, data: AssignTicketBody): Promise<TicketRecord> {
        const ticket = await prisma.ticket.update({
            where: {id},
            data: {
                assignedToId: data.assignedToId
            }
        })
        return ticket
    }
}