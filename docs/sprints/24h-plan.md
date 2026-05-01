# 24-Hour Parallel Sprint Plan

## Context

Backlog 25/25 complete, PR #29 merged to dev, PR #30 (concurrency) pending. Two exploratory audits found 16 actionable issues across production hardening and UI/UX polish. This plan splits work between 2 agents running in parallel, each on their own git worktree.

---

## Agent 1: Production Hardening (12h)

**Branch**: `feature/production-hardening` (from dev)
**Focus**: Security, stability, dead code removal, missing infrastructure

### Tasks

| # | Task | Files | Est. |
|---|------|-------|------|
| 1.1 | **Remove ride-packages dead links** | `Navbar.tsx`, `MobileBottomNav.tsx`, `SplashScreen.tsx` | 0.5h |
| 1.2 | **Fix hardcoded guest password** | `employee-booking.service.ts:58` — hash `temp_password_for_guest` with bcrypt like registration does | 0.5h |
| 1.3 | **Add 404 catch-all route** | `AppRouter.tsx` — add `<Route path="*" element={<NotFoundPage />} />` with a simple NotFound page | 1h |
| 1.4 | **Add missing CSS variable** | `index.css` — define `--bg-hover: rgba(255,255,255,0.05)` in `:root` | 0.25h |
| 1.5 | **Fix npm audit vulnerabilities** | `cd backend && npm audit fix`, `cd frontend && npm audit fix` | 0.5h |
| 1.6 | **Wrap routes with ErrorBoundary** | `AppRouter.tsx` — wrap each `<Route>` element with `<ErrorBoundary>` | 1h |
| 1.7 | **Resolve TODO comments** | `booking.service.ts:346,420` — either implement guest email notification or remove TODOs with explanation | 1h |
| 1.8 | **Run full test suite + fix regressions** | Backend 36 suites, frontend tsc | 2h |
| 1.9 | **Merge PR #30 into hardening branch** | Resolve merge conflicts, verify optimistic locking + SSE work on dev base | 1h |
| 1.10 | **Final CI verification + commit + push** | | 1h |
| | **Subtotal** | | **~9.5h** |

### Deliverable
PR `feature/production-hardening` → `dev` with all fixes passing CI

---

## Agent 2: UI/UX Polish (12h)

**Branch**: `feature/ui-polish` (from dev)
**Focus**: Navigation consistency, discoverability, visual cohesion, component standardization

### Tasks

| # | Task | Files | Est. |
|---|------|-------|------|
| 2.1 | **Fix Navbar active highlighting** | `Navbar.tsx` — change `isActive` from `===` to `startsWith` for admin routes | 0.5h |
| 2.2 | **Add FAQ + Payment Methods to navigation** | `Navbar.tsx` — add FAQ to user nav, payment-methods to user area dropdown. `Footer.tsx` already has FAQ link | 0.5h |
| 2.3 | **Standardize page layouts** | `AuthPage.tsx`, `CreateFeedbackPage.tsx`, `FeedbackDetailPage.tsx`, `ForbiddenPage.tsx`, `TestScooterPage.tsx` — wrap in `PageLayout` | 2h |
| 2.4 | **Standardize loading states** | Replace inline spinners with `<LoadingSpinner>` in `ScooterListPage`, `AdminFleetPage`, `AdminFeedbacksPage`, `HighPriorityPage`, `MapPage`, `MyFeedbacksPage`, `UserManagementPage` | 1.5h |
| 2.5 | **Standardize empty states** | Replace inline empty messages with `<EmptyState>` in `ScooterListPage`, `MyFeedbacksPage`, `AdminFleetPage` | 1h |
| 2.6 | **Standardize error states** | Replace inline error blocks with `<ErrorState>` in all pages that lack it | 1h |
| 2.7 | **Fix SplashScreen promos** | `SplashScreen.tsx` — replace fake 月卡 promo with real discount info; use dynamic data where possible | 1h |
| 2.8 | **Ensure admin dropdown has all links** | `Navbar.tsx` — add `/admin/fleet`, `/admin/users`, `/admin/staff-booking` to admin dropdown | 0.5h |
| 2.9 | **Run frontend tsc + visual smoke test** | | 1h |
| 2.10 | **Commit + push + create PR** | | 0.5h |
| | **Subtotal** | | **~10.5h** |

### Deliverable
PR `feature/ui-polish` → `dev` with all pages layout-consistent and navigation complete

---

## Merge Order

```
feature/production-hardening → dev  (merge first — has security fixes)
feature/ui-polish → dev             (merge second — may have minor conflicts)
```

---

## Verification

| Check | Agent 1 | Agent 2 |
|-------|---------|---------|
| Backend tests | 36 suites / 302+ tests | N/A |
| Frontend tsc | Zero errors | Zero errors |
| npm audit | 0 high/critical | 0 high/critical |
| Prettier | Pass | Pass |
| Manual smoke | 404 page, guest booking, optimistic lock | Nav highlight, FAQ nav, layout consistency |
