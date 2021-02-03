import Knex from 'knex'

import { Options, Pagination, PaginatedData } from './constants'
import { paginate as doPaginate } from './paginate'

export * from './constants'

export const paginate = <OrderType, NodeType>({
  knexConfig,
  knex,
  prisma,
  table,
  qb,
  pagination,
  options,
}: {
  knexConfig?: Knex.Config
  knex?: any
  prisma?: any
  table?: string
  qb?: (qb: Knex.QueryBuilder) => Knex.QueryBuilder
  pagination?: Pagination<OrderType>
  options?: Options
}): Promise<PaginatedData<NodeType>> => {
  let runQuery
  if (knex) {
    runQuery = (sql: string) => knex.raw(sql)
  } else {
    knex = Knex(knexConfig)
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

  return doPaginate<OrderType, NodeType>(runQuery, queryBuilder, pagination, options)
}
