import Knex from 'knex'

export function getTotalCountQuery({
  queryBuilder,
  queryParams,
}: {
  queryBuilder: Knex.QueryBuilder
  queryParams: any
}): string {
  return queryBuilder.clone().where(queryParams).count('*', { as: 'count' }).toQuery()
}
