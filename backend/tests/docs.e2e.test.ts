import request from "supertest"
import {app} from "../src/app"

describe("Docs HTTP", () => {
    it("deve carregar a documentação Swagger", async () => {
        const response = await request(app).get("/docs/")

        expect(response.status).toBe(200)
        expect(response.text).toContain("Swagger UI")
    })
})
