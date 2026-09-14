import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createTicket, getTickets } from "../services/ticketService";
import type { PaginationMeta, Ticket, TicketPriority } from "../types/ticket";

export function TicketsPage() {
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [meta, setMeta] = useState<PaginationMeta | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [priority, setPriority] = useState<TicketPriority>("MEDIUM")
    const [creating, setCreating] = useState(false)
    const [createError, setCreateError] = useState("")

    async function loadTickets() {
        try {
            setLoading(true)
            setError("")

            const response = await getTickets()

            setTickets(response.data)
            setMeta(response.meta)
        } catch {
            setError("Nao foi possivel carregar os tickets")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadTickets()
    }, [])

    async function handleCreateTicket(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setCreating(true)
        setCreateError("")

        try {
            await createTicket({
                title,
                description,
                priority
            })

            setTitle("")
            setDescription("")
            setPriority("MEDIUM")
            await loadTickets()
        } catch {
            setCreateError("Não foi possível criar o ticket")
        } finally {
            setCreating(false)
        }
    }

    let content
    let createErrorContent = null

    if (createError) {
        createErrorContent = (
            <div className="alert alert-danger" role="alert">
                {createError}
            </div>
        )
    }

    if (loading) {
        content = <p>Carregando tickets...</p>
    } else if (error) {
        content = (
            <div className="alert alert-danger" role="alert">
                {error}
            </div>
        )
    } else if (tickets.length === 0) {
        content = (
            <div className="alert alert-info" role="alert">
                Nenhum ticket encontrado.
            </div>
        )
    } else {
        content = (
            <div className="card shadow-sm">
                <div className="card-body">
                    <p>
                        Total de tickets: {meta?.total ?? tickets.length}
                    </p>

                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead>
                                <tr>
                                    <th>Titulo</th>
                                    <th>Status</th>
                                    <th>Prioridade</th>
                                    <th>Criado em</th>
                                </tr>
                            </thead>

                            <tbody>
                                {tickets.map((ticket) => (
                                    <tr key={ticket.id}>
                                        <td>
                                            <Link to={`/tickets/${ticket.id}`}>
                                                {ticket.title}
                                            </Link>
                                        </td>
                                        <td>{ticket.status}</td>
                                        <td>{ticket.priority}</td>
                                        <td>{new Date(ticket.createdAt).toLocaleDateString("pt-BR")}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <main className="container py-4">
            <h1 className="h3 mb-3">Tickets</h1>

            <form className="card shadow-sm mb-4" onSubmit={handleCreateTicket}>
                <div className="card-body">
                    <h2 className="h5 mb-3">Novo ticket</h2>

                    {createErrorContent}

                    <div className="mb-3">
                        <label className="form-label" htmlFor="title">
                            Titulo
                        </label>
                        <input
                            className="form-control"
                            id="title"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label" htmlFor="description">
                            Descricao
                        </label>
                        <textarea
                            className="form-control"
                            id="description"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label" htmlFor="priority">
                            Prioridade
                        </label>
                        <select
                            className="form-select"
                            id="priority"
                            value={priority}
                            onChange={(event) => setPriority(event.target.value as TicketPriority)}
                        >
                            <option value="LOW">LOW</option>
                            <option value="MEDIUM">MEDIUM</option>
                            <option value="HIGH">HIGH</option>
                        </select>
                    </div>

                    <button className="btn btn-primary" type="submit" disabled={creating}>
                        {creating ? "Criando..." : "Criar ticket"}
                    </button>
                </div>
            </form>

            {content}
        </main>
    )
}
