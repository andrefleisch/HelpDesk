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

// função para criar ticket direto no banco antes de testar rotas de busca e atualização
async function createTestTicket(createdById: string) {
    return prisma.ticket.create({
        data: {
            title: "Ticket de teste",
            description: "Ticket criado para teste automatizado",
            priority: "MEDIUM",
            createdById
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
        expect(Array.isArray(response.body)).toBe(true)
        expect(response.body.length).toBeGreaterThanOrEqual(1)
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
})
