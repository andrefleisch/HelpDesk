export type Comment = {
    id: string
    content: string
    ticketId: string
    authorId: string
    createdAt: string
}

export type CreateCommentRequest = {
    content: string
}
