// função para buscar o secret usado para assinar e validar tokens JWT
export function getAuthSecret(): string {
    const secret = process.env.AUTH_SECRET

    // impede a aplicação de usar uma chave padrão insegura sem perceber
    if (!secret) {
        throw new Error("AUTH_SECRET não configurado")
    }

    return secret
}
