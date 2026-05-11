import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { usePagination, paginationUtils } from "./usePagination";

describe("usePagination", () => {
  it("loads array data and paginates it on the client", async () => {
    const fetchData = vi.fn(async () => [1, 2, 3, 4, 5, 6, 7]);
    const onPageChange = vi.fn();
    const onLimitChange = vi.fn();

    const { result } = renderHook(() =>
      usePagination({
        initialLimit: 3,
        fetchData,
        onPageChange,
        onLimitChange,
      }),
    );

    await waitFor(() => expect(result.current.items).toEqual([1, 2, 3]));
    expect(result.current.total).toBe(7);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.hasNextPage).toBe(true);
    expect(result.current.hasPrevPage).toBe(false);

    act(() => result.current.nextPage());

    await waitFor(() => expect(result.current.items).toEqual([4, 5, 6]));
    expect(result.current.page).toBe(2);
    expect(onPageChange).toHaveBeenCalledWith(2);

    act(() => result.current.setLimit(4));

    await waitFor(() => expect(result.current.items).toEqual([1, 2, 3, 4]));
    expect(result.current.page).toBe(1);
    expect(result.current.limit).toBe(4);
    expect(onLimitChange).toHaveBeenCalledWith(4);
  });

  it("loads server-side paginated responses", async () => {
    const fetchData = vi.fn(async (page: number, limit: number) => ({
      items: [`page-${page}`, `limit-${limit}`],
      total: 42,
      page,
      limit,
      totalPages: 21,
    }));

    const { result } = renderHook(() =>
      usePagination({ initialPage: 2, initialLimit: 2, fetchData }),
    );

    await waitFor(() =>
      expect(result.current.items).toEqual(["page-2", "limit-2"]),
    );
    expect(result.current.total).toBe(42);
    expect(result.current.getPageNumbers()).toEqual([1, 2, 3, 4, 5]);
  });

  it("captures fetch errors and supports manual reload", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchData = vi
      .fn()
      .mockRejectedValueOnce(new Error("network down"))
      .mockResolvedValueOnce(["recovered"]);

    const { result } = renderHook(() =>
      usePagination({ initialLimit: 5, fetchData }),
    );

    await waitFor(() =>
      expect(result.current.error?.message).toBe("network down"),
    );

    await act(async () => {
      await result.current.reload();
    });

    expect(result.current.items).toEqual(["recovered"]);
    expect(result.current.error).toBeNull();
    consoleError.mockRestore();
  });
});

describe("paginationUtils", () => {
  it("calculates indexes, range membership, and display text", () => {
    expect(paginationUtils.getStartIndex(3, 10)).toBe(20);
    expect(paginationUtils.getEndIndex(3, 10)).toBe(30);
    expect(paginationUtils.isInRange(25, 3, 10)).toBe(true);
    expect(paginationUtils.isInRange(30, 3, 10)).toBe(false);
    expect(paginationUtils.formatPaginationInfo(2, 10, 16)).toContain("11-16");
  });
});
