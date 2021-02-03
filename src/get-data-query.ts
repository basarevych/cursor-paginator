import Knex from 'knex'

import { Cursor, DEFAULT_CURSOR_COLUMN, Options, Page } from './constants'

export function getDataQuery<OrderType>({
  queryBuilder,
  page,
  options,
  cursor,
  take,
}: {
  queryBuilder: Knex.QueryBuilder
  page: Page<OrderType>
  options: Options
  cursor: Cursor | null
  take: number
}): string {
  const { orderBy, orderDir } = page
  const { cursorColumn = DEFAULT_CURSOR_COLUMN } = options

  let query = queryBuilder.clone().select('*')

  if (cursor) {
    if (take > 0) {
      for (let i = cursor.length - 1; i >= 0; i -= 1) {
        query = query.orWhere((qb: any) => {
          qb.andWhere(cursor[i].f, '>=', cursor[i].v)
          for (let j = i - 1; j >= 0; j -= 1) {
            qb.andWhere(cursor[j].f, '=', cursor[j].v)
          }
        })
      }
    } else if (take < 0) {
      for (let i = cursor.length - 1; i >= 0; i -= 1) {
        query = query.orWhere((qb: any) => {
          qb.andWhere(cursor[i].f, '<=', cursor[i].v)
          for (let j = i - 1; j >= 0; j -= 1) {
            qb.andWhere(cursor[j].f, '=', cursor[j].v)
          }
        })
      }
    }
  }

  const orderByParams = []

  let isSortedById = false
  if (orderBy && orderDir) {
    for (let i = 0; i < orderBy.length; i++) {
      const key = orderBy[i] as any
      if (key === cursorColumn) isSortedById = true
      orderByParams.push({ column: key, order: orderDir[i] })
    }
  }
  if (!isSortedById) orderByParams.push({ column: cursorColumn, order: 'asc' })

  return query.orderBy(orderByParams).toQuery()
}
