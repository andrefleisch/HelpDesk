import {z} from "zod"

export const createUserSchema = z.object({
    name: z.string().trim().min(1, "Nome é obrigatório"),
    email: z.string().trim().email("Email inválido"),
    password: z.string().trim().min(6, "A senha deve conter no mínimo 6 caracteres")
})

export const userParamsSchema = z.object({
    id: z.string().trim().min(1, "ID do usuário é obrigatório")
})

// para o futuro
// export const updateUserNameSchema = z.object({
//     name: z.string().trim().min(1, "Nome é obrigatório")
// })

// export const updateUserEmailSchema = z.object({
//     email: z.string().trim().email("Email inválido")
// })

// export const updateUserPasswordSchema = z.object({
//     password: z.string().trim().min(6, "A senha deve conter no mínimo 6 caracteres")
// })