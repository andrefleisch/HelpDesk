// criar comment
export type CreateCommentBody = {
    content: string;
    authorId: string;
}

// params da rota
export type CommentParams = {
    authorId: string;
}
// resposta do comment após criar instância
export type CommentRecord = {
    id: string;
    content: string;
    authorId: string;
    ticketId: string;
    createdAt: Date;
}