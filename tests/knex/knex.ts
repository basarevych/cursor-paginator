export const knex = require('knex')(require('./knexfile'))

export interface User {
  id: string
  email: string
  name: string
}

export enum UserOrder {
  ID = 'id',
  EMAIL = 'email',
  NAME = 'name',
}

async function getOrCreateUser({ name, email }: User) {
  let users = await knex('users').where({ email })
  if (users.length) return users[0]
  await knex('users').insert({ name, email })
  users = await knex('users').where({ email })
  if (users.length) return users[0]
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
