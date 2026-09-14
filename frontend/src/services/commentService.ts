import { api } from "./api"
import type { Comment, CreateCommentRequest } from "../types/comment"

export async function getCommentsByTicket(ticketId: string): Promise<Comment[]> {
    const response = await api.get<Comment[]>(`/comments/${ticketId}/comments`)

    return response.data
}

export async function createComment(ticketId: string, data: CreateCommentRequest): Promise<Comment> {
    const response = await api.post<Comment>(`/comments/${ticketId}/comments`, data)

    return response.data
}
