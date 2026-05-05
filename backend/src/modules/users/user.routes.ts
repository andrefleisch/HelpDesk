import {Router} from "express"
import {authMiddleware} from "../../middlewares/auth.middleware"
import {roleMiddleware} from "../../middlewares/role.middleware"
import { UserController } from "./user.controller"

const userRoutes = Router()
const userController = new UserController()

// middleware para proteger as rotas de usuários, permitindo acesso apenas para admin
userRoutes.use(authMiddleware)
userRoutes.use(roleMiddleware(["ADMIN"]))

userRoutes.post("/", (req, res) => userController.create(req, res))
userRoutes.get("/", (req, res) => userController.findMany(req, res))
userRoutes.get("/:id", (req, res) => userController.findById(req, res))

export {userRoutes}
