import { ZodError } from "zod"
import { assignTicketSchema, createTicketSchema, ticketParamsSchema, updateTicketPrioritySchema, updateTicketStatusSchema } from "./ticket.schema"
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

    // função para mostrar um ticket específico, validando o id de entrada com o schema e usando a função do service para obter o ticket, retornando-o na resposta
    async findById(req: Request, res: Response): Promise<Response> {
        try {
            const params = ticketParamsSchema.parse(req.params)
            const ticket = await this.ticketService.getTicketById(params.id)

            return res.status(200).json(ticket)
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    message: "ID inválido",
                    errors: error.flatten().fieldErrors
                })
            }
            return res.status(404).json({
                message: error instanceof Error ? error.message : "Erro ao buscar ticket"
            })
        }
    }

    // função para atualizar o status do ticket, validando o id e os dados de entrada com os schemas e usando a função do service para atualizar o status do ticket, retornando o ticket atualizado na resposta
    async updateStatus(req: Request, res: Response): Promise<Response> {
        try {
            const params = ticketParamsSchema.parse(req.params);
            const body = updateTicketStatusSchema.parse(req.body);

            const ticket = await this.ticketService.updateTicketStatus(params.id, body);

            return res.status(200).json(ticket);
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    message: "Dados inválidos",
                    errors: error.flatten().fieldErrors
                })
            }

            return res.status(400).json({
                message: error instanceof Error ? error.message : "Erro ao atualizar status do ticket"
            })
        }
    }

    // função para atualizar a prioridade do ticket, validando o id e os dados de entrada com os schemas e usando a função do service para atualizar a prioridade do ticket, retornando o ticket atualizado na resposta
    async updatePriority(req: Request, res: Response): Promise<Response> {
        try {
            const params = ticketParamsSchema.parse(req.params)
            const body = updateTicketPrioritySchema.parse(req.body)

            const ticket = await this.ticketService.updateTicketPriority(params.id, body)

            return res.status(200).json(ticket)
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    message: "Dados inválidos",
                    errors: error.flatten().fieldErrors
                })
            }

            return res.status(400).json({
                message: error instanceof Error ? error.message : "Erro ao atualizar prioridade do ticket"
            })
        }
    }

    // função para atribuir um responsável ao ticket, validando o id e os dados de entrada com os schemas e usando a função do service para atribuir o responsável ao ticket, retornando o ticket atualizado na resposta
    async assignResponsible(req: Request, res: Response): Promise<Response> {
        try {
            const params = ticketParamsSchema.parse(req.params)
            const body = assignTicketSchema.parse(req.body)

            const ticket = await this.ticketService.assignTicketResponsible(params.id, body)
            return res.status(200).json(ticket)
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    message: "Dados inválidos",
                    errors: error.flatten().fieldErrors
                })
            }

            return res.status(400).json({
                message: error instanceof Error ? error.message : "Erro ao atribuir responsável ao ticket"
            })
        }
    }

}