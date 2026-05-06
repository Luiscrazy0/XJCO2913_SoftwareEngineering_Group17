import { expect, request, test, type APIResponse } from "@playwright/test";

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type Scooter = {
  id: string;
  status: string;
  stationId?: string;
};

type Station = {
  id: string;
  name: string;
};

type Booking = {
  id: string;
  scooterId: string;
  status: string;
  totalCost: number;
};

type PriceEstimate = {
  baseCost: number;
  discountedPrice: number;
  hireType: string;
  durationHours: number;
};

const apiBaseURL = process.env.E2E_API_URL ?? "http://localhost:3000";
const customerEmail = process.env.E2E_CUSTOMER_EMAIL ?? "customer@test.com";
const customerPassword = process.env.E2E_CUSTOMER_PASSWORD ?? "demo123";

async function unwrap<T>(response: APIResponse, label: string) {
  expect(response.ok(), `${label} returned ${response.status()}`).toBeTruthy();
  const body = (await response.json()) as ApiResponse<T>;
  expect(body.success, `${label} body: ${JSON.stringify(body)}`).toBe(true);
  return body.data as T;
}

test.describe("Sprint 4 system rental flow", () => {
  test("customer can estimate, book, pay, start ride, and return a scooter", async () => {
    const api = await request.newContext({ baseURL: apiBaseURL });

    const health = await unwrap<Record<string, unknown>>(
      await api.get("/health"),
      "GET /health",
    );
    expect(health.status).toMatch(/healthy|degraded/);

    const auth = await unwrap<{ access_token: string }>(
      await api.post("/auth/login", {
        data: {
          email: customerEmail,
          password: customerPassword,
        },
      }),
      "POST /auth/login",
    );
    const headers = { Authorization: `Bearer ${auth.access_token}` };

    const scooters = await unwrap<Paginated<Scooter>>(
      await api.get("/scooters", { params: { page: 1, limit: 100 } }),
      "GET /scooters",
    );
    const scooter = scooters.items.find((item) => item.status === "AVAILABLE");
    test.skip(!scooter, "No AVAILABLE scooter in the seeded system");

    const stations = await unwrap<Paginated<Station>>(
      await api.get("/stations", { params: { page: 1, limit: 100 } }),
      "GET /stations",
    );
    const returnStation =
      stations.items.find((station) => station.id === scooter!.stationId) ??
      stations.items[0];
    test.skip(!returnStation, "No station exists for return flow");

    const estimate = await unwrap<PriceEstimate>(
      await api.get("/bookings/estimate-price", {
        headers,
        params: { hireType: "HOUR_1" },
      }),
      "GET /bookings/estimate-price",
    );
    expect(estimate.discountedPrice).toBeGreaterThan(0);
    expect(estimate.durationHours).toBe(1);

    const startTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    const booking = await unwrap<Booking>(
      await api.post("/bookings", {
        headers,
        data: {
          scooterId: scooter!.id,
          hireType: "HOUR_1",
          startTime,
        },
      }),
      "POST /bookings",
    );
    expect(booking.status).toBe("PENDING_PAYMENT");

    const payment = await unwrap<{ id: string; status: string }>(
      await api.post("/payments", {
        headers,
        data: {
          bookingId: booking.id,
          amount: booking.totalCost,
          idempotencyKey: `${booking.id}-e2e`,
        },
      }),
      "POST /payments",
    );
    expect(payment.status).toBe("SUCCESS");

    const activeBooking = await unwrap<Booking>(
      await api.post(`/bookings/${booking.id}/start-ride`, { headers }),
      "POST /bookings/:id/start-ride",
    );
    expect(activeBooking.status).toBe("IN_PROGRESS");

    const endRide = await unwrap<{
      booking: Booking;
      damageReportCreated: boolean;
    }>(
      await api.post(`/bookings/${booking.id}/end-ride`, {
        headers,
        data: {
          returnStationId: returnStation.id,
          isScooterIntact: true,
        },
      }),
      "POST /bookings/:id/end-ride",
    );
    expect(endRide.booking.status).toBe("COMPLETED");
    expect(endRide.damageReportCreated).toBe(false);

    await api.dispose();
  });
});
