import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PriceEstimate from "./PriceEstimate";
import { priceApi } from "../../api/price";
import { renderWithQueryClient } from "../../test/test-utils";

const estimateMock = vi.hoisted(() => vi.fn());

vi.mock("../../api/price", () => ({
  priceApi: {
    estimate: estimateMock,
  },
}));

describe("PriceEstimate", () => {
  beforeEach(() => {
    estimateMock.mockResolvedValue({
      baseCost: 15,
      discountAmount: 3,
      discountRate: 0.2,
      discountedPrice: 12,
      discountReason: "学生折扣 (8折)",
      hireType: "HOUR_4",
      durationHours: 4,
    });
  });

  it("renders base cost, discount, and final payable amount", async () => {
    renderWithQueryClient(<PriceEstimate hireType="HOUR_4" />);

    expect(await screen.findByText("费用明细")).toBeInTheDocument();
    expect(screen.getByText("基本费用 (4小时)")).toBeInTheDocument();
    expect(screen.getByText("¥15.00")).toBeInTheDocument();
    expect(screen.getByText("学生折扣 (8折)")).toBeInTheDocument();
    expect(screen.getByText("-¥3.00")).toBeInTheDocument();
    expect(screen.getByText("¥12.00")).toBeInTheDocument();
    expect(priceApi.estimate).toHaveBeenCalledWith("HOUR_4");
  });

  it("shows a fallback when the estimate API fails", async () => {
    estimateMock.mockRejectedValue(new Error("network down"));

    renderWithQueryClient(<PriceEstimate hireType="DAY_1" />);

    expect(await screen.findByText("费用估算暂不可用")).toBeInTheDocument();
  });
});
