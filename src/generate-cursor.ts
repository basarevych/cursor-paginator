import { Cursor, DEFAULT_CURSOR_COLUMN, Options, Page } from './constants'

export function generateCursor<OrderType>({
  node,
  page,
  options,
}: {
  node: any
  page?: Page<OrderType>
  options?: Options
}): Cursor {
  const cursorColumn = options?.cursorColumn || DEFAULT_CURSOR_COLUMN
  if (!node[cursorColumn]) throw new Error('Cursor value is required')

  const cursor = []
  let hasId = false
  if (page && page.orderBy) {
    for (let i = 0; i < page.orderBy?.length; i += 1) {
      const orderBy = page.orderBy[i] as any
      if (!hasId && orderBy === cursorColumn) hasId = true
      cursor.push({ f: orderBy, v: node[orderBy] })
    }
  }

  if (!hasId) {
    cursor.push({ f: cursorColumn, v: node[cursorColumn] })
  }

  return cursor
}
