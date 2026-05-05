// classe para criar erros esperados da aplicação com mensagem e status http
export class AppError extends Error {
    // status http que será retornado na resposta
    statusCode: number

    // cria uma instância do erro com mensagem e status, usando 400 como padrão
    constructor(message: string, statusCode = 400) {
        super(message)
        this.statusCode = statusCode
    }
}
