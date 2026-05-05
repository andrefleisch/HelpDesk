import {Router} from "express"
import {AuthController} from "./auth.controller"

const authRoutes = Router()
const authController = new AuthController()

authRoutes.post("/register", (req, res, next) => authController.register(req, res, next))
authRoutes.post("/login", (req, res, next) => authController.login(req, res, next))

export {authRoutes}
