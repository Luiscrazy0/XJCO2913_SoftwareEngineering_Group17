# Frontend Optimization Plan

## Overview

Based on comprehensive analysis of the frontend codebase, this document outlines the optimization strategy for improving performance, maintainability, and user experience.

| Priority | Optimization | Effort | Impact |
|----------|-------------|--------|--------|
| High | Code Splitting & Lazy Loading | Small | App-wide performance |
| High | Form Unification | Medium | All form pages |
| High | Error Boundary Integration | Small | App stability |
| Medium | Custom Hooks Adoption | Medium | State management |
| Medium | Performance Memoization | Medium | Render performance |
| Medium | API Wrapper Unification | Medium | All data requests |
| Medium | Accessibility Improvements | Small | User experience |
| Low | Utility Extraction | Small | Code reusability |
| Low | Type Definition Enhancement | Small | DX |
| Low | Virtualization Consideration | Large | Specific pages |

---

## 1. Code Splitting & Lazy Loading

**Problem**: All page components are statically imported, causing large initial bundle size.

**Files to Modify**: `frontend/src/router/AppRouter.tsx`

**Implementation**:

```tsx
import { lazy, Suspense } from 'react'

const ScooterListPage = lazy(() => import('../pages/ScooterListPage'))
const MyBookingsPage = lazy(() => import('../pages/MyBookingsPage'))
const MapPage = lazy(() => import('../pages/MapPage'))
const AdminFleetPage = lazy(() => import('../pages/AdminFleetPage'))
const RevenueStatisticsPage = lazy(() => import('../pages/RevenueStatisticsPage'))
const CreateFeedbackPage = lazy(() => import('../pages/CreateFeedbackPage'))
const MyFeedbacksPage = lazy(() => import('../pages/MyFeedbacksPage'))
const AdminFeedbacksPage = lazy(() => import('../pages/AdminFeedbacksPage'))
const FeedbackDetailPage = lazy(() => import('../pages/FeedbackDetailPage'))
const HighPriorityPage = lazy(() => import('../pages/HighPriorityPage'))
const TestScooterPage = lazy(() => import('../pages/TestScooterPage'))
const ForbiddenPage = lazy(() => import('../pages/ForbiddenPage'))

// Wrap Routes with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <Routes>{/* routes */}</Routes>
</Suspense>
```

---

## 2. Form Unification

**Problem**: `AuthPage.tsx` implements duplicate form validation logic instead of using existing `useForm` hook.

**Files to Modify**: `frontend/src/pages/AuthPage.tsx`

**Implementation**:

```tsx
import { useForm, validationRules } from '../hooks/useForm'

const schema = {
  email: [validationRules.required(), validationRules.email()],
  password: [validationRules.required(), validationRules.minLength(6)],
}

export default function AuthPage() {
  const { values, errors, handleChange, handleBlur, handleSubmit, isSubmitting } = useForm({
    initialValues: { email: '', password: '' },
    validate: (vals) => {
      const errs: Record<string, string> = {}
      // Apply validation rules
      return errs
    },
    onSubmit: async (vals) => {
      if (isLogin) {
        await login(vals.email, vals.password)
      } else {
        await register(vals.email, vals.password, vals.insuranceAcknowledged, vals.emergencyContact)
      }
    },
  })

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  )
}
```

---

## 3. Error Boundary Integration

**Problem**: No error boundary at app top level; JavaScript errors cause white screen.

**Files to Modify**: `frontend/src/App.tsx`

**Implementation**:

```tsx
import { ErrorBoundaryProvider } from './components/ui/ErrorBoundary'

function App() {
  return (
    <ErrorBoundaryProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthProvider>
            <AppRouter />
          </AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundaryProvider>
  )
}
```

---

## 4. Custom Hooks Adoption

**Problem**: Implemented hooks (`useApiCall`, `useForm`, `usePagination`) are underutilized.

### 4.1 Add useDebounce Hook

**New File**: `frontend/src/hooks/useDebounce.ts`

```tsx
import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}
```

### 4.2 Add useLocalStorage Hook

**New File**: `frontend/src/hooks/useLocalStorage.ts`

```tsx
import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(error)
    }
  }

  return [storedValue, setValue] as const
}
```

---

## 5. Performance Memoization

**Problem**: Frequent component re-renders, missing memoization.

### 5.1 Memoize UI Components

**Files to Modify**: `frontend/src/components/ui/Button.tsx`, `frontend/src/components/ui/Input.tsx`

```tsx
export default React.memo(Button)
export default React.memo(Input)
```

### 5.2 Memoryze Callback Functions

**Files to Modify**: `frontend/src/pages/ScooterListPage.tsx`

```tsx
const handleBookClick = useCallback((scooter: Scooter) => {
  setSelectedScooter(scooter)
  setIsBookingModalOpen(true)
}, [])
```

### 5.3 Optimize Expensive Computations

```tsx
const sortedScooters = useMemo(() => {
  return scooters.sort((a, b) => b.battery - a.battery)
}, [scooters])
```

---

## 6. API Wrapper Unification

**Problem**: API modules don't use existing `ApiWrapper`, error handling is scattered.

**Files to Modify**: All files in `frontend/src/api/*.ts`

**Implementation**:

```tsx
import { ApiWrapper } from '../utils/apiWrapper'

export const scooterApi = {
  list: () => ApiWrapper.wrap(() => axios.get('/scooters')),
  getById: (id: string) => ApiWrapper.wrap(() => axios.get(`/scooters/${id}`)),
  create: (data: CreateScooterDto) => ApiWrapper.wrap(() => axios.post('/scooters', data)),
  update: (id: string, data: UpdateScooterDto) => ApiWrapper.wrap(() => axios.patch(`/scooters/${id}`, data)),
  delete: (id: string) => ApiWrapper.wrap(() => axios.delete(`/scooters/${id}`)),
}
```

---

## 7. Accessibility Improvements

**Problem**: Basic components lack ARIA attributes.

### 7.1 Enhance Input Component

**Files to Modify**: `frontend/src/components/ui/Input.tsx`

```tsx
<input
  id={inputId}
  aria-invalid={!!error}
  aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
  {...props}
/>

{error && <span id={`${inputId}-error`} className="text-xs text-rose-400">{error}</span>}
{hint && !error && <span id={`${inputId}-hint`} className="text-xs text-[var(--text-secondary)]">{hint}</span>}
```

### 7.2 Enhance Card Component

**Files to Modify**: `frontend/src/components/ui/Card.tsx`

```tsx
interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: keyof HTMLElementTagNameMap
  variant?: 'default' | 'outlined'
}

export default function Card({ as: Component = 'div', variant = 'default', children, className, ...props }: CardProps) {
  return (
    <Component className={`card card-${variant} ${className}`} {...props}>
      {children}
    </Component>
  )
}
```

---

## 8. Utility Function Extraction

**Problem**: JWT decode logic is embedded in `AuthContext`.

### 8.1 Extract JWT Utility

**New File**: `frontend/src/utils/jwt.ts`

```tsx
interface JWTPayload {
  sub: string
  role: string
  exp?: number
  iat?: number
}

export function decodeJWT(token?: string | null): JWTPayload | null {
  if (!token) return null

  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) throw new Error('Invalid JWT format')

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Failed to decode JWT:', error)
    return null
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token)
  if (!payload?.exp) return true
  return Date.now() >= payload.exp * 1000
}
```

---

## 9. Type Definition Enhancement

**Files to Modify**: `frontend/src/types/index.ts`

```tsx
// Component Prop Types
export type { ButtonProps, ButtonVariant, ButtonSize } from '../components/ui/Button'
export type { InputProps } from '../components/ui/Input'
export type { CardProps } from '../components/ui/Card'

// Hook Types
export type { UseApiCallOptions, UseApiCallReturn } from '../hooks/useApiCall'
export type { UseFormOptions, UseFormReturn } from '../hooks/useForm'
export type { UsePaginationOptions, UsePaginationReturn } from '../hooks/usePagination'

// Utility Types
export type { ApiResponse } from './api'
```

---

## 10. Virtualization Consideration

**Problem**: Long lists may impact performance without virtualization.

**Files to Consider**: `frontend/src/pages/ScooterListPage.tsx`

**Implementation** (if needed):

```tsx
import { useVirtualizer } from '@tanstack/react-virtual'

function VirtualScooterList({ scooters }: { scooters: Scooter[] }) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: scooters.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
    overscan: 5,
  })

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <ScooterCard
            key={virtualRow.index}
            scooter={scooters[virtualRow.index]}
            style={{
              position: 'absolute',
              top: virtualRow.start,
              height: virtualRow.size,
            }}
          />
        ))}
      </div>
    </div>
  )
}
```

---

## Implementation Order

1. **Phase 1** (High Priority - Quick Wins)
   - Create new branch `feat/frontend-optimization`
   - Error boundary integration
   - Code splitting & lazy loading

2. **Phase 2** (Medium Priority - Refactoring)
   - Form unification
   - Custom hooks adoption (add useDebounce, useLocalStorage)
   - Performance memoization

3. **Phase 3** (Medium Priority - Consistency)
   - API wrapper unification
   - Accessibility improvements

4. **Phase 4** (Low Priority - Polish)
   - Utility extraction
   - Type definition enhancement

---

## Testing Checklist

- [ ] Verify all routes load correctly with lazy loading
- [ ] Test error boundary catches JavaScript errors
- [ ] Verify form validation works correctly
- [ ] Check memoized components don't re-render unnecessarily
- [ ] Test API error handling consistency
- [ ] Verify accessibility with screen readers
- [ ] Run ESLint and TypeScript checks

---

## Related Files

- `frontend/src/App.tsx`
- `frontend/src/router/AppRouter.tsx`
- `frontend/src/pages/AuthPage.tsx`
- `frontend/src/components/ui/*.tsx`
- `frontend/src/hooks/*.ts`
- `frontend/src/api/*.ts`
- `frontend/src/utils/*.ts`