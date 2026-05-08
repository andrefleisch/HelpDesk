import request from "supertest"
import {app} from "../src/app"

describe("Docs HTTP", () => {
    it("deve carregar a documentação Swagger", async () => {
        const response = await request(app).get("/docs/")

        expect(response.status).toBe(200)
        expect(response.text).toContain("Swagger UI")
    })

    it("deve manter a documentação OpenAPI alinhada com o fluxo de cancelamento", async () => {
        const response = await request(app).get("/docs/swagger-ui-init.js")

        expect(response.status).toBe(200)
        expect(response.text).toContain("/tickets/{id}/cancel")
        expect(response.text).toContain("CANCELED")
        expect(response.text).toContain("UpdatableTicketStatus")
    })
})
