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

describe("Users HTTP", () => {
    it("deve bloquear listagem de usuários sem token", async () => {
        const response = await request(app).get("/users")

        expect(response.status).toBe(401)
        expect(response.body).toEqual({
            message: "Token não enviado"
        })
    })

    it("deve bloquear usuário comum tentando acessar rotas de users", async () => {
        const user = await createTestUser("USER", "test-users-common@email.com")
        const token = generateTestToken(user)

        const response = await request(app)
            .get("/users")
            .set("Authorization", `Bearer ${token}`)

        expect(response.status).toBe(403)
        expect(response.body).toEqual({
            message: "Usuário não autorizado"
        })
    })

    it("deve permitir admin criar usuário com role definida", async () => {
        const admin = await createTestUser("ADMIN", "test-users-admin-create@email.com")
        const token = generateTestToken(admin)

        const response = await request(app)
            .post("/users")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Test Created Agent",
                email: "test-users-created-agent@email.com",
                password: "agent123",
                role: "AGENT"
            })

        expect(response.status).toBe(201)
        expect(response.body).toMatchObject({
            name: "Test Created Agent",
            email: "test-users-created-agent@email.com",
            role: "AGENT"
        })
        expect(response.body.passwordHash).toBeUndefined()
    })

    it("deve criar usuário comum quando admin não enviar role", async () => {
        const admin = await createTestUser("ADMIN", "test-users-admin-default-role@email.com")
        const token = generateTestToken(admin)

        const response = await request(app)
            .post("/users")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Test Default User",
                email: "test-users-default-role@email.com",
                password: "user123"
            })

        expect(response.status).toBe(201)
        expect(response.body).toMatchObject({
            name: "Test Default User",
            email: "test-users-default-role@email.com",
            role: "USER"
        })
        expect(response.body.passwordHash).toBeUndefined()
    })

    it("deve bloquear criação de usuário com email duplicado", async () => {
        const admin = await createTestUser("ADMIN", "test-users-admin-duplicate@email.com")
        const token = generateTestToken(admin)
        const body = {
            name: "Test Duplicate User",
            email: "test-users-duplicate@email.com",
            password: "user123",
            role: "USER"
        }

        await request(app)
            .post("/users")
            .set("Authorization", `Bearer ${token}`)
            .send(body)

        const response = await request(app)
            .post("/users")
            .set("Authorization", `Bearer ${token}`)
            .send(body)

        expect(response.status).toBe(409)
        expect(response.body).toEqual({
            message: "Email já cadastrado"
        })
    })

    it("deve retornar 400 ao criar usuário com body inválido", async () => {
        const admin = await createTestUser("ADMIN", "test-users-admin-invalid-body@email.com")
        const token = generateTestToken(admin)

        const response = await request(app)
            .post("/users")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "",
                email: "email-invalido",
                password: "123",
                role: "MANAGER"
            })

        expect(response.status).toBe(400)
        expect(response.body.message).toBe("Dados de entrada inválidos")
        expect(response.body.errors).toHaveProperty("name")
        expect(response.body.errors).toHaveProperty("email")
        expect(response.body.errors).toHaveProperty("password")
        expect(response.body.errors).toHaveProperty("role")
    })

    it("deve permitir admin listar usuários sem retornar passwordHash", async () => {
        const admin = await createTestUser("ADMIN", "test-users-admin-list@email.com")
        const token = generateTestToken(admin)
        await createTestUser("USER", "test-users-listed@email.com")

        const response = await request(app)
            .get("/users")
            .set("Authorization", `Bearer ${token}`)

        expect(response.status).toBe(200)
        expect(Array.isArray(response.body)).toBe(true)
        expect(response.body.length).toBeGreaterThanOrEqual(1)
        expect(response.body[0].passwordHash).toBeUndefined()
    })

    it("deve permitir admin buscar usuário por id", async () => {
        const admin = await createTestUser("ADMIN", "test-users-admin-find@email.com")
        const user = await createTestUser("USER", "test-users-find@email.com")
        const token = generateTestToken(admin)

        const response = await request(app)
            .get(`/users/${user.id}`)
            .set("Authorization", `Bearer ${token}`)

        expect(response.status).toBe(200)
        expect(response.body).toMatchObject({
            id: user.id,
            email: "test-users-find@email.com",
            role: "USER"
        })
        expect(response.body.passwordHash).toBeUndefined()
    })

    it("deve retornar 404 quando admin buscar usuário inexistente", async () => {
        const admin = await createTestUser("ADMIN", "test-users-admin-not-found@email.com")
        const token = generateTestToken(admin)

        const response = await request(app)
            .get("/users/usuario-inexistente")
            .set("Authorization", `Bearer ${token}`)

        expect(response.status).toBe(404)
        expect(response.body).toEqual({
            message: "Usuário não encontrado"
        })
    })
})
