import Knex from 'knex'

import { Options, Page, Connection } from './constants'
import { paginate as doPaginate } from './paginate'

export * from './constants'

export const paginate = <OrderType, NodeType>({
  config,
  knex,
  prisma,
  table,
  qb,
  page,
  options,
}: {
  config?: Knex.Config
  knex?: any
  prisma?: any
  table?: string
  qb?: (qb: Knex.QueryBuilder) => Knex.QueryBuilder
  page?: Page<OrderType>
  options?: Options
}): Promise<Connection<NodeType>> => {
  let runQuery
  if (knex) {
    runQuery = (sql: string) => knex.raw(sql)
  } else {
    knex = Knex(config)
    if (prisma) {
      runQuery = (sql: string) => prisma.$queryRaw(sql)
    } else {
      throw new Error('DB enbgine instance is requried')
    }
  }

  let queryBuilder
  if (qb) {
    queryBuilder = qb(knex)
  } else if (table) {
    queryBuilder = knex(table)
  } else {
    throw new Error('Query builder or table name is required')
  }

  return doPaginate<OrderType, NodeType>(runQuery, queryBuilder, page, options)
}
