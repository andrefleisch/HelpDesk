import request from "supertest"
import jwt from "jsonwebtoken"
import {app} from "../src/app"
import {prisma} from "../src/prisma/client"
import type {UserRole} from "../src/modules/users/user.types"


// função para criar usuário de teste direto no banco antes de chamar as rotas
async function createTestUser(role: UserRole, email: string) {
    return prisma.user.create({
        data: {
            name: `Test ${role}`,
            email,
            passwordHash: "hash",
            role
        }
    })
}

// função para gerar token de teste com o mesmo formato usado pelo AuthService
function generateTestToken(user: Awaited<ReturnType<typeof createTestUser>>) {
    const secret = process.env.AUTH_SECRET || "test-auth-secret"

    return jwt.sign({
        email: user.email,
        name: user.name,
        role: user.role
    }, secret, {
        subject: user.id,
        expiresIn: "1d"
    })
}

// função para criar ticket direto no banco antes de testar rotas de busca, filtros e atualização
async function createTestTicket(
    createdById: string,
    status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CANCELED" = "OPEN",
    priority: "LOW" | "MEDIUM" | "HIGH" = "MEDIUM",
    assignedToId?: string | null
) {
    return prisma.ticket.create({
        data: {
            title: "Ticket de teste",
            description: "Ticket criado para teste automatizado",
            status,
            priority,
            createdById,
            assignedToId: assignedToId ?? null
        }
    })
}

describe("Tickets HTTP", () => {
    it("deve criar ticket autenticado usando o usuário do token como createdById", async () => {
        const user = await createTestUser("USER", "test-ticket-create@email.com")
        const token = generateTestToken(user)

        const response = await request(app)
            .post("/tickets")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Problema no notebook",
                description: "Notebook não liga",
                priority: "HIGH"
            })

        expect(response.status).toBe(201)
        expect(response.body).toMatchObject({
            title: "Problema no notebook",
            description: "Notebook não liga",
            priority: "HIGH",
            status: "OPEN",
            createdById: user.id,
            assignedToId: null
        })
    })

    it("deve ignorar createdById enviado no body e usar o id do token", async () => {
        const user = await createTestUser("USER", "test-ticket-token-owner@email.com")
        const anotherUser = await createTestUser("USER", "test-ticket-fake-owner@email.com")
        const token = generateTestToken(user)

        const response = await request(app)
            .post("/tickets")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Ticket com dono vindo do token",
                description: "Mesmo mandando outro createdById, o controller deve usar req.user.id",
                priority: "LOW",
                createdById: anotherUser.id
            })

        expect(response.status).toBe(201)
        expect(response.body.createdById).toBe(user.id)
        expect(response.body.createdById).not.toBe(anotherUser.id)
    })

    it("deve bloquear criação de ticket sem token", async () => {
        const response = await request(app)
            .post("/tickets")
            .send({
                title: "Ticket sem token",
                description: "Esse ticket não deve ser criado",
                priority: "LOW"
            })

        expect(response.status).toBe(401)
        expect(response.body).toEqual({
            message: "Token não enviado"
        })
    })

    it("deve listar tickets quando o usuário estiver autenticado", async () => {
        const user = await createTestUser("USER", "test-ticket-list@email.com")
        const token = generateTestToken(user)
        await createTestTicket(user.id)

        const response = await request(app)
            .get("/tickets")
            .set("Authorization", `Bearer ${token}`)

        expect(response.status).toBe(200)
        expect(Array.isArray(response.body.data)).toBe(true)
        expect(response.body.data.length).toBeGreaterThanOrEqual(1)
        expect(response.body.meta).toMatchObject({
            page: 1,
            limit: 10
        })
        expect(response.body.meta.total).toBeGreaterThanOrEqual(1)
        expect(response.body.meta.totalPages).toBeGreaterThanOrEqual(1)
    })

    it("deve listar apenas tickets do próprio usuário comum", async () => {
        const user = await createTestUser("USER", "test-ticket-list-owner@email.com")
        const anotherUser = await createTestUser("USER", "test-ticket-list-another-owner@email.com")
        const token = generateTestToken(user)
        const ownTicket = await createTestTicket(user.id)
        const anotherTicket = await createTestTicket(anotherUser.id)

        const response = await request(app)
            .get(`/tickets?createdById=${anotherUser.id}`)
            .set("Authorization", `Bearer ${token}`)

        expect(response.status).toBe(200)
        expect(response.body.data).toHaveLength(1)
        expect(response.body.data[0].id).toBe(ownTicket.id)
        expect(response.body.data[0].id).not.toBe(anotherTicket.id)
        expect(response.body.meta.total).toBe(1)
    })

    it("deve filtrar tickets por status e prioridade", async () => {
        const user = await createTestUser("USER", "test-ticket-filter@email.com")
        const token = generateTestToken(user)
        const filteredTicket = await createTestTicket(user.id, "OPEN", "HIGH")

        await createTestTicket(user.id, "RESOLVED", "HIGH")
        await createTestTicket(user.id, "OPEN", "LOW")

        const response = await request(app)
            .get(`/tickets?status=OPEN&priority=HIGH&createdById=${user.id}`)
            .set("Authorization", `Bearer ${token}`)

        expect(response.status).toBe(200)
        expect(Array.isArray(response.body.data)).toBe(true)
        expect(response.body.data).toHaveLength(1)
        expect(response.body.data[0]).toMatchObject({
            id: filteredTicket.id,
            status: "OPEN",
            priority: "HIGH"
        })
        expect(response.body.meta).toMatchObject({
            page: 1,
            limit: 10,
            total: 1,
            totalPages: 1
        })
    })

    it("deve paginar tickets usando page e limit", async () => {
        const user = await createTestUser("USER", "test-ticket-pagination@email.com")
        const token = generateTestToken(user)

        await createTestTicket(user.id)
        await createTestTicket(user.id)
        await createTestTicket(user.id)

        const response = await request(app)
            .get(`/tickets?createdById=${user.id}&page=2&limit=2`)
            .set("Authorization", `Bearer ${token}`)

        expect(response.status).toBe(200)
        expect(Array.isArray(response.body.data)).toBe(true)
        expect(response.body.data).toHaveLength(1)
        expect(response.body.meta).toEqual({
            page: 2,
            limit: 2,
            total: 3,
            totalPages: 2
        })
    })

    it("deve retornar 400 quando query params de paginação forem inválidos", async () => {
        const user = await createTestUser("USER", "test-ticket-invalid-pagination@email.com")
        const token = generateTestToken(user)

        const response = await request(app)
            .get("/tickets?page=0&limit=101")
            .set("Authorization", `Bearer ${token}`)

        expect(response.status).toBe(400)
        expect(response.body.message).toBe("Dados de entrada inválidos")
        expect(response.body.errors).toHaveProperty("page")
        expect(response.body.errors).toHaveProperty("limit")
    })

    it("deve buscar ticket existente por id", async () => {
        const user = await createTestUser("USER", "test-ticket-find@email.com")
        const token = generateTestToken(user)
        const ticket = await createTestTicket(user.id)

        const response = await request(app)
            .get(`/tickets/${ticket.id}`)
            .set("Authorization", `Bearer ${token}`)

        expect(response.status).toBe(200)
        expect(response.body).toMatchObject({
            id: ticket.id,
            title: ticket.title,
            createdById: user.id
        })
    })

    it("deve retornar 404 ao buscar ticket inexistente", async () => {
        const user = await createTestUser("USER", "test-ticket-not-found@email.com")
        const token = generateTestToken(user)

        const response = await request(app)
            .get("/tickets/ticket-inexistente")
            .set("Authorization", `Bearer ${token}`)

        expect(response.status).toBe(404)
        expect(response.body).toEqual({
            message: "Ticket não encontrado"
        })
    })

    it("deve bloquear usuário comum tentando atualizar status", async () => {
        const user = await createTestUser("USER", "test-ticket-user-status@email.com")
        const token = generateTestToken(user)
        const ticket = await createTestTicket(user.id)

        const response = await request(app)
            .patch(`/tickets/${ticket.id}/status`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                status: "IN_PROGRESS"
            })

        expect(response.status).toBe(403)
        expect(response.body).toEqual({
            message: "Usuário não autorizado"
        })
    })

    it("deve permitir agente atualizar status do ticket", async () => {
        const user = await createTestUser("USER", "test-ticket-owner-status@email.com")
        const agent = await createTestUser("AGENT", "test-ticket-agent-status@email.com")
        const token = generateTestToken(agent)
        const ticket = await createTestTicket(user.id)

        const response = await request(app)
            .patch(`/tickets/${ticket.id}/status`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                status: "IN_PROGRESS"
            })

        expect(response.status).toBe(200)
        expect(response.body).toMatchObject({
            id: ticket.id,
            status: "IN_PROGRESS"
        })
    })

    it("deve retornar 404 quando agente tentar atualizar status de ticket inexistente", async () => {
        const agent = await createTestUser("AGENT", "test-ticket-agent-missing@email.com")
        const token = generateTestToken(agent)

        const response = await request(app)
            .patch("/tickets/ticket-inexistente/status")
            .set("Authorization", `Bearer ${token}`)
            .send({
                status: "IN_PROGRESS"
            })

        expect(response.status).toBe(404)
        expect(response.body).toEqual({
            message: "Ticket não encontrado"
        })
    })

    it("deve bloquear CANCELED na rota genérica de atualização de status", async () => {
        const user = await createTestUser("USER", "test-ticket-owner-status-canceled@email.com")
        const agent = await createTestUser("AGENT", "test-ticket-agent-status-canceled@email.com")
        const token = generateTestToken(agent)
        const ticket = await createTestTicket(user.id)

        const response = await request(app)
            .patch(`/tickets/${ticket.id}/status`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                status: "CANCELED"
            })

        expect(response.status).toBe(400)
        expect(response.body.message).toBe("Dados de entrada inválidos")
        expect(response.body.errors).toHaveProperty("status")
    })

    it("deve permitir agente atualizar prioridade do ticket", async () => {
        const user = await createTestUser("USER", "test-ticket-owner-priority@email.com")
        const agent = await createTestUser("AGENT", "test-ticket-agent-priority@email.com")
        const token = generateTestToken(agent)
        const ticket = await createTestTicket(user.id)

        const response = await request(app)
            .patch(`/tickets/${ticket.id}/priority`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                priority: "HIGH"
            })

        expect(response.status).toBe(200)
        expect(response.body).toMatchObject({
            id: ticket.id,
            priority: "HIGH"
        })
    })

    it("deve retornar 400 ao tentar atualizar prioridade com valor inválido", async () => {
        const user = await createTestUser("USER", "test-ticket-owner-invalid-priority@email.com")
        const agent = await createTestUser("AGENT", "test-ticket-agent-invalid-priority@email.com")
        const token = generateTestToken(agent)
        const ticket = await createTestTicket(user.id)

        const response = await request(app)
            .patch(`/tickets/${ticket.id}/priority`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                priority: "URGENT"
            })

        expect(response.status).toBe(400)
        expect(response.body.message).toBe("Dados de entrada inválidos")
        expect(response.body.errors).toHaveProperty("priority")
    })

    it("deve permitir agente atribuir responsável ao ticket", async () => {
        const user = await createTestUser("USER", "test-ticket-owner-assign@email.com")
        const agent = await createTestUser("AGENT", "test-ticket-agent-assign@email.com")
        const responsible = await createTestUser("AGENT", "test-ticket-responsible@email.com")
        const token = generateTestToken(agent)
        const ticket = await createTestTicket(user.id)

        const response = await request(app)
            .patch(`/tickets/${ticket.id}/assign`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                assignedToId: responsible.id
            })

        expect(response.status).toBe(200)
        expect(response.body).toMatchObject({
            id: ticket.id,
            assignedToId: responsible.id
        })
    })

    it("deve retornar 404 ao atribuir responsável inexistente", async () => {
        const user = await createTestUser("USER", "test-ticket-owner-invalid-assign@email.com")
        const agent = await createTestUser("AGENT", "test-ticket-agent-invalid-assign@email.com")
        const token = generateTestToken(agent)
        const ticket = await createTestTicket(user.id)

        const response = await request(app)
            .patch(`/tickets/${ticket.id}/assign`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                assignedToId: "usuario-inexistente"
            })

        expect(response.status).toBe(404)
        expect(response.body).toEqual({
            message: "Usuário atribuído ao ticket não encontrado"
        })
    })

    it("deve permitir usuário cancelar ticket criado por ele", async () => {
        const user = await createTestUser("USER", "test-ticket-cancel-owner@email.com")
        const ticket = await createTestTicket(user.id)
        const token = generateTestToken(user)

        const response = await request(app)
            .patch(`/tickets/${ticket.id}/cancel`)
            .set("Authorization", `Bearer ${token}`)
        
        expect(response.status).toBe(200)
        expect(response.body).toMatchObject({
            id: ticket.id,
            status: "CANCELED",
            createdById: user.id
        })
    })

    it("deve permitir agente cancelar qualquer ticket", async () => {
        const user = await createTestUser("USER", "test-ticket-cancel-user@email.com")
        const ticket = await createTestTicket(user.id)
        const agent = await createTestUser("AGENT", "test-ticket-cancel-agent@email.com")
        const token = generateTestToken(agent)

        const response = await request(app)
            .patch(`/tickets/${ticket.id}/cancel`)
            .set("Authorization", `Bearer ${token}`)

        expect(response.status).toBe(200)
        expect(response.body).toMatchObject({
            id: ticket.id,
            status: "CANCELED",
            createdById: user.id
        })
    })

    it("deve permitir admin cancelar qualquer ticket", async () => {
        const user = await createTestUser("USER", "test-ticket-cancel-admin-user@email.com")
        const ticket = await createTestTicket(user.id)
        const admin = await createTestUser("ADMIN", "test-ticket-cancel-admin@email.com")
        const token = generateTestToken(admin)

        const response = await request(app)
            .patch(`/tickets/${ticket.id}/cancel`)
            .set("Authorization", `Bearer ${token}`)

        expect(response.status).toBe(200)
        expect(response.body).toMatchObject({
            id: ticket.id,
            status: "CANCELED",
            createdById: user.id
        })
    })

    it("deve bloquear usuário tentando cancelar ticket de outro usuário", async () => {
        const owner = await createTestUser("USER", "test-ticket-cancel-owner-other@email.com")
        const anotherUser = await createTestUser("USER", "test-ticket-cancel-another-user@email.com")
        const ticket = await createTestTicket(owner.id)
        const token = generateTestToken(anotherUser)

        const response = await request(app)
            .patch(`/tickets/${ticket.id}/cancel`)
            .set("Authorization", `Bearer ${token}`)

        expect(response.status).toBe(403)
        expect(response.body).toEqual({
            message: "Usuário não autorizado"
        })
    })

    it("deve retornar 404 ao cancelar ticket inexistente", async () => {
        const user = await createTestUser("USER", "test-ticket-cancel-not-found@email.com")
        const token = generateTestToken(user)

        const response = await request(app)
            .patch("/tickets/ticket-inexistente/cancel")
            .set("Authorization", `Bearer ${token}`)

        expect(response.status).toBe(404)
        expect(response.body).toEqual({
            message: "Ticket não encontrado"
        })
    })

    it("deve retornar 409 ao cancelar ticket resolvido", async () => {
        const user = await createTestUser("USER", "test-ticket-cancel-resolved@email.com")
        const ticket = await createTestTicket(user.id, "RESOLVED")
        const token = generateTestToken(user)

        const response = await request(app)
            .patch(`/tickets/${ticket.id}/cancel`)
            .set("Authorization", `Bearer ${token}`)

        expect(response.status).toBe(409)
        expect(response.body).toEqual({
            message: "Não pode cancelar ticket já resolvido"
        })
    })

    it("deve retornar 409 ao cancelar ticket já cancelado", async () => {
        const user = await createTestUser("USER", "test-ticket-cancel-already-canceled@email.com")
        const ticket = await createTestTicket(user.id, "CANCELED")
        const token = generateTestToken(user)

        const response = await request(app)
            .patch(`/tickets/${ticket.id}/cancel`)
            .set("Authorization", `Bearer ${token}`)

        expect(response.status).toBe(409)
        expect(response.body).toEqual({
            message: "Não pode cancelar ticket já cancelado"
        })
    })

    it("deve bloquear cancelamento sem token", async () => {
        const user = await createTestUser("USER", "test-ticket-cancel-no-token@email.com")
        const ticket = await createTestTicket(user.id)

        const response = await request(app)
            .patch(`/tickets/${ticket.id}/cancel`)

        expect(response.status).toBe(401)
        expect(response.body).toEqual({
            message: "Token não enviado"
        })
    })
})
