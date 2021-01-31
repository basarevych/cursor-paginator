import { paginate, OrderDirection } from '../src'
import { numUsers, getUsers, knex, User, UserOrder } from './knex'
import { generateCursor } from '../src/generate-cursor'
import { encodeCursor } from '../src/encode-cursor'

describe('Paginator', () => {
  const orderBy = [UserOrder.EMAIL]
  const orderDir = [OrderDirection.ASC]
  let users: User[]

  function edges(result: number[]) {
    return result
      .map((item) => users[item])
      .map((node) => ({
        node,
        cursor: expect.any(String),
      }))
  }

  function getUserCursor(index: number) {
    return encodeCursor(generateCursor({ node: users[index], pagination: { orderBy, orderDir } }))
  }

  beforeAll(async () => {
    users = await getUsers()
    console.log(users)
  })

  afterAll(async () => {
    await new Promise((resolve) => knex.destroy(resolve))
  })

  it.each`
    size | next     | prev     | result
    ${1} | ${true}  | ${false} | ${[0]}
    ${2} | ${true}  | ${false} | ${[0, 1]}
    ${3} | ${true}  | ${false} | ${[0, 1, 2]}
    ${4} | ${true}  | ${false} | ${[0, 1, 2, 3]}
    ${5} | ${true}  | ${false} | ${[0, 1, 2, 3, 4]}
    ${6} | ${false} | ${false} | ${[0, 1, 2, 3, 4, 5]}
  `('first page (size: $size)', async ({ size, cursor, next, prev, result }) => {
    const list = await paginate(
      knex('users'),
      {},
      {
        first: size,
        orderBy,
        orderDir,
      },
    )

    expect(list.edges.length).toBe(result.length)
    expect(list).toEqual({
      totalCount: numUsers,
      pageInfo: {
        hasNextPage: next,
        hasPreviousPage: prev,
        startCursor: list.edges.length ? list.edges[0].cursor : null,
        endCursor: list.edges.length ? list.edges[list.edges.length - 1].cursor : null,
      },
      edges: edges(result),
    })
  })

  it.each`
    size | cursor | next     | prev    | result
    ${1} | ${0}   | ${true}  | ${true} | ${[1]}
    ${2} | ${1}   | ${true}  | ${true} | ${[2, 3]}
    ${3} | ${2}   | ${false} | ${true} | ${[3, 4, 5]}
    ${4} | ${3}   | ${false} | ${true} | ${[4, 5]}
    ${5} | ${4}   | ${false} | ${true} | ${[5]}
    ${6} | ${5}   | ${false} | ${true} | ${[]}
  `('second page (size: $size)', async ({ size, cursor, next, prev, result }) => {
    const list = await paginate(
      knex('users'),
      {},
      {
        first: size,
        after: getUserCursor(cursor),
        orderBy,
        orderDir,
      },
    )

    expect(list.edges.length).toBe(result.length)
    expect(list).toEqual({
      totalCount: numUsers,
      pageInfo: {
        hasNextPage: next,
        hasPreviousPage: prev,
        startCursor: list.edges.length ? list.edges[0].cursor : null,
        endCursor: list.edges.length ? list.edges[list.edges.length - 1].cursor : null,
      },
      edges: edges(result),
    })
  })

  it.each`
    size | cursor | next     | prev    | result
    ${1} | ${1}   | ${true}  | ${true} | ${[2]}
    ${2} | ${3}   | ${false} | ${true} | ${[4, 5]}
    ${3} | ${5}   | ${false} | ${true} | ${[]}
  `('third page (size: $size)', async ({ size, cursor, next, prev, result }) => {
    const list = await paginate(
      knex('users'),
      {},
      {
        first: size,
        after: getUserCursor(cursor),
        orderBy,
        orderDir,
      },
    )

    expect(list.edges.length).toBe(result.length)
    expect(list).toEqual({
      totalCount: numUsers,
      pageInfo: {
        hasNextPage: next,
        hasPreviousPage: prev,
        startCursor: list.edges.length ? list.edges[0].cursor : null,
        endCursor: list.edges.length ? list.edges[list.edges.length - 1].cursor : null,
      },
      edges: edges(result),
    })
  })

  it.each`
    size | next     | prev     | result
    ${1} | ${false} | ${true}  | ${[5]}
    ${2} | ${false} | ${true}  | ${[4, 5]}
    ${3} | ${false} | ${true}  | ${[3, 4, 5]}
    ${4} | ${false} | ${true}  | ${[2, 3, 4, 5]}
    ${5} | ${false} | ${true}  | ${[1, 2, 3, 4, 5]}
    ${6} | ${false} | ${false} | ${[0, 1, 2, 3, 4, 5]}
  `('reverse: third page (size: $size)', async ({ size, cursor, next, prev, result }) => {
    const list = await paginate(
      knex('users'),
      {},
      {
        last: size,
        orderBy,
        orderDir,
      },
    )

    expect(list.edges.length).toBe(result.length)
    expect(list).toEqual({
      totalCount: numUsers,
      pageInfo: {
        hasNextPage: next,
        hasPreviousPage: prev,
        startCursor: list.edges.length ? list.edges[0].cursor : null,
        endCursor: list.edges.length ? list.edges[list.edges.length - 1].cursor : null,
      },
      edges: edges(result),
    })
  })

  it.each`
    size | cursor | next    | prev     | result
    ${1} | ${5}   | ${true} | ${true}  | ${[4]}
    ${2} | ${4}   | ${true} | ${true}  | ${[2, 3]}
    ${3} | ${3}   | ${true} | ${false} | ${[0, 1, 2]}
    ${4} | ${2}   | ${true} | ${false} | ${[0, 1]}
    ${5} | ${1}   | ${true} | ${false} | ${[0]}
  `('reverse: second page (size: $size)', async ({ size, cursor, next, prev, result }) => {
    const list = await paginate(
      knex('users'),
      {},
      {
        last: size,
        before: getUserCursor(cursor),
        orderBy,
        orderDir,
      },
    )

    expect(list.edges.length).toBe(result.length)
    expect(list).toEqual({
      totalCount: numUsers,
      pageInfo: {
        hasNextPage: next,
        hasPreviousPage: prev,
        startCursor: list.edges.length ? list.edges[0].cursor : null,
        endCursor: list.edges.length ? list.edges[list.edges.length - 1].cursor : null,
      },
      edges: edges(result),
    })
  })

  it.each`
    size | cursor | next    | prev     | result
    ${1} | ${4}   | ${true} | ${true}  | ${[3]}
    ${2} | ${2}   | ${true} | ${false} | ${[0, 1]}
    ${3} | ${0}   | ${true} | ${false} | ${[]}
  `('reverse: first page (size: $size)', async ({ size, cursor, next, prev, result }) => {
    const list = await paginate(
      knex('users'),
      {},
      {
        last: size,
        before: getUserCursor(cursor),
        orderBy,
        orderDir,
      },
    )

    expect(list.edges.length).toBe(result.length)
    expect(list).toEqual({
      totalCount: numUsers,
      pageInfo: {
        hasNextPage: next,
        hasPreviousPage: prev,
        startCursor: list.edges.length ? list.edges[0].cursor : null,
        endCursor: list.edges.length ? list.edges[list.edges.length - 1].cursor : null,
      },
      edges: edges(result),
    })
  })
})
