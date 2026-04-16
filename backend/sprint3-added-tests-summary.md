# Sprint 3 Added Tests Summary

## Branch

- `chore/sprint3-ci-tests`

## Coverage Target

- Updated Jest global coverage threshold in `package.json` from `50%` to `80%`

## Verification Result

- `npm run lint`: passed with `0 errors`
- `npx jest --coverage --runInBand`: passed
- Current coverage:
  - Statements: `87.56%`
  - Branches: `84.01%`
  - Functions: `94.52%`
  - Lines: `88.62%`

## New Test Files

- `src/modules/amap/amap.controller.spec.ts`
  - Added validation and success/failure tests for geocode, reverse geocode, distance, batch geocode, batch distance, input tips, nearby search, station sorting, and API key validation.
- `src/modules/booking/payment-card.service.spec.ts`
  - Added tests for add card, lookup, full card retrieval, delete single/all cards, set default card, and encryption helpers.
- `src/modules/booking/discount.service.spec.ts`
  - Added tests for discount calculation across `NORMAL`, `STUDENT`, `SENIOR`, and `FREQUENT` users, including threshold branches and missing-user handling.
- `src/modules/booking/email.service.spec.ts`
  - Added tests for transport creation and booking / payment email sending branches.
- `src/modules/payment/payment-card.service.spec.ts`
  - Added tests for add card, list cards, set default card, delete card, and default-card lookup.
- `src/modules/scooter/scooter.controller.spec.ts`
  - Added controller delegation tests for CRUD, nearby queries, and status updates.
- `src/filters/http-exception.filter.spec.ts`
  - Added tests for `HttpException` string/object payloads, generic `Error`, and unknown exception handling.
- `src/interceptors/response.interceptor.spec.ts`
  - Added tests for wrapping plain responses and preserving already-standardized responses.

## Expanded Existing Test Files

- `src/modules/booking/booking.controller.spec.ts`
  - Expanded controller tests for query endpoints, completion flow, payment-card endpoints, and staff booking endpoints.
- `src/modules/booking/booking.service.spec.ts`
  - Expanded tests for booking creation, extension, cancellation, completion, damage feedback creation, employee-assisted booking, and mail failure fallback.
- `src/modules/statistics/statistics.service.spec.ts`
  - Expanded tests for weekly revenue, daily revenue aggregation, chart-data generation, default period handling, and hire-type label mapping.

## Supporting Fixes For Stable CI/Test Runs

- `src/modules/booking/booking.service.ts`
  - Replaced runtime-dependent feedback enum usage with stable constants to avoid Jest environment failures.
- `src/modules/booking/discount.service.ts`
  - Replaced runtime Prisma enum usage with local constants and cleaned response text handling.
- `src/modules/feedback/feedback.constants.ts`
  - Added shared feedback constants used by tests and service logic.

## Notes

- Lint now passes, but the repository still contains existing ESLint warnings outside the scope of this task.
- The added tests were chosen to raise both statement coverage and branch coverage efficiently for the Sprint 3 CI target.
