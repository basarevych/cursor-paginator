import { Cursor, Options, Pagination } from './constants'

export async function getTotalCount<OrderType, NodeType>({
  queryRunner,
  queryParams,
  pagination,
  options,
  cursor,
  take,
}: {
  queryRunner: any;
  queryParams: any;
  pagination: Pagination<OrderType>;
  options: Options;
  cursor: Cursor | null;
  take: number;
}): Promise<number> {
  const result = await queryRunner.clone().where(queryParams).count('*', { as: 'count' })
  return result.length ? parseInt(result[0].count, 10) : 0
}
