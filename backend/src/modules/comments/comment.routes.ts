import {Router} from "express"
import { CommentController } from "./comment.controller"

const commentRoutes = Router()
const commentController = new CommentController()

commentRoutes.post("/:ticketId/comments", (req, res) => commentController.create(req, res))
commentRoutes.get("/:ticketId/comments", (req, res) => commentController.findByTicketId(req, res))

export {commentRoutes}