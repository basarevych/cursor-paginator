import { Cursor, DEFAULT_CURSOR_COLUMN, Options, Pagination } from './constants'

export function generateCursor<OrderType>({
  node,
  pagination,
  options,
}: {
  node: any;
  pagination?: Pagination<OrderType>;
  options?: Options;
}): Cursor {
  const cursorColumn = options?.cursorColumn || DEFAULT_CURSOR_COLUMN
  if (!node[cursorColumn]) throw new Error('Cursor value is required')

  const cursor = []
  let hasId = false
  if (pagination && pagination.orderBy) {
    for (let i = 0; i < pagination.orderBy?.length; i += 1) {
      const orderBy = pagination.orderBy[i] as any
      if (!hasId && orderBy === cursorColumn) hasId = true
      cursor.push({ field: orderBy, value: node[orderBy] })
    }
  }

  if (!hasId) {
    cursor.push({ field: cursorColumn, value: node[cursorColumn] })
  }

  return cursor
}
