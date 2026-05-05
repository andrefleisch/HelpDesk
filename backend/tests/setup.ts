import {prisma} from "../src/prisma/client"

// função para limpar somente os usuários criados pelos testes de auth
async function deleteAuthTestUsers() {
    await prisma.user.deleteMany({
        where: {
            email: {
                startsWith: "test-auth-"
            }
        }
    })
}

beforeEach(async () => {
    await deleteAuthTestUsers()
})

afterAll(async () => {
    await deleteAuthTestUsers()
    await prisma.$disconnect()
})
