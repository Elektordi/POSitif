import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";

import { prisma } from "./common";

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
            password: bcrypt.hashSync(password, bcrypt.genSaltSync()),
            superadmin: true
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
