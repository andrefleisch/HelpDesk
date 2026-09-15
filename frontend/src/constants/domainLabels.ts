import type { UserRole } from "../types/auth"
import type { TicketPriority, TicketStatus } from "../types/ticket"

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  USER: "Usuário",
  AGENT: "Agente",
  ADMIN: "Administrador",
}

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: "Aberto",
  IN_PROGRESS: "Em progresso",
  RESOLVED: "Resolvido",
  CANCELED: "Cancelado",
}

export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
}
