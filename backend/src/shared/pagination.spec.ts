import { parsePagination, paginatedResponse } from './pagination';

describe('parsePagination', () => {
  it('returns defaults when no params', () => {
    const result = parsePagination({});
    expect(result.skip).toBe(0);
    expect(result.take).toBe(20);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.orderBy).toEqual({ createdAt: 'desc' });
  });

  it('clamps page to minimum 1', () => {
    const result = parsePagination({ page: -5, limit: 10 });
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
  });

  it('clamps limit to maximum 100', () => {
    const result = parsePagination({ limit: 200 });
    expect(result.limit).toBe(100);
  });

  it('calculates correct skip', () => {
    const result = parsePagination({ page: 3, limit: 10 });
    expect(result.skip).toBe(20);
  });
});

describe('paginatedResponse', () => {
  it('wraps items with pagination metadata', () => {
    const result = paginatedResponse(['a', 'b'], 10, 1, 2);
    expect(result.items).toEqual(['a', 'b']);
    expect(result.total).toBe(10);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(2);
    expect(result.totalPages).toBe(5);
  });
});
