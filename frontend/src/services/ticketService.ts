import { api } from "./api";
import type { PaginatedTicketsResponse, CreateTicketRequest, Ticket, UpdateTicketStatusRequest, UpdateTicketPriorityRequest} from "../types/ticket";

export async function getTickets(): Promise<PaginatedTicketsResponse> {
    const response = await api.get<PaginatedTicketsResponse>("/tickets")

    return response.data
}

export async function createTicket(data: CreateTicketRequest): Promise<Ticket> {
    const response = await api.post<Ticket>("/tickets", data)

    return response.data
}

export async function getTicketById(id: string): Promise<Ticket> {
    const response = await api.get<Ticket>(`/tickets/${id}`)

    return response.data
}

export async function updateTicketStatus(
    id: string,
    data: UpdateTicketStatusRequest
):Promise<Ticket> {
    const response = await api.patch<Ticket>(`/tickets/${id}/status`, data)

    return response.data
}

export async function updateTicketPriority(
    id: string,
    data: UpdateTicketPriorityRequest
): Promise<Ticket> {
    const response = await api.patch<Ticket>(`/tickets/${id}/priority`, data)

    return response.data
}