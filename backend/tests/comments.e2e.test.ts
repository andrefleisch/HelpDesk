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

// função para criar ticket direto no banco antes de testar comentários
async function createTestTicket(createdById: string) {
    return prisma.ticket.create({
        data: {
            title: "Ticket para comentário",
            description: "Ticket criado para testar comentários",
            priority: "MEDIUM",
            createdById
        }
    })
}

describe("Comments HTTP", () => {
    it("deve criar comentário autenticado em um ticket existente", async () => {
        const user = await createTestUser("USER", "test-comments-author@email.com")
        const token = generateTestToken(user)
        const ticket = await createTestTicket(user.id)

        const response = await request(app)
            .post(`/comments/${ticket.id}/comments`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                content: "Comentário de teste"
            })

        expect(response.status).toBe(201)
        expect(response.body).toMatchObject({
            content: "Comentário de teste",
            ticketId: ticket.id,
            authorId: user.id
        })
    })

    it("deve ignorar authorId enviado no body e usar o usuário do token", async () => {
        const user = await createTestUser("USER", "test-comments-token-author@email.com")
        const anotherUser = await createTestUser("USER", "test-comments-fake-author@email.com")
        const token = generateTestToken(user)
        const ticket = await createTestTicket(user.id)

        const response = await request(app)
            .post(`/comments/${ticket.id}/comments`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                content: "Comentário com autor vindo do token",
                authorId: anotherUser.id
            })

        expect(response.status).toBe(201)
        expect(response.body.authorId).toBe(user.id)
        expect(response.body.authorId).not.toBe(anotherUser.id)
    })

    it("deve bloquear criação de comentário sem token", async () => {
        const user = await createTestUser("USER", "test-comments-no-token-owner@email.com")
        const ticket = await createTestTicket(user.id)

        const response = await request(app)
            .post(`/comments/${ticket.id}/comments`)
            .send({
                content: "Comentário sem token"
            })

        expect(response.status).toBe(401)
        expect(response.body).toEqual({
            message: "Token não enviado"
        })
    })

    it("deve retornar 404 ao comentar em ticket inexistente", async () => {
        const user = await createTestUser("USER", "test-comments-missing-ticket@email.com")
        const token = generateTestToken(user)

        const response = await request(app)
            .post("/comments/ticket-inexistente/comments")
            .set("Authorization", `Bearer ${token}`)
            .send({
                content: "Comentário em ticket inexistente"
            })

        expect(response.status).toBe(404)
        expect(response.body).toEqual({
            message: "Ticket não encontrado"
        })
    })

    it("deve retornar 400 ao criar comentário com content inválido", async () => {
        const user = await createTestUser("USER", "test-comments-invalid-content@email.com")
        const token = generateTestToken(user)
        const ticket = await createTestTicket(user.id)

        const response = await request(app)
            .post(`/comments/${ticket.id}/comments`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                content: ""
            })

        expect(response.status).toBe(400)
        expect(response.body.message).toBe("Dados de entrada inválidos")
        expect(response.body.errors).toHaveProperty("content")
    })

    it("deve listar comentários de um ticket existente", async () => {
        const user = await createTestUser("USER", "test-comments-list@email.com")
        const token = generateTestToken(user)
        const ticket = await createTestTicket(user.id)

        await prisma.comment.create({
            data: {
                content: "Primeiro comentário",
                ticketId: ticket.id,
                authorId: user.id
            }
        })

        const response = await request(app)
            .get(`/comments/${ticket.id}/comments`)
            .set("Authorization", `Bearer ${token}`)

        expect(response.status).toBe(200)
        expect(Array.isArray(response.body)).toBe(true)
        expect(response.body.length).toBe(1)
        expect(response.body[0]).toMatchObject({
            content: "Primeiro comentário",
            ticketId: ticket.id,
            authorId: user.id
        })
    })

    it("deve bloquear listagem de comentários sem token", async () => {
        const user = await createTestUser("USER", "test-comments-list-no-token@email.com")
        const ticket = await createTestTicket(user.id)

        const response = await request(app).get(`/comments/${ticket.id}/comments`)

        expect(response.status).toBe(401)
        expect(response.body).toEqual({
            message: "Token não enviado"
        })
    })

    it("deve retornar 404 ao listar comentários de ticket inexistente", async () => {
        const user = await createTestUser("USER", "test-comments-list-missing-ticket@email.com")
        const token = generateTestToken(user)

        const response = await request(app)
            .get("/comments/ticket-inexistente/comments")
            .set("Authorization", `Bearer ${token}`)

        expect(response.status).toBe(404)
        expect(response.body).toEqual({
            message: "Ticket não encontrado"
        })
    })
})
