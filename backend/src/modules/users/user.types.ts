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

// igual UserRecord mas com passwordHash, pois esse type será usado para colocar a senha ja criptografada no banco
export type CreateUserInput = {
    name: string;
    email: string;
    passwordHash: string;
}

// type User é o que será retornado pro cliente, sem o passwordHash
export type User = {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}