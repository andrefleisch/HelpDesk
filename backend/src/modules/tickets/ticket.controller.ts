import { ZodError } from "zod"
import { createTicketSchema } from "./ticket.schema"
import { TicketService } from "./ticket.service"
import type { Request, Response } from "express"

export class TicketController {
    // controller deve usar o service
    private ticketService: TicketService

    // instância da dependência do controller
    constructor() {
        this.ticketService = new TicketService()
    }

    // função para criar um ticket, validando os dados de entrada com o schema e usando a função do service para criar o ticket
    async create(req: Request, res: Response): Promise<Response> {
        try {
            const body = createTicketSchema.parse(req.body)
            const ticket = await this.ticketService.createTicket(body)

            return res.status(201).json(ticket)
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    message: "Dados de entrada inválidos",
                    errors: error.flatten().fieldErrors
                })
            }

            return res.status(400).json({
                message: error instanceof Error ? error.message : "Erro ao criar ticket"
            })
        }       
    }

    // função para listar todos os tickets, usando a função do service para obter os tickets e retornando-os na resposta
    async findMany(_req: Request, res: Response): Promise<Response> {
        try {
            const tickets = await this.ticketService.getAllTickets()

            return res.status(200).json(tickets)
        } catch (error) {
            return res.status(500).json({
                message: error instanceof Error ? error.message : "Erro ao listar tickets"
            })
        }
    }
}