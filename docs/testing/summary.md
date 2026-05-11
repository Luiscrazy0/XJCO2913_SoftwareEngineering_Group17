# Test Summary

`docs/testing/summary.md` is the canonical latest summary for test-related work in this repository. Update this file whenever tests, coverage, CI, E2E, or performance verification changes.

## Latest Update

- Date: `2026-05-11`
- Branch: `sprint4-test-work-package`
- Base commit: `f08b46a`

## Scope

- Fast-forwarded `sprint4-test-work-package` to the latest `origin/dev`.
- Added frontend unit tests for `AuthContext`, `ProtectedRoute`, `usePagination`, `useApiCall`, and `useApiResponse`.
- Added backend unit tests for request-id middleware, logger middleware, events service, and events controller.
- Added backend unit tests for feedback image upload controller success and missing-file validation.
- Added frontend API tests for feedback image upload and dashboard summary statistics added by latest dev.
- Updated Sprint 4 frontend API client tests for the latest dev response shape and reset mock queues between tests.
- Added a frontend production build step to GitHub Actions before frontend coverage.

## Commands Run

### Backend

```powershell
cd backend
npm ci
npx prisma generate
$env:ENCRYPTION_KEY='ci-test-encryption-key-32chars'
npm run test:cov
$env:JWT_SECRET='ci-test-jwt-secret'
$env:ENCRYPTION_KEY='ci-test-encryption-key-32chars'
npm run test:e2e
npx prettier --check src/middleware/logger.middleware.spec.ts src/middleware/request-id.middleware.spec.ts src/modules/events/events.controller.spec.ts src/modules/events/events.service.spec.ts
```

Result:

- `npm run test:cov`: `41` suites passed, `332` tests passed.
- Backend global coverage: `82.15%` statements, `79.37%` branches, `87.75%` functions, `83.65%` lines.
- `src/middleware`: `100%` statements, `91.66%` branches, `100%` functions, `100%` lines.
- `src/modules/events`: `76.92%` statements, `80%` branches, `100%` functions, `80%` lines.
- `src/modules/upload/upload.controller.ts`: `100%` statements, `57.14%` branches, `100%` functions, `100%` lines.
- `npm run test:e2e`: `1` suite passed, `1` test passed with CI-equivalent env vars.
- Prettier check passed for the new backend test files.

### Frontend

```powershell
cd frontend
npm ci
npm run build
npm run test:coverage
```

Result:

- `npm run build`: passed
- `npm run test:coverage`: `10` files passed, `57` tests passed.
- Overall frontend coverage: `24.13%` statements, `15.25%` branches, `19.23%` functions, `25.05%` lines.
- `src/context/AuthContext.tsx`: `79.04%` statements, `63.88%` branches, `83.33%` functions, `79.04%` lines.
- `src/hooks/usePagination.ts`: `94.28%` statements, `65%` branches, `92.3%` functions, `95.58%` lines.
- `src/hooks/useApiCall.ts`: `85.71%` statements, `64%` branches, `83.33%` functions, `85.71%` lines.
- `src/api`: `80.71%` statements, `83.33%` lines after adding coverage for `upload.ts` and dashboard summary.
- `src/api/upload.ts`: `100%` statements, `75%` branches, `100%` functions, `100%` lines.
- `src/utils`: `82.78%` statements, `82.73%` lines

### E2E Discovery

```powershell
cd frontend
npm run test:e2e:list
```

Result:

- Playwright discovered `3` Sprint 4 E2E tests.

## Not Run Locally

- `cd frontend && npm run test:e2e`
- `npm run perf:m9-pagination` against a live backend

Reason:

- Local frontend E2E and pagination performance checks require a seeded backend and Postgres service; those are covered by the CI job setup.
- A full-repo backend Prettier check was not used as a success signal locally because the Windows working tree reported existing style differences across many pre-existing files. The new backend test files were checked directly and passed.

## Files Added Or Updated In This Test Round

- `.github/workflows/backend-ci.yml`
- `backend/src/middleware/logger.middleware.spec.ts`
- `backend/src/middleware/request-id.middleware.spec.ts`
- `backend/src/modules/events/events.controller.spec.ts`
- `backend/src/modules/events/events.service.spec.ts`
- `backend/src/modules/upload/upload.controller.spec.ts`
- `docs/testing/summary.md`
- `frontend/src/api/sprint4ApiClients.test.ts`
- `frontend/src/components/ProtectedRoute.test.tsx`
- `frontend/src/context/AuthContext.test.tsx`
- `frontend/src/hooks/useApiCall.test.tsx`
- `frontend/src/hooks/usePagination.test.tsx`
