import type {NextFunction, Request, Response} from "express"
import type {UserRole} from "../modules/users/user.types"

// middleware para proteger rotas, verificando se o usuário autenticado tem um dos papéis permitidos
export function roleMiddleware(allowedRoles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        // verifica se existe usuário autenticado antes de verificar o papel dele
        if (!req.user) {
            return res.status(401).json({
                message: "Usuário não autenticado"
            })
        }

        // verifica se o papel do usuário está na lista de papéis permitidos para a rota
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Usuário não autorizado"
            })
        }

        // libera a requisição para chegar no controller se o usuário tiver permissão
        return next()
    }
}
