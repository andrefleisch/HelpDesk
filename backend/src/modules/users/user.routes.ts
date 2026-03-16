import {Router} from "express"
import { UserController } from "./user.controller"

const userRoutes = Router()
const userController = new UserController()

userRoutes.post("/", (req, res) => userController.create(req, res))
userRoutes.get("/", (req, res) => userController.findMany(req, res))
userRoutes.get("/:id", (req,res) => userController.findById(req, res))

export {userRoutes}