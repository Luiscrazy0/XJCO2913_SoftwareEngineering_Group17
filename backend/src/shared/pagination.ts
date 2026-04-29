export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function parsePagination(params: PaginationParams, allowedSortFields: string[] = ['createdAt']) {
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(params.limit) || 20));
  const sortBy = allowedSortFields.includes(params.sortBy || '') ? params.sortBy! : 'createdAt';
  const sortOrder = params.sortOrder === 'asc' ? 'asc' : 'desc';

  return {
    skip: (page - 1) * limit,
    take: limit,
    page,
    limit,
    orderBy: { [sortBy]: sortOrder } as Record<string, 'asc' | 'desc'>,
  };
}

export function paginatedResponse<T>(items: T[], total: number, page: number, limit: number): PaginatedResult<T> {
  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
