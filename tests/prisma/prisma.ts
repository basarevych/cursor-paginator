import { PrismaClient, User } from '@prisma/client'

export { User } from '@prisma/client'

export const prisma = new PrismaClient()

export enum UserOrder {
  ID = 'id',
  EMAIL = 'email',
  NAME = 'name',
}

async function getOrCreateUser({ name, email }: User) {
  let user = await prisma.user.findUnique({ where: { email } })
  if (user) return user
  await prisma.user.create({ data: { name, email } })
  user = await prisma.user.findUnique({ where: { email } })
  if (user) return user
}

function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
}

export const numUsers = 6

export async function getUsers() {
  const data = [
    { name: 'user1', email: 'user1@example.com' },
    { name: 'user2', email: 'user2@example.com' },
    { name: 'user3', email: 'user3@example.com' },
    { name: 'user4', email: 'user4@example.com' },
    { name: 'user5', email: 'user5@example.com' },
    { name: 'user6', email: 'user6@example.com' },
  ]

  // insert in random order
  shuffleArray(data)
  const users = await Promise.all(data.map((item) => getOrCreateUser(item as User)))

  // return sorted by email
  users.sort((a, b) => a.email.localeCompare(b.email))
  return users
}
