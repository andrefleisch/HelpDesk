export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CANCELED"

export type TicketPriority = "LOW" | "MEDIUM" | "HIGH"

export type Ticket = {
    id: string
    title: string
    description: string
    status: TicketStatus
    priority: TicketPriority
    createdById: string
    assignedToId: string | null
    createdAt: string
    updatedAt: string
}

export type PaginationMeta = {
    page: number
    limit: number
    total: number
    totalPages: number
}

export type PaginatedTicketsResponse = {
    data: Ticket[]
    meta: PaginationMeta
}

export type CreateTicketRequest = {
    title: string
    description: string
    priority: TicketPriority
    assignedToId?: string | null
  }

  export type UpdatableTicketStatus = Exclude<TicketStatus, "CANCELED">

  export type UpdateTicketStatusRequest = {
    status: UpdatableTicketStatus
  }

  export type UpdateTicketPriorityRequest = {
    priority: TicketPriority
  }