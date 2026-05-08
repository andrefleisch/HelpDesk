import {Router} from "express"
import {AuthController} from "./auth.controller"
import {authMiddleware} from "../../middlewares/auth.middleware"

const authRoutes = Router()
const authController = new AuthController()

authRoutes.post("/register", (req, res, next) => authController.register(req, res, next))
authRoutes.post("/login", (req, res, next) => authController.login(req, res, next))
authRoutes.get("/me", authMiddleware, (req, res) => authController.me(req, res))

export {authRoutes}
