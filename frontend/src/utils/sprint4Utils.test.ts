import axios from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiWrapper, apiUtils } from "./apiWrapper";
import {
  formatBookingStatus,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatHireType,
  formatScooterStatus,
} from "./formatters";
import { detectCardBrand, luhnCheck } from "./luhn";
import { queryClient } from "./queryClient";
import { bookingKeys, feedbackKeys, scooterKeys, stationKeys } from "./queryKeys";

describe("Sprint 4 utility helpers", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("formats money, dates, hire types, and statuses", () => {
    expect(formatCurrency(12)).toBe("¥12.00");
    expect(formatDate("2026-04-30T10:15:00.000Z")).toBe("2026-04-30");
    expect(formatDate(new Date("2026-04-30T10:15:00.000Z"))).toBe(
      "2026-04-30",
    );
    expect(formatDateTime(new Date("2026-04-30T10:15:00.000Z"))).toMatch(
      /^2026-04-30 \d{2}:15$/,
    );
    expect(formatHireType("HOUR_4")).toBe("4小时租赁");
    expect(formatHireType("CUSTOM")).toBe("CUSTOM");
    expect(formatBookingStatus("IN_PROGRESS")).toBe("IN_PROGRESS");
    expect(formatBookingStatus("COMPLETED")).toBe("已完成");
    expect(formatScooterStatus("AVAILABLE")).toBe("可用");
    expect(formatScooterStatus("MAINTENANCE")).toBe("MAINTENANCE");
  });

  it("validates card numbers and detects brands from cleaned input", () => {
    expect(luhnCheck("4111 1111 1111 1111")).toBe(true);
    expect(luhnCheck("4111 1111 1111 1112")).toBe(false);
    expect(luhnCheck("123")).toBe(false);
    expect(luhnCheck("41111111111111111111")).toBe(false);

    expect(detectCardBrand("3714 496353 98431")).toBe("Amex");
    expect(detectCardBrand("6011 0000 0000 0004")).toBe("Discover");
    expect(detectCardBrand("4111 1111 1111 1111")).toBe("Visa");
    expect(detectCardBrand("5555 5555 5555 4444")).toBe("Mastercard");
    expect(detectCardBrand("7000 0000 0000 0000")).toBe("Unknown");
  });

  it("creates stable query keys and query client defaults", () => {
    expect(bookingKeys.all).toEqual(["bookings"]);
    expect(bookingKeys.list()).toEqual([
      "bookings",
      "list",
      { userId: null, role: null },
    ]);
    expect(bookingKeys.detail("booking-1", "user-1", "CUSTOMER")).toEqual([
      "bookings",
      "detail",
      "booking-1",
      { userId: "user-1", role: "CUSTOMER" },
    ]);
    expect(feedbackKeys.detail("feedback-1", "MANAGER")).toEqual([
      "feedbacks",
      "detail",
      "feedback-1",
      { role: "MANAGER" },
    ]);
    expect(feedbackKeys.pendingCount()).toEqual([
      "feedbacks",
      "pending-count",
      { role: null },
    ]);
    expect(feedbackKeys.highPriority("MANAGER")).toEqual([
      "feedbacks",
      "high-priority",
      { role: "MANAGER" },
    ]);
    expect(scooterKeys.list("admin")).toEqual([
      "scooters",
      "list",
      { scope: "admin" },
    ]);
    expect(scooterKeys.detail("scooter-1")).toEqual([
      "scooters",
      "detail",
      "scooter-1",
      { scope: "public" },
    ]);
    expect(stationKeys.detail("station-1", "admin")).toEqual([
      "stations",
      "detail",
      "station-1",
      { scope: "admin" },
    ]);

    expect(queryClient.getDefaultOptions().queries?.retry).toBe(1);
    expect(queryClient.getDefaultOptions().queries?.refetchOnWindowFocus).toBe(
      false,
    );
  });

  it("wraps successful API calls and preserves status text", async () => {
    await expect(
      ApiWrapper.wrap(() =>
        Promise.resolve({
          data: { id: "booking-1" },
          statusText: "Created",
        } as never),
      ),
    ).resolves.toEqual({
      success: true,
      data: { id: "booking-1" },
      message: "Created",
    });
  });

  it("normalizes axios response errors with status and server messages", async () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 409,
        data: { message: "Duplicate idempotency key" },
      },
    };

    await expect(ApiWrapper.wrap(() => Promise.reject(error))).resolves.toEqual({
      success: false,
      error: "Duplicate idempotency key",
      message: "资源冲突",
    });
  });

  it("normalizes axios string, request, setup, and non-axios errors", async () => {
    await expect(
      ApiWrapper.wrap(() =>
        Promise.reject({
          isAxiosError: true,
          response: { status: 500, data: "boom" },
        }),
      ),
    ).resolves.toMatchObject({ error: "boom", message: "服务器内部错误" });

    await expect(
      ApiWrapper.wrap(() =>
        Promise.reject({
          isAxiosError: true,
          request: {},
        }),
      ),
    ).resolves.toMatchObject({ error: "请检查网络连接", message: "网络连接失败" });

    await expect(
      ApiWrapper.wrap(() =>
        Promise.reject({
          isAxiosError: true,
          message: "bad config",
        }),
      ),
    ).resolves.toMatchObject({ error: "bad config", message: "请求配置错误" });

    await expect(
      ApiWrapper.wrap(() => Promise.reject(new Error("plain failure"))),
    ).resolves.toMatchObject({ error: "plain failure", message: "系统错误" });

    expect(axios.isAxiosError({ isAxiosError: true })).toBe(true);
  });

  it("creates wrapped API functions that forward arguments", async () => {
    const rawApi = vi.fn().mockResolvedValue({
      data: "ok",
      statusText: "OK",
    });
    const wrapped = ApiWrapper.createApiCall(rawApi);

    await expect(wrapped("booking-1", 2)).resolves.toMatchObject({
      success: true,
      data: "ok",
    });
    expect(rawApi).toHaveBeenCalledWith("booking-1", 2);
  });

  it("retries, parallelizes, and sequences async calls", async () => {
    const flaky = vi
      .fn()
      .mockRejectedValueOnce(new Error("temporary"))
      .mockResolvedValueOnce("ok");

    await expect(apiUtils.retry(flaky, 2, 0)).resolves.toBe("ok");
    expect(flaky).toHaveBeenCalledTimes(2);

    const alwaysFails = vi.fn().mockRejectedValue(new Error("still failing"));
    await expect(apiUtils.retry(alwaysFails, 2, 0)).rejects.toThrow(
      "still failing",
    );

    await expect(
      apiUtils.parallel([() => Promise.resolve("a"), () => Promise.resolve("b")]),
    ).resolves.toEqual(["a", "b"]);

    const order: string[] = [];
    await expect(
      apiUtils.sequential([
        async () => {
          order.push("first");
          return "a";
        },
        async () => {
          order.push("second");
          return "b";
        },
      ]),
    ).resolves.toEqual(["a", "b"]);
    expect(order).toEqual(["first", "second"]);
  });

  it("debounces calls and resolves with the latest result", async () => {
    vi.useFakeTimers();
    const action = vi.fn(async (value: string) => `${value}-done`);
    const debounced = apiUtils.debounce(action, 50);

    const first = debounced("first");
    const second = debounced("second");

    vi.advanceTimersByTime(50);
    await expect(second).resolves.toBe("second-done");
    expect(action).toHaveBeenCalledTimes(1);
    expect(action).toHaveBeenCalledWith("second");

    await expect(Promise.race([first, Promise.resolve("unresolved")])).resolves
      .toBe("unresolved");
  });

  it("throttles calls until the limit elapses", async () => {
    vi.useFakeTimers();
    const action = vi
      .fn()
      .mockResolvedValueOnce("first-result")
      .mockResolvedValueOnce("second-result");
    const throttled = apiUtils.throttle(action, 100);

    await expect(throttled("first")).resolves.toBe("first-result");
    await expect(throttled("ignored")).resolves.toBe("first-result");
    expect(action).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(100);
    await expect(throttled("second")).resolves.toBe("second-result");
    expect(action).toHaveBeenCalledTimes(2);
  });
});
