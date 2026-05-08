import {prisma} from "../../prisma/client"
import type {AssignTicketBody, CreateTicketBody, UpdateTicketPriorityBody, UpdateTicketStatusBody, TicketRecord, ListTicketsQuery, PaginatedTicketsResponse} from "./ticket.types"

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
    async listAll(query: ListTicketsQuery): Promise<PaginatedTicketsResponse> {
        // monta os filtros que serão usados na busca dos tickets
        const where = {
            status: query.status,
            priority: query.priority,
            createdById: query.createdById,
            assignedToId: query.assignedToId
        }

        // calcula quantos registros devem ser pulados antes de buscar a página atual
        const skip = (query.page - 1) * query.limit

        // busca os tickets da página atual e conta o total de tickets com os mesmos filtros
        const [tickets, total] = await Promise.all([
            prisma.ticket.findMany({
                where,
                skip,
                take: query.limit,
                orderBy: {
                    createdAt: "desc"
                }
            }),
            prisma.ticket.count({
                where
            })
        ])

        return {
            data: tickets,
            meta: {
                page: query.page,
                limit: query.limit,
                total,
                totalPages: Math.ceil(total / query.limit)
            }
        }
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

    // função para cancelar um ticket, atualizando o status para CANCELED
    async cancel(id: string): Promise<TicketRecord> {
        const ticket = await prisma.ticket.update({
            where: {id},
            data: {
                status: "CANCELED"
            }
        })
        return ticket
    }
}
