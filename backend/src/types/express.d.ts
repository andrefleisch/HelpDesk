declare global {
    namespace Express {
        // adiciona o usuário autenticado dentro do Request do Express
        interface Request {
            user?: {
                id: string
                email: string
                name: string
                role: "USER" | "AGENT" | "ADMIN"
            }
        }
    }
}

export {}
