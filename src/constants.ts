export const DEFAULT_CURSOR_COLUMN = 'id'
export const DEFAULT_PAGE_SIZE = 10

export enum OrderDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export type Pagination<OrderType> = {
  first?: number;
  after?: string;
  last?: number;
  before?: string;
  orderBy?: OrderType[];
  orderDir?: OrderDirection[];
};

export type PageInfo = {
  startCursor: string | null;
  endCursor: string | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type Edge<Node> = {
  node: Node;
  cursor: string;
};

export type PaginatedData<Node> = {
  totalCount: number;
  pageInfo: PageInfo;
  edges: Edge<Node>[];
};

export type Options = {
  cursorColumn?: string;
  pageSize?: number;
  maxPageSize?: number;
  modifyEdge?: (item: any) => any | Promise<any>;
};

export type Cursor = {
  field: string;
  value: any;
}[];
