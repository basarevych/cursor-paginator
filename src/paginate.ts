import Knex from 'knex'
import equal from 'fast-deep-equal'

import { DEFAULT_PAGE_SIZE, Options, Pagination, PaginatedData, Cursor } from './constants'
import { generateCursor } from './generate-cursor'
import { decodeCursor } from './decode-cursor'
import { encodeCursor } from './encode-cursor'
import { getTotalCountQuery } from './get-total-count-query'
import { getDataQuery } from './get-data-query'

export async function paginate<OrderType, NodeType>(
  runQuery: (sql: string) => Promise<any>,
  queryBuilder: Knex.QueryBuilder,
  pagination: Pagination<OrderType> = {},
  options: Options = {},
): Promise<PaginatedData<NodeType>> {
  const { first, after, last, before, orderBy, orderDir } = pagination
  const { pageSize = DEFAULT_PAGE_SIZE, maxPageSize = DEFAULT_PAGE_SIZE, modifyEdge } = options

  // sanity check
  if (
    (!orderBy && orderDir) ||
    (orderBy && !orderDir) ||
    (orderDir && orderBy && orderBy.length !== orderDir.length) ||
    (first && last) ||
    (after && before) ||
    (first && before) ||
    (last && after)
  ) {
    throw new Error('Invalid pagination options')
  }

  // how many records to fetch after/before the cursor
  let take = pageSize
  let cursor: Cursor | null = null

  if (first) {
    // take is positive if fetching after the cursor
    take = Math.abs(first)
    if (take > maxPageSize) {
      take = maxPageSize
    }
    if (after) {
      cursor = decodeCursor(after)
    }
  } else if (last) {
    // take is negative if fetching before cursor
    take = Math.abs(last)
    if (take > maxPageSize) {
      take = maxPageSize
    }
    take = -1 * take
    if (before) {
      cursor = decodeCursor(before)
    }
  } else if (after) {
    // use default page size if not specified
    take = pageSize
    cursor = decodeCursor(after)
  } else if (before) {
    // use default page size if not specified
    take = -1 * pageSize
    cursor = decodeCursor(before)
  }

  let extraTake = take
  if (cursor) {
    // we fetch requested size plus 2 more records
    // (cursor itself and one extra record at the end page)
    // to understand if there is a previous and a next page
    if (extraTake > 0) extraTake += 2
    else extraTake -= 2
  } else {
    // without the cursor we feth the requested number of records
    // plus 1 more to see if there is a next page. we already know
    // there is no previous page since we are starting from the beginning
    if (extraTake > 0) extraTake += 1
    else extraTake -= 1
  }

  // get total count

  const totalResult = await runQuery(
    getTotalCountQuery({
      queryBuilder,
    }),
  )
  const totalCount = totalResult.length && totalResult[0].count

  // get the data and total count
  const data: NodeType[] = await runQuery(
    getDataQuery<OrderType>({
      queryBuilder,
      pagination,
      options,
      cursor,
      take: extraTake,
    }),
  )

  // analyze data

  let hasPreviousPage = false
  let hasNextPage = false

  // check if fetched the cursor itself
  // if we did we know there is a page there
  if (cursor && data.length) {
    if (take > 0) {
      const firstCursor = generateCursor<OrderType>({ node: data[0], pagination, options })
      if (equal(firstCursor, cursor)) {
        hasPreviousPage = true
        data.shift()
      }
    } else {
      const lastCursor = generateCursor<OrderType>({ node: data[data.length - 1], pagination, options })
      if (equal(lastCursor, cursor)) {
        hasNextPage = true
        data.pop()
      }
    }
  }

  // check if we fetched more records than the requested amount
  // which again means there is a page there
  while (data.length > Math.abs(take)) {
    if (take > 0) {
      hasNextPage = true
      data.pop()
    } else {
      hasPreviousPage = true
      data.shift()
    }
  }

  // transform edges if requested
  const edges = await Promise.all(
    data.map(async (item) => {
      const itemCursor = encodeCursor(
        generateCursor<OrderType>({ node: item, pagination, options }),
      )
      if (!modifyEdge) {
        return {
          node: item,
          cursor: itemCursor,
        }
      }

      const transformed = modifyEdge({ node: item, cursor: itemCursor })
      return {
        ...transformed,
        cursor: encodeCursor(
          generateCursor<OrderType>({ node: transformed.node, pagination, options }),
        ),
      }
    }),
  )

  // the result
  return {
    totalCount,
    edges,
    pageInfo: {
      hasNextPage,
      hasPreviousPage,
      startCursor: data.length ? encodeCursor(generateCursor({ node: data[0], pagination, options })) : null,
      endCursor: data.length
        ? encodeCursor(generateCursor({ node: data[data.length - 1], pagination, options }))
        : null,
    },
  }
}
