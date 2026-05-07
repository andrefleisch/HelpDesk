import {Router} from "express"
import {authMiddleware} from "../../middlewares/auth.middleware"
import {roleMiddleware} from "../../middlewares/role.middleware"
import { TicketController } from "./ticket.controller"

const ticketRoutes = Router()
const ticketController = new TicketController()

// middleware para proteger as rotas de tickets, verificando se o usuário está autenticado
ticketRoutes.use(authMiddleware)

ticketRoutes.post("/", (req, res, next) => ticketController.create(req, res, next))
ticketRoutes.get("/", (req, res, next) => ticketController.findMany(req, res, next))
ticketRoutes.get("/:id", (req, res, next) => ticketController.findById(req, res, next))
ticketRoutes.patch("/:id/status", roleMiddleware(["AGENT", "ADMIN"]), (req, res, next) => ticketController.updateStatus(req, res, next))
ticketRoutes.patch("/:id/cancel", (req, res, next) => ticketController.cancel(req, res, next))
ticketRoutes.patch("/:id/priority", roleMiddleware(["AGENT", "ADMIN"]), (req, res, next) => ticketController.updatePriority(req, res, next))
ticketRoutes.patch("/:id/assign", roleMiddleware(["AGENT", "ADMIN"]), (req, res, next) => ticketController.assignResponsible(req, res, next))

export{ticketRoutes}
