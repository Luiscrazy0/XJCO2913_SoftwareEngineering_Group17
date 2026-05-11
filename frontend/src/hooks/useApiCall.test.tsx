import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useApiCall, useApiResponse } from "./useApiCall";

describe("useApiCall", () => {
  it("stores successful data and calls onSuccess", async () => {
    const onSuccess = vi.fn();
    const apiFunction = vi.fn(async (id: string) => ({ id }));

    const { result } = renderHook(() =>
      useApiCall(apiFunction, { onSuccess }),
    );

    let response: { id: string } | null = null;
    await act(async () => {
      response = await result.current.execute("booking-1");
    });

    expect(response).toEqual({ id: "booking-1" });
    expect(result.current.data).toEqual({ id: "booking-1" });
    expect(result.current.error).toBeNull();
    expect(onSuccess).toHaveBeenCalledWith({ id: "booking-1" });
  });

  it("stores non-abort errors and resets state", async () => {
    const onError = vi.fn();
    const apiFunction = vi.fn(async () => {
      throw new Error("request failed");
    });

    const { result } = renderHook(() => useApiCall(apiFunction, { onError }));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.error?.message).toBe("request failed");
    expect(onError).toHaveBeenCalledWith(expect.any(Error));

    act(() => result.current.reset());

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it("ignores AbortError failures", async () => {
    const onError = vi.fn();
    const abortError = new Error("aborted");
    abortError.name = "AbortError";
    const apiFunction = vi.fn(async () => {
      throw abortError;
    });

    const { result } = renderHook(() => useApiCall(apiFunction, { onError }));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.error).toBeNull();
    expect(onError).not.toHaveBeenCalled();
  });
});

describe("useApiResponse", () => {
  it("unwraps successful API responses", async () => {
    const onSuccess = vi.fn();
    const apiFunction = vi.fn(async () => ({
      success: true,
      data: { total: 12 },
      message: "ok",
    }));

    const { result } = renderHook(() =>
      useApiResponse(apiFunction, { onSuccess }),
    );

    await act(async () => {
      await result.current.execute();
    });

    await waitFor(() => expect(result.current.data).toEqual({ total: 12 }));
    expect(result.current.message).toBe("ok");
    expect(onSuccess).toHaveBeenCalledWith({ total: 12 });
  });

  it("normalizes unsuccessful API responses", async () => {
    const onError = vi.fn();
    const apiFunction = vi.fn(async () => ({
      success: false,
      error: "not allowed",
      message: "denied",
    }));

    const { result } = renderHook(() => useApiResponse(apiFunction, { onError }));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error?.message).toBe("not allowed");
    expect(result.current.message).toBe("denied");
    expect(onError).toHaveBeenCalledWith(expect.any(Error));
  });
});
