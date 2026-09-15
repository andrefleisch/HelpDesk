import { FormEvent, useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { createComment, getCommentsByTicket } from "../services/commentService"
import { getTicketById, updateTicketStatus, updateTicketPriority} from "../services/ticketService"
import type { Comment } from "../types/comment"
import type { Ticket, TicketPriority, UpdatableTicketStatus } from "../types/ticket"
import { useAuth } from "../contexts/authContext"
import { TICKET_PRIORITY_LABELS, TICKET_STATUS_LABELS } from "../constants/domainLabels"

export function TicketDetailsPage() {
    const { id } = useParams()
    const {user} = useAuth()
    const canManageTicket = user?.role === "AGENT" || user?.role === "ADMIN"
    const [ticket, setTicket] = useState<Ticket | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [comments, setComments] = useState<Comment[]>([])
    const [commentsLoading, setCommentsLoading] = useState(true)
    const [commentsError, setCommentsError] = useState("")
    const [commentContent, setCommentContent] = useState("")
    const [creatingComment, setCreatingComment] = useState(false)
    const [createCommentError, setCreateCommentError] = useState("")
    const [statusUpdating, setStatusUpdating] = useState(false)
    const [statusError, setStatusError] = useState("")
    const [priorityUpdating, setPriorityUpdating] = useState(false)
    const [priorityError, setPriorityError] = useState("")

    async function handleCreateComment(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (!id) {
            setCreateCommentError("Ticket não informado")
            return
        }

        try {
            setCreatingComment(true)
            setCreateCommentError("")

            await createComment(id, {
                content: commentContent
            })

            setCommentContent("")
            await loadComments(id)
        } catch {
            setCreateCommentError("Não foi possível publicar o comentário. Tente novamente.")
        } finally {
            setCreatingComment(false)
        }
    }

    async function handleUpdateStatus(status: UpdatableTicketStatus) {
        if (!id) {
            setStatusError("Ticket não informado")
            return
        }

        try {
            setStatusUpdating(true)
            setStatusError("")

            const updatedTicket = await updateTicketStatus(id, {
                status: status
            })

            setTicket(updatedTicket)
        } catch {
            setStatusError("Não foi possível atualizar o status. Tente novamente.")
        } finally {
            setStatusUpdating(false)
        }
    }

    async function handleUpdatePriority(priority: TicketPriority) {
        if (!id) {
            setPriorityError("Ticket não informado")
            return
        }

        try {
            setPriorityUpdating(true)
            setPriorityError("")

            const updatedTicket = await updateTicketPriority(id, {
                priority: priority
            })

            setTicket(updatedTicket)
        } catch {
            setPriorityError("Não foi possível atualizar a prioridade. Tente novamente.")
        } finally {
            setPriorityUpdating(false)
        }
    }

    async function loadComments(ticketId: string) {
        try {
            setCommentsLoading(true)
            setCommentsError("")

            const response = await getCommentsByTicket(ticketId)

            setComments(response)
        } catch {
            setCommentsError("Não foi possível carregar os comentários. Atualize a página para tentar novamente.")
        } finally {
            setCommentsLoading(false)
        }
    }

    useEffect(() => {
        async function loadTicket() {
            if (!id) {
                setError("Ticket não informado")
                setLoading(false)
                return
            }

            try {
                setLoading(true)
                setError("")

                const response = await getTicketById(id)

                setTicket(response)
                await loadComments(id)
            } catch {
                setError("Não foi possível carregar o ticket. Volte à lista e tente novamente.")
            } finally {
                setLoading(false)
            }
        }

        loadTicket()
    }, [id])

    let commentsContent
    let createCommentErrorContent = null

    if (createCommentError) {
        createCommentErrorContent = (
            <div className="alert alert-danger" role="alert">
                {createCommentError}
            </div>
        )
    }

    if (commentsLoading) {
        commentsContent = <p>Carregando comentários...</p>
    } else if (commentsError) {
        commentsContent = (
            <div className="alert alert-danger" role="alert">
                {commentsError}
            </div>
        )
    } else if (comments.length === 0) {
        commentsContent = (
            <div className="alert alert-info" role="alert">
                Ainda não há comentários. Publique o primeiro comentário usando o campo acima.
            </div>
        )
    } else {
        commentsContent = (
            <div className="list-group">
                {comments.map((comment) => (
                    <div className="list-group-item" key={comment.id}>
                        <p className="mb-1">{comment.content}</p>
                        <small className="text-secondary">
                            {new Date(comment.createdAt).toLocaleString("pt-BR")}
                        </small>
                    </div>
                ))}
            </div>
        )
    }

    let manageTicketContent = null
    let statusErrorContent = null
    let priorityErrorContent = null

    if (statusError) {
        statusErrorContent = (
            <div className="alert alert-danger" role="alert">
                {statusError}
            </div>
        )
    }

    if (priorityError) {
        priorityErrorContent = (
            <div className="alert alert-danger" role="alert">
                {priorityError}
            </div>
        )
    }
    if (canManageTicket) {
        manageTicketContent = (
            <div className="mb-3">
                <div className="mb-3">
                    {statusErrorContent}
  
                    <p className="fw-semibold mb-2">Atualizar status</p>
  
                    <div className="ticket-action-group d-flex gap-2 mb-3">
                        <button 
                            className="btn btn-outline-primary btn-sm"
                            type="button"
                            disabled={statusUpdating}
                            onClick={() => handleUpdateStatus("OPEN")}>

                                {TICKET_STATUS_LABELS.OPEN}
                        </button>

                        <button 
                            className="btn btn-outline-primary btn-sm"
                            type="button"
                            disabled={statusUpdating}
                            onClick={() => handleUpdateStatus("IN_PROGRESS")}>

                                {TICKET_STATUS_LABELS.IN_PROGRESS}
                        </button>

                        <button 
                            className="btn btn-outline-primary btn-sm"
                            type="button"
                            disabled={statusUpdating}
                            onClick={() => handleUpdateStatus("RESOLVED")}>

                                {TICKET_STATUS_LABELS.RESOLVED}
                        </button>
                    </div>
                </div>
  
                <div className="mb-3">
                    {priorityErrorContent}
  
                    <p className="fw-semibold mb-2">Atualizar prioridade</p>
  
                    <div className="ticket-action-group d-flex gap-2 mb-3">
                        <button 
                            className="btn btn-outline-secondary btn-sm"
                            type="button"
                            disabled={priorityUpdating}
                            onClick={() => handleUpdatePriority("LOW")}>

                                {TICKET_PRIORITY_LABELS.LOW}
                        </button>

                        <button 
                            className="btn btn-outline-secondary btn-sm"
                            type="button"
                            disabled={priorityUpdating}
                            onClick={() => handleUpdatePriority("MEDIUM")}>

                                {TICKET_PRIORITY_LABELS.MEDIUM}
                        </button>

                        <button 
                            className="btn btn-outline-secondary btn-sm"
                            type="button"
                            disabled={priorityUpdating}
                            onClick={() => handleUpdatePriority("HIGH")}>

                                {TICKET_PRIORITY_LABELS.HIGH}
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    let content

    if (loading) {
        content = <p>Carregando ticket...</p>
    } else if (error) {
        content = (
            <div className="alert alert-danger" role="alert">
                {error}
            </div>
        )
    } else if (!ticket) {
        content = (
            <div className="alert alert-warning" role="alert">
                Ticket não encontrado.
            </div>
        )
    } else {
        content = (
            <div className="card shadow-sm">
                <div className="card-body">
                    <h2 className="h4">{ticket.title}</h2>
                    <p className="text-secondary">{ticket.description}</p>

                    <p>Status: {TICKET_STATUS_LABELS[ticket.status]}</p>
                    <p>Prioridade: {TICKET_PRIORITY_LABELS[ticket.priority]}</p>
                    <p>Criado em: {new Date(ticket.createdAt).toLocaleString("pt-BR")}</p>

                    {manageTicketContent}

                    <hr />
                    <h3 className="h5">Comentários</h3>

                    <form className="mb-3" onSubmit={handleCreateComment}>
                        {createCommentErrorContent}

                        <label className="form-label" htmlFor="comment">
                            Novo comentário
                        </label>

                        <textarea
                            className="form-control mb-2"
                            id="comment"
                            value={commentContent}
                            onChange={(event) => setCommentContent(event.target.value)}
                            required
                        />

                        <button className="btn btn-primary btn-sm" type="submit" disabled={creatingComment}>
                            {creatingComment ? "Comentando..." : "Comentar"}
                        </button>
                    </form>

                    {commentsContent}
                </div>
            </div>
        )
    }

    return (
        <main className="container py-4">
            <Link className="btn btn-outline-secondary btn-sm mb-3" to="/tickets">
                Voltar
            </Link>

            {content}
        </main>
    )
}
