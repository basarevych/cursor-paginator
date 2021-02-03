export * from './constants'

import { Options, Pagination, PaginatedData } from './constants'
import { paginate } from './paginate'

export const knexPaginate = (knex: any, client: string) => <OrderType, NodeType>(
  baseTable: string,
  queryParams: any = {},
  pagination: Pagination<OrderType> = {},
  options: Options = {},
): Promise<PaginatedData<NodeType>> => {
  const Knex = require('knex')({ client, useNullAsDefault: true })
  return paginate((sql: string) => knex.raw(sql), Knex(baseTable), queryParams, pagination, options)
}

export const prismaPaginate = (prisma: any, client: string) => <OrderType, NodeType>(
  baseTable: string,
  queryParams: any = {},
  pagination: Pagination<OrderType> = {},
  options: Options = {},
): Promise<PaginatedData<NodeType>> => {
  const Knex = require('knex')({ client, useNullAsDefault: true })
  return paginate((sql: string) => prisma.$queryRaw(sql), Knex(baseTable), queryParams, pagination, options)
}
