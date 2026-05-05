import {Router} from "express"
import {authMiddleware} from "../../middlewares/auth.middleware"
import {roleMiddleware} from "../../middlewares/role.middleware"
import { TicketController } from "./ticket.controller"

const ticketRoutes = Router()
const ticketController = new TicketController()

// middleware para proteger as rotas de tickets, verificando se o usuário está autenticado
ticketRoutes.use(authMiddleware)

ticketRoutes.post("/", (req, res) => ticketController.create(req, res))
ticketRoutes.get("/", (req, res) => ticketController.findMany(req, res))
ticketRoutes.get("/:id", (req,res) => ticketController.findById(req, res))
ticketRoutes.patch("/:id/status", roleMiddleware(["AGENT", "ADMIN"]), (req, res) => ticketController.updateStatus(req, res))
ticketRoutes.patch("/:id/priority", roleMiddleware(["AGENT", "ADMIN"]), (req, res) => ticketController.updatePriority(req, res))
ticketRoutes.patch("/:id/assign", roleMiddleware(["AGENT", "ADMIN"]), (req, res) => ticketController.assignResponsible(req, res))

export{ticketRoutes}
