import { assignTicketSchema, createTicketSchema, listTicketsQuerySchema, ticketParamsSchema, updateTicketPrioritySchema, updateTicketStatusSchema } from "./ticket.schema"
import { TicketService } from "./ticket.service"
import type { Request, Response, NextFunction } from "express"

export class TicketController {
    // controller deve usar o service
    private ticketService: TicketService

    // instância da dependência do controller
    constructor() {
        this.ticketService = new TicketService()
    }

    // função para criar um ticket, validando os dados de entrada com o schema e usando a função do service para criar o ticket
    async create(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const body = createTicketSchema.parse(req.body)

            if (!req.user) {
                return res.status(401).json({
                    message: "Usuário não autenticado"
                })
            }

            const ticket = await this.ticketService.createTicket({
                ...body,
                createdById: req.user.id
            })

            return res.status(201).json(ticket)
        } catch (error) {
            return next(error)
        }
    }

    // função para listar todos os tickets, usando a função do service para obter os tickets e retornando-os na resposta
    async findMany(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const query = listTicketsQuerySchema.parse(req.query)
            const tickets = await this.ticketService.getAllTickets(query)
            
            return res.status(200).json(tickets)
        } catch (error) {
            return next(error)
        }
    }

    // função para mostrar um ticket específico, validando o id de entrada com o schema e usando a função do service para obter o ticket, retornando-o na resposta
    async findById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const params = ticketParamsSchema.parse(req.params)
            const ticket = await this.ticketService.getTicketById(params.id)

            return res.status(200).json(ticket)
        } catch (error) {
            return next(error)
        }
    }

    // função para atualizar o status do ticket, validando o id e os dados de entrada com os schemas e usando a função do service para atualizar o status do ticket, retornando o ticket atualizado na resposta
    async updateStatus(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const params = ticketParamsSchema.parse(req.params)
            const body = updateTicketStatusSchema.parse(req.body)

            const ticket = await this.ticketService.updateTicketStatus(params.id, body)

            return res.status(200).json(ticket)
        } catch (error) {
            return next(error)
        }
    }

    // função para atualizar a prioridade do ticket, validando o id e os dados de entrada com os schemas e usando a função do service para atualizar a prioridade do ticket, retornando o ticket atualizado na resposta
    async updatePriority(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const params = ticketParamsSchema.parse(req.params)
            const body = updateTicketPrioritySchema.parse(req.body)

            const ticket = await this.ticketService.updateTicketPriority(params.id, body)

            return res.status(200).json(ticket)
        } catch (error) {
            return next(error)
        }
    }

    // função para atribuir um responsável ao ticket, validando o id e os dados de entrada com os schemas e usando a função do service para atribuir o responsável ao ticket, retornando o ticket atualizado na resposta
    async assignResponsible(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const params = ticketParamsSchema.parse(req.params)
            const body = assignTicketSchema.parse(req.body)

            const ticket = await this.ticketService.assignTicketResponsible(params.id, body)
            return res.status(200).json(ticket)
        } catch (error) {
            return next(error)
        }
    }

    // função para cancelar um ticket, validando o id e usando o usuário autenticado para aplicar a regra de permissão no service
    async cancel(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const params = ticketParamsSchema.parse(req.params)

            if (!req.user) {
                return res.status(401).json({
                    message: "Usuário não autenticado"
                })
            }

            const ticket = await this.ticketService.cancelTicket(params.id, req.user.id, req.user.role)
            return res.status(200).json(ticket)
        } catch (error) {
            return next(error)
        }
    }
}
