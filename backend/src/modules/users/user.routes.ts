import {Router} from "express"
import {authMiddleware} from "../../middlewares/auth.middleware"
import {roleMiddleware} from "../../middlewares/role.middleware"
import { UserController } from "./user.controller"

const userRoutes = Router()
const userController = new UserController()

// middleware para proteger as rotas de usuários, permitindo acesso apenas para admin
userRoutes.use(authMiddleware)
userRoutes.use(roleMiddleware(["ADMIN"]))

userRoutes.post("/", (req, res, next) => userController.create(req, res, next))
userRoutes.get("/", (req, res, next) => userController.findMany(req, res, next))
userRoutes.get("/:id", (req, res, next) => userController.findById(req, res, next))

export {userRoutes}
