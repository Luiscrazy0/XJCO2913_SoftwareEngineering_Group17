import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import BookingModal from "./BookingModal";
import { renderWithQueryClient } from "../test/test-utils";
import { Booking, Scooter, Station } from "../types";
import { bookingsApi } from "../api/bookings";

const navigateMock = vi.hoisted(() => vi.fn());
const createBookingMock = vi.hoisted(() => vi.fn());
const useAuthMock = vi.hoisted(() =>
  vi.fn(() => ({
    user: { id: "user-1", email: "customer@test.com", role: "CUSTOMER" },
  })),
);

vi.mock("react-router-dom", () => ({
  useNavigate: () => navigateMock,
}));

vi.mock("../context/AuthContext", () => ({
  useAuth: () => useAuthMock(),
}));

vi.mock("../api/bookings", () => ({
  bookingsApi: {
    create: createBookingMock,
  },
}));

vi.mock("./booking/PriceEstimate", () => ({
  default: ({ hireType }: { hireType: string }) => (
    <div data-testid="price-estimate">Estimate for {hireType}</div>
  ),
}));

const station: Station = {
  id: "station-1",
  name: "Library Station",
  address: "Main Library Entrance",
  latitude: 30.7667,
  longitude: 103.9833,
  scooters: [],
  createdAt: "2026-04-30T00:00:00.000Z",
  updatedAt: "2026-04-30T00:00:00.000Z",
};

function createScooter(overrides: Partial<Scooter> = {}): Scooter {
  return {
    id: "scooter-1",
    location: "Library forecourt",
    status: "AVAILABLE",
    stationId: station.id,
    station,
    updatedAt: "2026-04-30T00:00:00.000Z",
    ...overrides,
  };
}

function createBooking(scooter: Scooter): Booking {
  return {
    id: "booking-1",
    userId: "user-1",
    scooterId: scooter.id,
    hireType: "HOUR_4",
    startTime: "2030-01-01T10:00:00.000Z",
    endTime: "2030-01-01T14:00:00.000Z",
    status: "PENDING_PAYMENT",
    totalCost: 12,
    extensionCount: 0,
    scooter,
    user: { id: "user-1", email: "customer@test.com", role: "CUSTOMER" },
    createdAt: "2026-04-30T00:00:00.000Z",
    updatedAt: "2026-04-30T00:00:00.000Z",
  };
}

describe("BookingModal Sprint 4 behaviour", () => {
  beforeEach(() => {
    createBookingMock.mockResolvedValue(createBooking(createScooter()));
  });

  it("shows station pickup details and refreshes the price estimate when hire type changes", async () => {
    const user = userEvent.setup();

    renderWithQueryClient(
      <BookingModal isOpen scooter={createScooter()} onClose={vi.fn()} />,
    );

    expect(screen.getByText(/Library Station/)).toBeInTheDocument();
    expect(screen.getByText(/Main Library Entrance/)).toBeInTheDocument();
    expect(screen.getByTestId("price-estimate")).toHaveTextContent("HOUR_1");

    await user.click(screen.getByRole("button", { name: /4 小时/ }));

    expect(screen.getByTestId("price-estimate")).toHaveTextContent("HOUR_4");
  });

  it("submits a future booking with scooter, hire type, and ISO start time", async () => {
    const user = userEvent.setup();
    const scooter = createScooter();

    renderWithQueryClient(
      <BookingModal isOpen scooter={scooter} onClose={vi.fn()} />,
    );

    await user.click(screen.getByRole("button", { name: /4 小时/ }));
    fireEvent.change(screen.getByLabelText("开始时间"), {
      target: { value: "2030-01-01T10:00" },
    });
    await user.click(screen.getByRole("button", { name: /确认预约并支付/ }));

    await waitFor(() => {
      expect(bookingsApi.create).toHaveBeenCalledWith({
        scooterId: scooter.id,
        hireType: "HOUR_4",
        startTime: expect.stringContaining("2030-01-01T"),
      });
    });
  });

  it("blocks booking when the scooter is no longer available", async () => {
    const user = userEvent.setup();

    renderWithQueryClient(
      <BookingModal
        isOpen
        scooter={createScooter({ status: "RENTED" })}
        onClose={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /确认预约并支付/ }));

    expect(
      await screen.findByText("该车辆已被他人预约，请选择其他车辆"),
    ).toBeInTheDocument();
    expect(bookingsApi.create).not.toHaveBeenCalled();
  });
});
