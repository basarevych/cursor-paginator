import Knex from 'knex'

export function getTotalCountQuery({ queryBuilder }: { queryBuilder: Knex.QueryBuilder }): string {
  return queryBuilder.clone().count('*', { as: 'count' }).toQuery()
}
