import request from "supertest"
import jwt from "jsonwebtoken"
import {app} from "../src/app"

describe("Auth HTTP", () => {
    it("deve registrar um usuário comum e retornar token com role USER", async () => {
        const response = await request(app)
            .post("/auth/register")
            .send({
                name: "Test Auth User",
                email: "test-auth-register@email.com",
                password: "user123"
            })

        expect(response.status).toBe(201)
        expect(response.body.token).toEqual(expect.any(String))
        expect(response.body.user).toMatchObject({
            name: "Test Auth User",
            email: "test-auth-register@email.com",
            role: "USER"
        })
        expect(response.body.user.passwordHash).toBeUndefined()

        const decodedToken = jwt.verify(response.body.token, process.env.AUTH_SECRET || "test-auth-secret") as jwt.JwtPayload

        expect(decodedToken.sub).toBe(response.body.user.id)
        expect(decodedToken.email).toBe("test-auth-register@email.com")
        expect(decodedToken.role).toBe("USER")
    })

    it("deve bloquear registro com email duplicado", async () => {
        const body = {
            name: "Test Auth Duplicate",
            email: "test-auth-duplicate@email.com",
            password: "user123"
        }

        await request(app).post("/auth/register").send(body)

        const response = await request(app).post("/auth/register").send(body)

        expect(response.status).toBe(409)
        expect(response.body).toEqual({
            message: "Email já cadastrado"
        })
    })

    it("deve fazer login com email e senha corretos", async () => {
        await request(app)
            .post("/auth/register")
            .send({
                name: "Test Auth Login",
                email: "test-auth-login@email.com",
                password: "user123"
            })

        const response = await request(app)
            .post("/auth/login")
            .send({
                email: "test-auth-login@email.com",
                password: "user123"
            })

        expect(response.status).toBe(200)
        expect(response.body.token).toEqual(expect.any(String))
        expect(response.body.user).toMatchObject({
            email: "test-auth-login@email.com",
            role: "USER"
        })
        expect(response.body.user.passwordHash).toBeUndefined()
    })

    it("deve bloquear login com senha incorreta", async () => {
        await request(app)
            .post("/auth/register")
            .send({
                name: "Test Auth Wrong Password",
                email: "test-auth-wrong-password@email.com",
                password: "user123"
            })

        const response = await request(app)
            .post("/auth/login")
            .send({
                email: "test-auth-wrong-password@email.com",
                password: "wrong123"
            })

        expect(response.status).toBe(401)
        expect(response.body).toEqual({
            message: "Email ou senha inválidos"
        })
    })

    it("deve bloquear login com email inexistente", async () => {
        const response = await request(app)
            .post("/auth/login")
            .send({
                email: "test-auth-not-found@email.com",
                password: "user123"
            })

        expect(response.status).toBe(401)
        expect(response.body).toEqual({
            message: "Email ou senha inválidos"
        })
    })

    it("deve retornar erro de validação quando o body do registro estiver inválido", async () => {
        const response = await request(app)
            .post("/auth/register")
            .send({
                name: "T",
                email: "email-invalido",
                password: "123"
            })

        expect(response.status).toBe(400)
        expect(response.body.message).toBe("Dados de entrada inválidos")
        expect(response.body.errors).toHaveProperty("name")
        expect(response.body.errors).toHaveProperty("email")
        expect(response.body.errors).toHaveProperty("password")
    })
})
