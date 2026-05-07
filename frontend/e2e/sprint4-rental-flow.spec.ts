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

type PaymentRecord = {
  id: string;
  bookingId?: string;
  status: string;
};

type PaymentResult =
  | PaymentRecord
  | {
      payment: PaymentRecord;
      booking?: Booking;
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

function normalizePayment(result: PaymentResult): PaymentRecord {
  return "payment" in result ? result.payment : result;
}

async function loginWithCredentials(
  api: Awaited<ReturnType<typeof request.newContext>>,
  email: string,
  password: string,
) {
  return api.post("/auth/login", {
    data: {
      email,
      password,
    },
  });
}

async function loginAsCustomer(api: Awaited<ReturnType<typeof request.newContext>>) {
  const health = await unwrap<Record<string, unknown>>(
    await api.get("/health"),
    "GET /health",
  );
  expect(health.status).toMatch(/healthy|degraded/);

  let authResponse = await loginWithCredentials(
    api,
    customerEmail,
    customerPassword,
  );

  if (!authResponse.ok()) {
    const generatedEmail = `e2e-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}@test.com`;

    await unwrap<{ id: string; email: string }>(
      await api.post("/auth/register", {
        data: {
          email: generatedEmail,
          password: customerPassword,
          insuranceAcknowledged: true,
          emergencyContact: "E2E Test Contact",
        },
      }),
      "POST /auth/register fallback user",
    );

    authResponse = await loginWithCredentials(
      api,
      generatedEmail,
      customerPassword,
    );
  }

  const auth = await unwrap<{ access_token: string }>(
    authResponse,
    "POST /auth/login",
  );

  return { Authorization: `Bearer ${auth.access_token}` };
}

async function loadAvailableScooter(
  api: Awaited<ReturnType<typeof request.newContext>>,
) {
  const scooters = await unwrap<Paginated<Scooter>>(
    await api.get("/scooters", { params: { page: 1, limit: 100 } }),
    "GET /scooters",
  );
  const scooter = scooters.items.find((item) => item.status === "AVAILABLE");
  test.skip(!scooter, "No AVAILABLE scooter in the seeded system");
  return scooter!;
}

async function loadReturnStation(
  api: Awaited<ReturnType<typeof request.newContext>>,
  scooter: Scooter,
) {
  const stations = await unwrap<Paginated<Station>>(
    await api.get("/stations", { params: { page: 1, limit: 100 } }),
    "GET /stations",
  );
  const returnStation =
    stations.items.find((station) => station.id === scooter.stationId) ??
    stations.items[0];
  test.skip(!returnStation, "No station exists for return flow");
  return returnStation!;
}

async function createPendingBooking(
  api: Awaited<ReturnType<typeof request.newContext>>,
  headers: { Authorization: string },
  scooter: Scooter,
) {
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
        scooterId: scooter.id,
        hireType: "HOUR_1",
        startTime,
      },
    }),
    "POST /bookings",
  );
  expect(booking.status).toBe("PENDING_PAYMENT");
  return booking;
}

async function payBooking(
  api: Awaited<ReturnType<typeof request.newContext>>,
  headers: { Authorization: string },
  booking: Booking,
  idempotencyKey: string,
  label = "POST /payments",
) {
  const paymentResult = await unwrap<PaymentResult>(
    await api.post("/payments", {
      headers,
      data: {
        bookingId: booking.id,
        amount: booking.totalCost,
        idempotencyKey,
      },
    }),
    label,
  );
  const payment = normalizePayment(paymentResult);
  expect(payment.status).toBe("SUCCESS");
  return payment;
}

async function startRide(
  api: Awaited<ReturnType<typeof request.newContext>>,
  headers: { Authorization: string },
  bookingId: string,
) {
  const activeBooking = await unwrap<Booking>(
    await api.post(`/bookings/${bookingId}/start-ride`, { headers }),
    "POST /bookings/:id/start-ride",
  );
  expect(activeBooking.status).toBe("IN_PROGRESS");
  return activeBooking;
}

async function endRide(
  api: Awaited<ReturnType<typeof request.newContext>>,
  headers: { Authorization: string },
  bookingId: string,
  returnStationId: string,
  isScooterIntact: boolean,
) {
  return unwrap<{
    booking: Booking;
    damageReportCreated: boolean;
  }>(
    await api.post(`/bookings/${bookingId}/end-ride`, {
      headers,
      data: {
        returnStationId,
        isScooterIntact,
      },
    }),
    "POST /bookings/:id/end-ride",
  );
}

test.describe("Sprint 4 system rental flow", () => {
  test("customer can estimate, book, pay, start ride, and return a scooter", async () => {
    const api = await request.newContext({ baseURL: apiBaseURL });

    try {
      const headers = await loginAsCustomer(api);
      const scooter = await loadAvailableScooter(api);
      const returnStation = await loadReturnStation(api, scooter);
      const booking = await createPendingBooking(api, headers, scooter);

      await payBooking(api, headers, booking, `${booking.id}-e2e`);
      await startRide(api, headers, booking.id);

      const completedRide = await endRide(
        api,
        headers,
        booking.id,
        returnStation.id,
        true,
      );
      expect(completedRide.booking.status).toBe("COMPLETED");
      expect(completedRide.damageReportCreated).toBe(false);
    } finally {
      await api.dispose();
    }
  });

  test("repeated payment submission with the same idempotency key returns the original payment", async () => {
    const api = await request.newContext({ baseURL: apiBaseURL });

    try {
      const headers = await loginAsCustomer(api);
      const scooter = await loadAvailableScooter(api);
      const returnStation = await loadReturnStation(api, scooter);
      const booking = await createPendingBooking(api, headers, scooter);
      const idempotencyKey = `${booking.id}-e2e-idempotency`;

      const firstPayment = await payBooking(
        api,
        headers,
        booking,
        idempotencyKey,
      );
      const repeatedPayment = await payBooking(
        api,
        headers,
        booking,
        idempotencyKey,
        "POST /payments repeated idempotency key",
      );

      expect(repeatedPayment.id).toBe(firstPayment.id);
      expect(repeatedPayment.bookingId ?? booking.id).toBe(booking.id);

      await startRide(api, headers, booking.id);
      const completedRide = await endRide(
        api,
        headers,
        booking.id,
        returnStation.id,
        true,
      );
      expect(completedRide.booking.status).toBe("COMPLETED");
      expect(completedRide.damageReportCreated).toBe(false);
    } finally {
      await api.dispose();
    }
  });

  test("returning a damaged scooter creates a damage report", async () => {
    const api = await request.newContext({ baseURL: apiBaseURL });

    try {
      const headers = await loginAsCustomer(api);
      const scooter = await loadAvailableScooter(api);
      const returnStation = await loadReturnStation(api, scooter);
      const booking = await createPendingBooking(api, headers, scooter);

      await payBooking(api, headers, booking, `${booking.id}-e2e-damaged`);
      await startRide(api, headers, booking.id);

      const completedRide = await endRide(
        api,
        headers,
        booking.id,
        returnStation.id,
        false,
      );
      expect(completedRide.booking.status).toBe("COMPLETED");
      expect(completedRide.damageReportCreated).toBe(true);
    } finally {
      await api.dispose();
    }
  });
});
