// tipos possíveis de status e prioridade dos tickets
export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CANCELED";

export type TicketPriority = "LOW" | "MEDIUM" | "HIGH";

// criar ticket
export type CreateTicketBody = {
  title: string;
  description: string;
  priority: TicketPriority;
  createdById: string;
  assignedToId?: string | null;
};

// atualizar status do ticket
export type UpdateTicketStatusBody = {
  status: TicketStatus;
};

// atualizar prioridade do ticket
export type UpdateTicketPriorityBody = {
  priority: TicketPriority;
};

// atribuir ticket a um usuário
export type AssignTicketBody = {
  assignedToId: string;
};

// resposta do ticket após criar instância
export type TicketRecord = {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdById: string;
  assignedToId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// filtros aceitos na listagem de tickets
export type ListTicketsQuery = {
  status?: TicketStatus;
  priority?: TicketPriority;
  createdById?: string;
  assignedToId?: string;
  page: number;
  limit: number;
}
// informações da paginação retornadas junto com a lista
export type PaginationMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
}

// resposta paginada da listagem de tickets
export type PaginatedTicketsResponse = {
  data: TicketRecord[];
  meta: PaginationMeta;
}