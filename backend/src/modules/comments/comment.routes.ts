import {Router} from "express"
import {authMiddleware} from "../../middlewares/auth.middleware"
import { CommentController } from "./comment.controller"

const commentRoutes = Router()
const commentController = new CommentController()

// middleware para proteger as rotas de comentários, verificando se o usuário está autenticado
commentRoutes.use(authMiddleware)

commentRoutes.post("/:ticketId/comments", (req, res) => commentController.create(req, res))
commentRoutes.get("/:ticketId/comments", (req, res) => commentController.findByTicketId(req, res))

export {commentRoutes}

// routes manda pra controller, controller manda pra service, service manda pra repository, repository interage com o banco de dados usando prisma, e depois volta a resposta pra controller, que retorna a resposta pro cliente
// o routes redireciona, o controller pega os dados da resposta do cliente e chama o service para validar regras de negocio, o service chama o repository para interagir com o banco de dados, e depois o controller retorna a resposta pro cliente, tratando erros e validando os dados de entrada com os schemas do zod.
