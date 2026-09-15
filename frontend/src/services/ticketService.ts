import { api } from "./api";
import type { PaginatedTicketsResponse, CreateTicketRequest, ListTicketsQuery, Ticket, UpdateTicketStatusRequest, UpdateTicketPriorityRequest} from "../types/ticket";

export async function getTickets(query: ListTicketsQuery = {}): Promise<PaginatedTicketsResponse> {
    const response = await api.get<PaginatedTicketsResponse>("/tickets", {
        params: query
    })

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
