# Test Summary

`docs/testing/summary.md` is the canonical latest summary for test-related work in this repository. Update this file whenever tests, coverage, CI, E2E, or performance verification changes.

## Latest Update

- Date: `2026-05-07`
- Branch: `sprint4-test-work-package`
- Commit: `daa317401c2fd1d87fbc1f0843c15ec47ff133fd`

## Scope

- Added direct frontend API client tests for Sprint 4 flows and error paths.
- Added frontend utility tests for formatters, Luhn logic, query keys, `ApiWrapper`, retry, debounce, and throttle helpers.
- Expanded Playwright API-level E2E coverage for repeated payment submission using the same `idempotencyKey`.
- Expanded Playwright API-level E2E coverage for the damaged return flow with `isScooterIntact: false`.
- Hardened Playwright login setup so CI can auto-register a temporary customer when the configured seed account is unavailable.
- Added an M9 pagination concurrency smoke script that checks `limit=200` is clamped to `100`.
- Extended GitHub Actions to run backend coverage, frontend coverage, Playwright E2E, and pagination performance smoke checks.

## Commands Run

### Backend

```powershell
cd backend
npm run test:cov
```

Result:

- `36` suites passed
- `318` tests passed
- Global coverage: `81.64%` statements, `79.25%` branches, `86.59%` functions, `83.34%` lines

### Frontend

```powershell
cd frontend
npm run test:coverage
npm run test:e2e:list
```

Result:

- `npm run test:coverage`: `6` files passed, `36` tests passed
- `src/api`: `81.86%` statements, `84.33%` lines
- `src/utils`: `82.78%` statements, `82.73%` lines
- `npm run test:e2e:list`: discovered `3` Sprint 4 E2E tests

### Performance Script Validation

```powershell
node --check scripts\m9-pagination-load-test.mjs
```

Result:

- Script syntax check passed

## Not Run Locally

- `cd frontend && npm run test:e2e`
- `npm run perf:m9-pagination` against a live backend

Reason:

- The local environment did not have a backend service listening on `http://localhost:3000`.
- Docker was not available locally, so the CI-backed Postgres + seeded backend flow could not be reproduced in this session.

## Files Added Or Updated In This Test Round

- `.github/workflows/backend-ci.yml`
- `frontend/e2e/sprint4-rental-flow.spec.ts`
- `frontend/src/api/sprint4ApiClients.test.ts`
- `frontend/src/utils/sprint4Utils.test.ts`
- `scripts/m9-pagination-load-test.mjs`
- `package.json`
