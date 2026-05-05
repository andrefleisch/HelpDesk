import express from "express"
import cors from "cors"
import {authRoutes} from "./modules/auth/auth.routes"
import {commentRoutes} from "./modules/comments/comment.routes"
import {ticketRoutes} from "./modules/tickets/ticket.routes"
import {userRoutes} from "./modules/users/user.routes"

export const app = express()

app.use(cors())
app.use(express.json())

app.use("/auth", authRoutes)
app.use("/users", userRoutes)
app.use("/tickets", ticketRoutes)
app.use("/comments", commentRoutes)

app.get("/health", (_req, res) => {
    res.status(200).json({message: "API Funcionando"})
})



