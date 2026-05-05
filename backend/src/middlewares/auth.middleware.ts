import type {Request, Response, NextFunction} from "express"
import jwt from "jsonwebtoken"
import type {UserRole} from "../modules/users/user.types"

// dados do usuário autenticado que serão salvos na requisição
type AuthenticatedUser = {
    id: string
    email: string
    name: string
    role: UserRole
}

// middleware para proteger rotas, verificando se o token JWT enviado pelo cliente é válido
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        // pega o token enviado no header Authorization
        const authHeader = req.headers.authorization

        // verifica se o token foi enviado antes de continuar a requisição
        if (!authHeader) {
            return res.status(401).json({
                message: "Token não enviado"
            })
        }

        // separa o tipo Bearer do token enviado pelo cliente
        const [type, token] = authHeader.split(" ")

        // verifica se o token veio no formato correto antes de validar
        if (type !== "Bearer" || !token) {
            return res.status(401).json({
                message: "Formato do token inválido"
            })
        }

        // pega o secret usado para validar a assinatura do token
        const secret = process.env.AUTH_SECRET || "dev-auth-secret"

        // verifica se o token é válido, se não foi alterado e se ainda não expirou
        const decoded = jwt.verify(token, secret)

        // verifica se os dados do token estão no formato esperado antes de salvar na requisição
        if (
            typeof decoded === "string" ||
            typeof decoded.sub !== "string" ||
            typeof decoded.email !== "string" ||
            typeof decoded.name !== "string" ||
            !isUserRole(decoded.role)
        ) {
            return res.status(401).json({
                message: "Payload do token inválido"
            })
        }

        // salva os dados do usuário autenticado na requisição para controller e service usarem depois
        req.user = {
            id: decoded.sub,
            email: decoded.email,
            name: decoded.name,
            role: decoded.role
        } satisfies AuthenticatedUser

        // libera a requisição para chegar no controller da rota protegida
        return next()
    } catch (error) {
        // retorna erro quando o token estiver inválido, expirado ou alterado
        return res.status(401).json({
            message: "Token inválido ou expirado"
        })
    }
}

// função para verificar se o role recebido do token é um dos papéis aceitos pelo sistema
function isUserRole(role: unknown): role is UserRole {
    return role === "USER" || role === "AGENT" || role === "ADMIN"
}
