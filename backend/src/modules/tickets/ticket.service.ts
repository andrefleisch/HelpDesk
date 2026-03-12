import type {CreateTicketBody, TicketRecord, UpdateTicketPriorityBody, UpdateTicketStatusBody} from "./ticket.types"
import {TicketRepository} from "./ticket.repository"
import {prisma} from "../../prisma/client"

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

   
}

