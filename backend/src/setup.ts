import { PrismaClient } from '@prisma/client'
import { randomBytes, hash } from "crypto";

const prisma = new PrismaClient()

async function main() {
  const password = randomBytes(16).toString('hex')
  console.log(`Will create new admin user with password: ${password}`)
  const user = await prisma.User.create({
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
