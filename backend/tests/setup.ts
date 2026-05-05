import {prisma} from "../src/prisma/client"

// função para limpar somente os dados criados pelos testes automatizados
async function deleteTestData() {
    await prisma.comment.deleteMany({
        where: {
            OR: [
                {
                    author: {
                        email: {
                            startsWith: "test-"
                        }
                    }
                },
                {
                    ticket: {
                        createdBy: {
                            email: {
                                startsWith: "test-"
                            }
                        }
                    }
                }
            ]
        }
    })

    await prisma.ticket.deleteMany({
        where: {
            OR: [
                {
                    createdBy: {
                        email: {
                            startsWith: "test-"
                        }
                    }
                },
                {
                    assignedTo: {
                        email: {
                            startsWith: "test-"
                        }
                    }
                }
            ]
        }
    })

    await prisma.user.deleteMany({
        where: {
            email: {
                startsWith: "test-"
            }
        }
    })
}

beforeEach(async () => {
    await deleteTestData()
})

afterAll(async () => {
    await deleteTestData()
    await prisma.$disconnect()
})
