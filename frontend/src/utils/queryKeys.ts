// Query Key Factory for TanStack Query.
// Keep keys stable and scoped (user/role/scope) to avoid leaking cached data across logins.

export type QueryRole = 'CUSTOMER' | 'MANAGER' | (string & {});

export const bookingKeys = {
  all: ['bookings'] as const,
  list: (userId?: string | null, role?: QueryRole | null) =>
    [...bookingKeys.all, 'list', { userId: userId ?? null, role: role ?? null }] as const,
  detail: (id: string, userId?: string | null, role?: QueryRole | null) =>
    [...bookingKeys.all, 'detail', id, { userId: userId ?? null, role: role ?? null }] as const,
};

export const feedbackKeys = {
  all: ['feedbacks'] as const,
  list: (role?: QueryRole | null, filters?: unknown) =>
    [...feedbackKeys.all, 'list', { role: role ?? null, filters: filters ?? null }] as const,
  detail: (id: string, role?: QueryRole | null) =>
    [...feedbackKeys.all, 'detail', id, { role: role ?? null }] as const,
  pendingCount: (role?: QueryRole | null) =>
    [...feedbackKeys.all, 'pending-count', { role: role ?? null }] as const,
  highPriority: (role?: QueryRole | null) =>
    [...feedbackKeys.all, 'high-priority', { role: role ?? null }] as const,
};

export const scooterKeys = {
  all: ['scooters'] as const,
  list: (scope: 'public' | 'admin' = 'public') =>
    [...scooterKeys.all, 'list', { scope }] as const,
  detail: (id: string, scope: 'public' | 'admin' = 'public') =>
    [...scooterKeys.all, 'detail', id, { scope }] as const,
};

export const stationKeys = {
  all: ['stations'] as const,
  list: (scope: 'public' | 'admin' = 'public') =>
    [...stationKeys.all, 'list', { scope }] as const,
  detail: (id: string, scope: 'public' | 'admin' = 'public') =>
    [...stationKeys.all, 'detail', id, { scope }] as const,
};

