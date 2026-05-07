import { beforeEach, describe, expect, it, vi } from "vitest";
import { authApi } from "./auth";
import { bookingsApi } from "./bookings";
import { employeeBookingsApi } from "./employeeBookings";
import { feedbackApi } from "./feedback";
import { paymentCardApi } from "./paymentCards";
import { priceApi } from "./price";
import { rideApi } from "./ride";
import { scootersApi } from "./scooters";
import { stationsApi } from "./stations";
import {
  getDailyRevenue,
  getRevenueChartData,
  getWeeklyRevenue,
} from "./statistics";
import { usersApi } from "./users";
import axiosClient from "../utils/axiosClient";

const axiosClientMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}));

vi.mock("../utils/axiosClient", () => ({
  default: axiosClientMock,
}));

const ok = <T,>(data: T) => ({
  data: {
    success: true,
    data,
  },
});

const fail = (message: string) => ({
  data: {
    success: false,
    message,
  },
});

const paginated = <T,>(items: T[], limit = 20) => ({
  items,
  total: items.length,
  page: 1,
  limit,
  totalPages: items.length ? 1 : 0,
});

const scooter = {
  id: "scooter-1",
  location: "Library",
  status: "AVAILABLE" as const,
  stationId: "station-1",
  updatedAt: "2026-04-30T00:00:00.000Z",
};

const station = {
  id: "station-1",
  name: "Library Station",
  address: "Library",
  latitude: 30.76,
  longitude: 103.98,
  scooters: [scooter],
  createdAt: "2026-04-30T00:00:00.000Z",
  updatedAt: "2026-04-30T00:00:00.000Z",
};

const booking = {
  id: "booking-1",
  userId: "user-1",
  scooterId: scooter.id,
  pickupStationId: station.id,
  hireType: "HOUR_1" as const,
  startTime: "2026-04-30T10:00:00.000Z",
  endTime: "2026-04-30T11:00:00.000Z",
  status: "PENDING_PAYMENT" as const,
  totalCost: 5,
  extensionCount: 0,
  scooter,
  user: { id: "user-1", email: "customer@test.com", role: "CUSTOMER" as const },
  pickupStation: station,
  createdAt: "2026-04-30T09:50:00.000Z",
  updatedAt: "2026-04-30T09:50:00.000Z",
};

describe("Sprint 4 API clients", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("posts auth payloads and rejects malformed auth responses", async () => {
    axiosClientMock.post
      .mockResolvedValueOnce(ok({ access_token: "token-1" }))
      .mockResolvedValueOnce(ok({ id: "user-1", email: "new@test.com" }))
      .mockResolvedValueOnce({ data: { success: true } });

    await expect(
      authApi.login({ email: "customer@test.com", password: "demo123" }),
    ).resolves.toEqual({ access_token: "token-1" });
    expect(axiosClient.post).toHaveBeenCalledWith("/auth/login", {
      email: "customer@test.com",
      password: "demo123",
    });

    await expect(
      authApi.register({
        email: "new@test.com",
        password: "demo123",
        insuranceAcknowledged: true,
      }),
    ).resolves.toEqual({ id: "user-1", email: "new@test.com" });

    await expect(
      authApi.login({ email: "bad@test.com", password: "demo123" }),
    ).rejects.toThrow("Login API returned malformed response");
  });

  it("wraps booking lifecycle endpoints with pagination and damage flags", async () => {
    axiosClientMock.get.mockResolvedValueOnce(ok(paginated([booking], 10)));
    axiosClientMock.post.mockResolvedValueOnce(ok(booking));
    axiosClientMock.patch
      .mockResolvedValueOnce(ok({ ...booking, status: "EXTENDED" }))
      .mockResolvedValueOnce(ok({ ...booking, status: "CANCELLED" }))
      .mockResolvedValueOnce(ok({ ...booking, status: "COMPLETED" }));

    await expect(bookingsApi.getMyBookings(2, 10)).resolves.toMatchObject({
      items: [booking],
      limit: 10,
    });
    expect(axiosClient.get).toHaveBeenCalledWith("/bookings", {
      params: { page: 2, limit: 10 },
    });

    await expect(
      bookingsApi.create({
        scooterId: scooter.id,
        hireType: "HOUR_1",
        startTime: booking.startTime,
      }),
    ).resolves.toEqual(booking);
    await expect(bookingsApi.extend("booking-1", { additionalHours: 1 }))
      .resolves.toMatchObject({ status: "EXTENDED" });
    await expect(bookingsApi.cancel("booking-1")).resolves.toMatchObject({
      status: "CANCELLED",
    });
    await expect(bookingsApi.complete("booking-1", false)).resolves.toMatchObject({
      status: "COMPLETED",
    });
    expect(axiosClient.patch).toHaveBeenLastCalledWith(
      "/bookings/booking-1/complete",
      { isScooterIntact: false },
    );
  });

  it("surfaces booking API messages when requests fail", async () => {
    axiosClientMock.get.mockResolvedValueOnce(fail("no bookings today"));

    await expect(bookingsApi.getMyBookings()).rejects.toThrow(
      "no bookings today",
    );
  });

  it("starts and ends rides with explicit return station and damage data", async () => {
    const inProgress = { ...booking, status: "IN_PROGRESS" as const };
    const endRideResponse = {
      booking: { ...booking, status: "COMPLETED" as const },
      scooter: { ...scooter, stationId: "station-2" },
      damageReportCreated: true,
    };
    axiosClientMock.post
      .mockResolvedValueOnce(ok(inProgress))
      .mockResolvedValueOnce(ok(endRideResponse))
      .mockResolvedValueOnce(fail("Only confirmed bookings can start a ride"));

    await expect(rideApi.startRide("booking-1")).resolves.toEqual(inProgress);
    expect(axiosClient.post).toHaveBeenCalledWith(
      "/bookings/booking-1/start-ride",
    );

    await expect(
      rideApi.endRide("booking-1", {
        returnStationId: "station-2",
        isScooterIntact: false,
      }),
    ).resolves.toEqual(endRideResponse);
    expect(axiosClient.post).toHaveBeenCalledWith(
      "/bookings/booking-1/end-ride",
      { returnStationId: "station-2", isScooterIntact: false },
    );

    await expect(rideApi.startRide("booking-2")).rejects.toThrow(
      "Only confirmed bookings can start a ride",
    );
  });

  it("covers pricing and discount configuration endpoints", async () => {
    const pricing = { HOUR_1: 5, HOUR_4: 15, DAY_1: 30, WEEK_1: 150 };
    axiosClientMock.get
      .mockResolvedValueOnce(
        ok({
          baseCost: 15,
          discountAmount: 3,
          discountRate: 0.2,
          discountedPrice: 12,
          discountReason: "Student discount",
          hireType: "HOUR_4",
          durationHours: 4,
        }),
      )
      .mockResolvedValueOnce(ok(pricing))
      .mockResolvedValueOnce(ok([{ userType: "STUDENT", rate: 0.8 }]));
    axiosClientMock.put
      .mockResolvedValueOnce(ok({ ...pricing, HOUR_1: 6 }))
      .mockResolvedValueOnce(ok(pricing))
      .mockResolvedValueOnce(ok(null))
      .mockResolvedValueOnce(fail("bad rate"));

    await expect(priceApi.estimate("HOUR_4")).resolves.toMatchObject({
      discountedPrice: 12,
    });
    await expect(priceApi.getPricing()).resolves.toEqual(pricing);
    await expect(priceApi.updatePricing("HOUR_1", 6)).resolves.toMatchObject({
      HOUR_1: 6,
    });
    await expect(priceApi.resetPricing()).resolves.toEqual(pricing);
    await expect(priceApi.getDiscounts()).resolves.toEqual([
      { userType: "STUDENT", rate: 0.8 },
    ]);
    await expect(priceApi.updateDiscount("STUDENT", 0.8)).resolves.toBeUndefined();
    await expect(priceApi.updateDiscount("STUDENT", 1.5)).rejects.toThrow(
      "bad rate",
    );
  });

  it("returns safe fallbacks for optional list payloads", async () => {
    axiosClientMock.get
      .mockResolvedValueOnce({ data: { success: true } })
      .mockResolvedValueOnce({ data: { success: true } })
      .mockResolvedValueOnce({ data: { success: true } });

    await expect(scootersApi.getAll()).resolves.toEqual({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    await expect(paymentCardApi.getCards()).resolves.toEqual([]);
    await expect(employeeBookingsApi.getAll()).resolves.toEqual([]);
  });

  it("covers scooter and station resource endpoints", async () => {
    axiosClientMock.get
      .mockResolvedValueOnce(ok(paginated([scooter], 100)))
      .mockResolvedValueOnce(ok(scooter))
      .mockResolvedValueOnce(ok(paginated([station], 100)))
      .mockResolvedValueOnce(ok([station]))
      .mockResolvedValueOnce(ok([station]))
      .mockResolvedValueOnce(ok(station));
    axiosClientMock.post.mockResolvedValueOnce(ok(scooter));
    axiosClientMock.patch.mockResolvedValueOnce(ok({ ...scooter, status: "RENTED" }));
    axiosClientMock.delete.mockResolvedValueOnce(ok(null));

    await expect(scootersApi.getAll(1, 100)).resolves.toMatchObject({
      items: [scooter],
    });
    await expect(scootersApi.getById("scooter-1")).resolves.toEqual(scooter);
    await expect(scootersApi.create("Library")).resolves.toEqual(scooter);
    await expect(scootersApi.updateStatus("scooter-1", "RENTED")).resolves
      .toMatchObject({ status: "RENTED" });
    await expect(scootersApi.delete("scooter-1")).resolves.toBeUndefined();

    await expect(stationsApi.getAll(1, 100)).resolves.toMatchObject({
      items: [station],
    });
    await expect(stationsApi.getAvailableStations()).resolves.toEqual([station]);
    await expect(
      stationsApi.getNearbyStations({ latitude: 30.76, longitude: 103.98 }),
    ).resolves.toEqual([station]);
    await expect(stationsApi.getById("station-1")).resolves.toEqual(station);
  });

  it("throws when required scooter or station payloads are missing", async () => {
    axiosClientMock.get
      .mockResolvedValueOnce({ data: { success: true } })
      .mockResolvedValueOnce({ data: { success: true } });

    await expect(scootersApi.getById("missing")).rejects.toThrow(
      "Failed to load scooter",
    );
    await expect(stationsApi.getAll()).rejects.toThrow(
      "Failed to fetch stations",
    );
  });

  it("covers payment card and employee booking mutations", async () => {
    const cardPayload = {
      cardNumber: "4111111111111111",
      expiryMonth: 12,
      expiryYear: 2030,
      cardholderName: "Test User",
      brand: "Visa",
    };
    const card = {
      id: "card-1",
      last4: "1111",
      expiryMonth: 12,
      expiryYear: 2030,
      cardholderName: "Test User",
      brand: "Visa",
    };

    axiosClientMock.post
      .mockResolvedValueOnce(ok(card))
      .mockResolvedValueOnce(ok(booking));
    axiosClientMock.delete.mockResolvedValueOnce(ok(null));
    axiosClientMock.get.mockResolvedValueOnce(ok([scooter]));

    await expect(paymentCardApi.saveCard(cardPayload)).resolves.toEqual(card);
    await expect(paymentCardApi.deleteCard()).resolves.toBeUndefined();
    await expect(employeeBookingsApi.getAvailableScooters()).resolves.toEqual([
      scooter,
    ]);
    await expect(
      employeeBookingsApi.create({
        guestEmail: "guest@test.com",
        guestName: "Guest",
        scooterId: "scooter-1",
        hireType: "HOUR_1",
        startTime: booking.startTime,
      }),
    ).resolves.toEqual(booking);
  });

  it("builds feedback URLs and returns pending counts", async () => {
    const feedback = {
      id: "feedback-1",
      title: "Damage",
      description: "Brake issue",
      category: "DAMAGE",
      priority: "HIGH",
      status: "PENDING",
      scooterId: "scooter-1",
      createdById: "user-1",
      createdAt: "2026-04-30T00:00:00.000Z",
      updatedAt: "2026-04-30T00:00:00.000Z",
      createdByEmail: "customer@test.com",
      scooterLocation: "Library",
    };

    axiosClientMock.post.mockResolvedValueOnce(ok(feedback));
    axiosClientMock.get
      .mockResolvedValueOnce(ok(paginated([feedback], 10)))
      .mockResolvedValueOnce(ok(feedback))
      .mockResolvedValueOnce(ok(paginated([feedback], 50)))
      .mockResolvedValueOnce(ok(paginated([feedback], 5)))
      .mockResolvedValueOnce(ok({ count: 7 }));
    axiosClientMock.patch.mockResolvedValueOnce(
      ok({ ...feedback, status: "RESOLVED" }),
    );

    await expect(feedbackApi.create(feedback)).resolves.toEqual(feedback);
    await expect(feedbackApi.getMyFeedbacks(1, 10)).resolves.toMatchObject({
      items: [feedback],
    });
    await expect(feedbackApi.getById("feedback-1")).resolves.toEqual(feedback);
    await expect(
      feedbackApi.update("feedback-1", { status: "RESOLVED" }),
    ).resolves.toMatchObject({ status: "RESOLVED" });
    await expect(
      feedbackApi.getAll(
        { status: "PENDING", priority: "HIGH", category: "DAMAGE" },
        2,
        50,
      ),
    ).resolves.toMatchObject({ limit: 50 });
    expect(axiosClient.get).toHaveBeenCalledWith(
      "/feedbacks?status=PENDING&priority=HIGH&category=DAMAGE&page=2&limit=50",
    );
    await expect(feedbackApi.getHighPriority(1, 5)).resolves.toMatchObject({
      items: [feedback],
    });
    await expect(feedbackApi.getPendingCount()).resolves.toBe(7);
  });

  it("covers statistics and user administration endpoints", async () => {
    const weekly = {
      startDate: "2026-04-01",
      endDate: "2026-04-07",
      data: [],
      totalRevenue: 100,
      totalBookings: 4,
    };
    const daily = { ...weekly, data: [] };
    const chart = {
      labels: ["Mon"],
      datasets: [{ label: "Revenue", data: [100] }],
      chartType: "bar",
      period: "week",
    };
    const users = paginated([
      {
        id: "user-1",
        email: "manager@test.com",
        role: "MANAGER",
        userType: "NORMAL",
        createdAt: "2026-04-30T00:00:00.000Z",
      },
    ]);

    axiosClientMock.get
      .mockResolvedValueOnce(ok(weekly))
      .mockResolvedValueOnce(ok(daily))
      .mockResolvedValueOnce(ok(chart))
      .mockResolvedValueOnce(ok(users));
    axiosClientMock.put.mockResolvedValueOnce(ok(null)).mockResolvedValueOnce(
      fail("invalid user type"),
    );

    await expect(getWeeklyRevenue("2026-04-01", "2026-04-07")).resolves.toEqual(
      weekly,
    );
    await expect(getDailyRevenue("2026-04-01", "2026-04-07")).resolves.toEqual(
      daily,
    );
    await expect(getRevenueChartData()).resolves.toEqual(chart);
    await expect(usersApi.getUsers({ page: 1, limit: 20 })).resolves.toEqual(
      users,
    );
    await expect(usersApi.updateUserType("user-1", "STUDENT")).resolves
      .toBeUndefined();
    await expect(usersApi.updateUserType("user-1", "BAD")).rejects.toThrow(
      "invalid user type",
    );
  });
});
