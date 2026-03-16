// criar user
export type CreateUserBody = {
    name: string;
    email: string;
    password: string;
}

export type UserParams = {
    id: string;
}

// sera apenas salvo no banco, não sera a resposta pro cliente
// (as vezes record pode ser a resposta pro cliente, não nesse caso pois nao será retornado o passwordHash pro cliente)
export type UserRecord = {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;
}

export type User = {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string
}