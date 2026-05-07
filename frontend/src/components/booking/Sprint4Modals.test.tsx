import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PaymentModal from "./PaymentModal";
import StartRideModal from "./StartRideModal";
import EndRideModal from "./EndRideModal";
import RideTimer from "./RideTimer";
import { renderWithQueryClient } from "../../test/test-utils";
import { Booking, Scooter, Station } from "../../types";
import axiosClient from "../../utils/axiosClient";
import { rideApi } from "../../api/ride";
import { stationsApi } from "../../api/stations";

const axiosPostMock = vi.hoisted(() => vi.fn());
const startRideMock = vi.hoisted(() => vi.fn());
const endRideMock = vi.hoisted(() => vi.fn());
const getStationsMock = vi.hoisted(() => vi.fn());

vi.mock("../../utils/axiosClient", () => ({
  default: {
    post: axiosPostMock,
  },
}));

vi.mock("../../api/ride", () => ({
  rideApi: {
    startRide: startRideMock,
    endRide: endRideMock,
  },
}));

vi.mock("../../api/stations", () => ({
  stationsApi: {
    getAll: getStationsMock,
  },
}));

const pickupStation: Station = {
  id: "station-1",
  name: "Library Station",
  address: "Main Library Entrance",
  latitude: 30.7667,
  longitude: 103.9833,
  scooters: [],
  createdAt: "2026-04-30T00:00:00.000Z",
  updatedAt: "2026-04-30T00:00:00.000Z",
};

const returnStation: Station = {
  ...pickupStation,
  id: "station-2",
  name: "Sports Hall Station",
  address: "Sports Hall Gate",
};

const scooter: Scooter = {
  id: "scooter-1",
  location: "Library forecourt",
  status: "RENTED",
  stationId: pickupStation.id,
  station: pickupStation,
  updatedAt: "2026-04-30T00:00:00.000Z",
};

function createBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: "booking-1",
    userId: "user-1",
    scooterId: scooter.id,
    pickupStationId: pickupStation.id,
    hireType: "HOUR_4",
    startTime: "2026-04-30T10:00:00.000Z",
    endTime: "2026-04-30T14:00:00.000Z",
    actualStartTime: "2026-04-30T10:15:00.000Z",
    status: "CONFIRMED",
    totalCost: 12,
    extensionCount: 0,
    scooter,
    user: { id: "user-1", email: "customer@test.com", role: "CUSTOMER" },
    pickupStation,
    createdAt: "2026-04-30T09:45:00.000Z",
    updatedAt: "2026-04-30T09:45:00.000Z",
    ...overrides,
  };
}

describe("PaymentModal", () => {
  beforeEach(() => {
    axiosPostMock.mockResolvedValue({
      data: {
        success: true,
        data: {
          id: "payment-1",
          bookingId: "booking-1",
          amount: 12,
          status: "SUCCESS",
          createdAt: "2026-04-30T10:00:00.000Z",
        },
      },
    });
  });

  it("shows booking summary and captures payment with an idempotency key", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    vi.spyOn(Date, "now").mockReturnValue(1777552800000);

    renderWithQueryClient(
      <PaymentModal
        isOpen
        booking={createBooking({ status: "PENDING_PAYMENT" })}
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );

    expect(screen.getByText("确认支付")).toBeInTheDocument();
    expect(screen.getByText("取车站点: Library Station")).toBeInTheDocument();
    expect(screen.getByText("¥12.00")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /确认支付/ }));

    await waitFor(() => {
      expect(axiosClient.post).toHaveBeenCalledWith("/payments", {
        bookingId: "booking-1",
        amount: 12,
        idempotencyKey: "booking-1-1777552800000",
      });
    });
    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ id: "booking-1" }),
    );
    expect(onClose).toHaveBeenCalled();
  });

  it("shows a payment failure message from the API", async () => {
    const user = userEvent.setup();
    axiosPostMock.mockRejectedValue({
      response: { data: { message: "Payment gateway unavailable" } },
    });

    renderWithQueryClient(
      <PaymentModal
        isOpen
        booking={createBooking({ status: "PENDING_PAYMENT" })}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /确认支付/ }));

    expect(
      await screen.findByText("Payment gateway unavailable"),
    ).toBeInTheDocument();
  });
});

describe("StartRideModal", () => {
  it("requires confirmation before starting the ride", async () => {
    const user = userEvent.setup();
    const startedBooking = createBooking({ status: "IN_PROGRESS" });
    startRideMock.mockResolvedValue(startedBooking);
    const onClose = vi.fn();
    const onSuccess = vi.fn();

    renderWithQueryClient(
      <StartRideModal
        isOpen
        booking={createBooking()}
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );

    const startButton = screen.getByRole("button", {
      name: /确认取车，开始骑行/,
    });
    expect(startButton).toBeDisabled();

    await user.click(screen.getByRole("checkbox"));
    await user.click(startButton);

    await waitFor(() => {
      expect(rideApi.startRide).toHaveBeenCalledWith("booking-1");
    });
    expect(onSuccess).toHaveBeenCalledWith(startedBooking);
    expect(onClose).toHaveBeenCalled();
  });
});

describe("EndRideModal", () => {
  beforeEach(() => {
    getStationsMock.mockResolvedValue({
      items: [pickupStation, returnStation],
      total: 2,
      page: 1,
      limit: 100,
      totalPages: 1,
    });
  });

  it("submits return station and damage report choice", async () => {
    const user = userEvent.setup();
    const completedBooking = createBooking({
      status: "COMPLETED",
      returnStationId: returnStation.id,
    });
    endRideMock.mockResolvedValue({
      booking: completedBooking,
      scooter: { ...scooter, status: "AVAILABLE", stationId: returnStation.id },
      damageReportCreated: true,
    });
    const onClose = vi.fn();
    const onSuccess = vi.fn();

    renderWithQueryClient(
      <EndRideModal
        isOpen
        booking={createBooking({ status: "IN_PROGRESS" })}
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );

    expect(await screen.findByText(/Sports Hall Station/)).toBeInTheDocument();

    await user.selectOptions(screen.getByRole("combobox"), returnStation.id);
    await user.click(screen.getByRole("checkbox"));
    expect(screen.getByText("取消勾选将自动提交损坏报告")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "确认还车" }));

    await waitFor(() => {
      expect(stationsApi.getAll).toHaveBeenCalledWith(1, 100);
      expect(rideApi.endRide).toHaveBeenCalledWith("booking-1", {
        returnStationId: returnStation.id,
        isScooterIntact: false,
      });
    });
    expect(onSuccess).toHaveBeenCalledWith({
      booking: completedBooking,
      damageReportCreated: true,
    });
    expect(onClose).toHaveBeenCalled();
  });
});

describe("RideTimer", () => {
  it("renders elapsed ride time and ticks forward", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-30T10:00:00.000Z"));

    renderWithQueryClient(<RideTimer startTime="2026-04-30T09:59:58.000Z" />);

    expect(screen.getByText("00:00:02")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText("00:00:03")).toBeInTheDocument();
    vi.useRealTimers();
  });
});
