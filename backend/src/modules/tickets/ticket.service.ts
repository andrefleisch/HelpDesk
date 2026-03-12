import type {AssignTicketBody, CreateTicketBody, TicketRecord, UpdateTicketPriorityBody, UpdateTicketStatusBody} from "./ticket.types"
import {TicketRepository} from "./ticket.repository"
import {prisma} from "../../prisma/client"
import { Ticket } from "@prisma/client"

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
            throw new Error("Usuário criador do ticket não encontrado")
        }

        if (data.assignedToId) {
            const assignedUser = await prisma.user.findUnique({
                where: {id: data.assignedToId}
            })

            if(!assignedUser) {
                throw new Error("Usuário atribuído ao ticket não encontrado")
            }
        }
        return this.ticketRepository.create(data)
    }

    // função para listar todos os tickets, usando função do repository
    async getAllTickets(): Promise<TicketRecord[]> {
        return this.ticketRepository.listAll()
    }

    // função para mostrar um ticket específico, usando função do repository e verificando se o ticket existe
    async getTicketById(id: string): Promise<TicketRecord> {
        const ticket = await this.ticketRepository.findById(id)

        if (!ticket) {
            throw new Error("Ticket não encontrado")
        }

        return ticket
    }

    // função para atualizar o status do ticket, usando função do repository e verificando se o ticket existe
    async updateTicketStatus(id:string, data: UpdateTicketStatusBody): Promise<TicketRecord> {
        const existingTicket = await this.ticketRepository.findById(id)

        if (!existingTicket) {
            throw new Error("Ticket não encontrado")
        }

        return this.ticketRepository.updateStatus(id, data)
    }

    // função para atualizar a prioridade do ticket, usando função do repository e verificando se o ticket existe
    async updateTicketPriority(id: string, data: UpdateTicketPriorityBody): Promise<TicketRecord> {
        const existingTicket = await this.ticketRepository.findById(id)

        if (!existingTicket) {
            throw new Error("Ticket não encontrado")
        }

        return this.ticketRepository.updatePriority(id, data)
    }
    
    // função para atribuir um ticket a um usuário, usando função do repository e verificando se o ticket e o usuário existem
    async assignTicketResponsible(id: string, data: AssignTicketBody) {
        const existingTicket = await this.ticketRepository.findById(id)

        if (!existingTicket) {
            throw new Error("Ticket não encontrado")
        }

        const assignedUser = await prisma.user.findUnique({
            where: {id: data.assignedToId}
        })

        if (!assignedUser) {
            throw new Error("Usuário atribuído ao ticket não encontrado")
        }

        return this.ticketRepository.assignResponsible(id, data)
    }


   
}

