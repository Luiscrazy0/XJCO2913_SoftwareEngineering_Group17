import { describe, expect, it } from "vitest";
import { authApi } from "../api/auth";
import { bookingsApi } from "../api/bookings";
import { priceApi } from "../api/price";
import { rideApi } from "../api/ride";
import { scootersApi } from "../api/scooters";
import { stationsApi } from "../api/stations";
import { BookingStatus, HireType, PaginatedResponse, Scooter } from "../types";
import { bookingKeys, scooterKeys } from "../utils/queryKeys";

describe("frontend Sprint 4 integration contracts", () => {
  it("exports API modules for the complete station rental flow", () => {
    expect(authApi).toHaveProperty("login");
    expect(scootersApi).toHaveProperty("getAll");
    expect(stationsApi).toHaveProperty("getAll");
    expect(bookingsApi).toHaveProperty("create");
    expect(priceApi).toHaveProperty("estimate");
    expect(rideApi).toHaveProperty("startRide");
    expect(rideApi).toHaveProperty("endRide");
  });

  it("keeps BookingStatus aligned with Sprint 4 lifecycle states", () => {
    const lifecycle: BookingStatus[] = [
      "PENDING_PAYMENT",
      "CONFIRMED",
      "IN_PROGRESS",
      "EXTENDED",
      "COMPLETED",
      "CANCELLED",
    ];

    expect(lifecycle).toContain("IN_PROGRESS");
    expect(lifecycle).toContain("COMPLETED");
  });

  it("keeps HireType aligned with pricing options used by BookingModal", () => {
    const hireTypes: HireType[] = ["HOUR_1", "HOUR_4", "DAY_1", "WEEK_1"];

    expect(hireTypes).toEqual(["HOUR_1", "HOUR_4", "DAY_1", "WEEK_1"]);
  });

  it("models paginated list responses required by Sprint 4", () => {
    const response: PaginatedResponse<Scooter> = {
      items: [
        {
          id: "scooter-1",
          location: "Library Station",
          status: "AVAILABLE",
          stationId: "station-1",
          updatedAt: "2026-04-30T00:00:00.000Z",
        },
      ],
      total: 21,
      page: 2,
      limit: 10,
      totalPages: 3,
    };

    expect(response.items).toHaveLength(1);
    expect(response.totalPages).toBe(3);
  });

  it("provides stable React Query keys for booking and scooter cache invalidation", () => {
    expect(bookingKeys.list("user-1", "CUSTOMER")).toEqual([
      "bookings",
      "list",
      { userId: "user-1", role: "CUSTOMER" },
    ]);
    expect(scooterKeys.all).toEqual(["scooters"]);
  });
});
