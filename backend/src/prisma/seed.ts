import "dotenv/config"
import bcrypt from "bcryptjs"
import {PrismaClient} from "@prisma/client"

const prisma = new PrismaClient()

// função para criar os dados iniciais do banco, como o primeiro usuário admin
async function main() {
    const passwordHash = await bcrypt.hash("admin123", 10)

    // cria o admin se ele ainda não existir, ou atualiza os dados básicos se ele já existir
    const admin = await prisma.user.upsert({
        where: {
            email: "admin@helpdesk.com"
        },
        update: {
            name: "Admin HelpDesk",
            passwordHash,
            role: "ADMIN"
        },
        create: {
            name: "Admin HelpDesk",
            email: "admin@helpdesk.com",
            passwordHash,
            role: "ADMIN"
        }
    })

    console.log(`Admin criado ou atualizado: ${admin.email}`)
}

main()
    .catch((error) => {
        console.error("Erro ao executar seed", error)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
