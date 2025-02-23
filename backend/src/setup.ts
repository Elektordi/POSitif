import { randomBytes, hash } from "crypto";

import { prisma } from "./common.ts";

async function main() {
    const password = randomBytes(16).toString('hex')
    console.log(`Will create new admin user with password: ${password}`)
    await prisma.user.deleteMany({  // deleteMany do not raise error if entry does not exists
        where: {
            email: 'admin@localhost'
        }
    })
    const user = await prisma.user.create({
        data: {
            email: 'admin@localhost',
            password: hash("sha512", password, "base64"),
        },
    })
    console.log(user)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
