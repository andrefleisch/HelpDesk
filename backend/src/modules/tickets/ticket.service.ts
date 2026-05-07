import type {AssignTicketBody, CreateTicketBody, ListTicketsQuery, PaginatedTicketsResponse, TicketRecord, UpdateTicketPriorityBody, UpdateTicketStatusBody} from "./ticket.types"
import {TicketRepository} from "./ticket.repository"
import {prisma} from "../../prisma/client"
import {AppError} from "../../errors/AppError"
import type {UserRole} from "../users/user.types"

export class TicketService {
    // service deve usar repository
    private ticketRepository: TicketRepository

    // instância da dependência do service
    constructor() {
        this.ticketRepository = new TicketRepository()
    }

    // função para criar um ticket, verificando se o usuário criador e o usuário atribuído existem antes de criar o ticket
    async createTicket(data: CreateTicketBody): Promise<TicketRecord> {
        const createdByUser = await prisma.user.findUnique({
            where: {id: data.createdById}
        })

        if (!createdByUser) {
            throw new AppError("Usuário criador do ticket não encontrado", 404)
        }

        if (data.assignedToId) {
            const assignedUser = await prisma.user.findUnique({
                where: {id: data.assignedToId}
            })

            if (!assignedUser) {
                throw new AppError("Usuário atribuído ao ticket não encontrado", 404)
            }
        }
        return this.ticketRepository.create(data)
    }

    // função para listar todos os tickets, usando função do repository
    async getAllTickets(query: ListTicketsQuery): Promise<PaginatedTicketsResponse> {
        return this.ticketRepository.listAll(query)
    }

    // função para mostrar um ticket específico, usando função do repository e verificando se o ticket existe
    async getTicketById(id: string): Promise<TicketRecord> {
        const ticket = await this.ticketRepository.findById(id)

        if (!ticket) {
            throw new AppError("Ticket não encontrado", 404)
        }

        return ticket
    }

    // função para atualizar o status do ticket, usando função do repository e verificando se o ticket existe
    async updateTicketStatus(id: string, data: UpdateTicketStatusBody): Promise<TicketRecord> {
        const existingTicket = await this.ticketRepository.findById(id)

        if (!existingTicket) {
            throw new AppError("Ticket não encontrado", 404)
        }

        return this.ticketRepository.updateStatus(id, data)
    }

    // função para atualizar a prioridade do ticket, usando função do repository e verificando se o ticket existe
    async updateTicketPriority(id: string, data: UpdateTicketPriorityBody): Promise<TicketRecord> {
        const existingTicket = await this.ticketRepository.findById(id)

        if (!existingTicket) {
            throw new AppError("Ticket não encontrado", 404)
        }

        return this.ticketRepository.updatePriority(id, data)
    }
    
    // função para atribuir um ticket a um usuário, usando função do repository e verificando se o ticket e o usuário existem
    async assignTicketResponsible(id: string, data: AssignTicketBody) {
        const existingTicket = await this.ticketRepository.findById(id)

        if (!existingTicket) {
            throw new AppError("Ticket não encontrado", 404)
        }

        const assignedUser = await prisma.user.findUnique({
            where: {id: data.assignedToId}
        })

        if (!assignedUser) {
            throw new AppError("Usuário atribuído ao ticket não encontrado", 404)
        }

        return this.ticketRepository.assignResponsible(id, data)
    }

    // função para cancelar um ticket, verificando se o ticket existe, se ainda pode ser cancelado e se o usuário comum é o dono do ticket
    async cancelTicket(id: string, userId: string, userRole: UserRole): Promise<TicketRecord> {
        const existingTicket = await this.ticketRepository.findById(id)

        if (!existingTicket) {
            throw new AppError("Ticket não encontrado", 404)
        }

        if (existingTicket.status === "RESOLVED") {
            throw new AppError("Não pode cancelar ticket já resolvido", 409)
        }

        if (existingTicket.status === "CANCELED") {
            throw new AppError("Não pode cancelar ticket já cancelado", 409)
        }

        if (userRole === "USER" && existingTicket.createdById !== userId) {
            throw new AppError("Usuário não autorizado", 403)
        }

        return this.ticketRepository.cancel(id)
    }
}
