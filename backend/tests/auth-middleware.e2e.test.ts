import request from "supertest"
import jwt from "jsonwebtoken"
import {app} from "../src/app"
import {prisma} from "../src/prisma/client"
import type {UserRole} from "../src/modules/users/user.types"

// função para gerar token de teste com o mesmo formato usado pelo AuthService
function generateTestToken(role: UserRole, id = `test-${role.toLowerCase()}-id`) {
    const secret = process.env.AUTH_SECRET || "test-auth-secret"

    return jwt.sign({
        email: `test-${role.toLowerCase()}@email.com`,
        name: `Test ${role}`,
        role
    }, secret, {
        subject: id,
        expiresIn: "1d"
    })
}

describe("Auth middleware HTTP", () => {
    it("deve bloquear rota protegida quando o token não for enviado", async () => {
        const response = await request(app).get("/users")

        expect(response.status).toBe(401)
        expect(response.body).toEqual({
            message: "Token não enviado"
        })
    })

    it("deve bloquear rota protegida quando o formato do header Authorization estiver inválido", async () => {
        const response = await request(app)
            .get("/users")
            .set("Authorization", "Token qualquer")

        expect(response.status).toBe(401)
        expect(response.body).toEqual({
            message: "Formato do token inválido"
        })
    })

    it("deve bloquear rota protegida quando o token estiver inválido", async () => {
        const response = await request(app)
            .get("/users")
            .set("Authorization", "Bearer token-invalido")

        expect(response.status).toBe(401)
        expect(response.body).toEqual({
            message: "Token inválido ou expirado"
        })
    })

    it("deve permitir acessar rota autenticada quando o token for válido", async () => {
        const token = generateTestToken("USER")

        const response = await request(app)
            .get("/tickets")
            .set("Authorization", `Bearer ${token}`)

        expect(response.status).toBe(200)
        expect(Array.isArray(response.body.data)).toBe(true)
        expect(response.body.meta).toMatchObject({
            page: 1,
            limit: 10
        })
    })
})

describe("Role middleware HTTP", () => {
    it("deve bloquear usuário comum tentando acessar rota de admin", async () => {
        const token = generateTestToken("USER")

        const response = await request(app)
            .get("/users")
            .set("Authorization", `Bearer ${token}`)

        expect(response.status).toBe(403)
        expect(response.body).toEqual({
            message: "Usuário não autorizado"
        })
    })

    it("deve permitir admin acessar rota de admin", async () => {
        const token = generateTestToken("ADMIN")

        const response = await request(app)
            .get("/users")
            .set("Authorization", `Bearer ${token}`)

        expect(response.status).toBe(200)
        expect(Array.isArray(response.body)).toBe(true)
    })

    it("deve permitir agente atualizar status de ticket", async () => {
        const createdByUser = await prisma.user.create({
            data: {
                name: "Test Ticket Owner",
                email: "test-ticket-owner@email.com",
                passwordHash: "hash"
            }
        })

        const ticket = await prisma.ticket.create({
            data: {
                title: "Ticket de teste",
                description: "Ticket criado para testar role de agente",
                priority: "MEDIUM",
                createdById: createdByUser.id
            }
        })

        const token = generateTestToken("AGENT")

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
})
