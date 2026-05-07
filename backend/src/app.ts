import express from "express"
import cors from "cors"
import swaggerUi from "swagger-ui-express"
import YAML from "yamljs"
import {authRoutes} from "./modules/auth/auth.routes"
import {commentRoutes} from "./modules/comments/comment.routes"
import {ticketRoutes} from "./modules/tickets/ticket.routes"
import {userRoutes} from "./modules/users/user.routes"
import {errorMiddleware} from "./middlewares/error.middleware"

export const app = express()
const swaggerDocument = YAML.load("./src/docs/openapi.yaml")

app.use(cors())
app.use(express.json())

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.use("/auth", authRoutes)
app.use("/users", userRoutes)
app.use("/tickets", ticketRoutes)
app.use("/comments", commentRoutes)

app.get("/health", (_req, res) => {
    res.status(200).json({message: "API Funcionando"})
})

app.use(errorMiddleware)
