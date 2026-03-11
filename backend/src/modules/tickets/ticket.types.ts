// tipos possíveis de status e prioridade dos tickets
export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

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