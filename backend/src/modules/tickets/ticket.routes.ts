import {Router} from "express"
import { TicketController } from "./ticket.controller"

const ticketRoutes = Router()
const ticketController = new TicketController()

ticketRoutes.post("/", (req, res) => ticketController.create(req, res))
ticketRoutes.get("/", (req, res) => ticketController.findMany(req, res))
ticketRoutes.get("/:id", (req,res) => ticketController.findById(req, res))
ticketRoutes.patch("/:id/status", (req, res) => ticketController.updateStatus(req, res))
ticketRoutes.patch("/:id/priority", (req, res) => ticketController.updatePriority(req, res))
ticketRoutes.patch("/:id/assign", (req, res) => ticketController.assignResponsible(req, res))

export{ticketRoutes}