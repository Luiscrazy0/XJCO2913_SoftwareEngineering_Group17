import { Routes, Route, Navigate } from "react-router-dom"
import { lazy, Suspense } from "react"

import LandingPage from "../pages/LandingPage"
import AuthPage from "../pages/AuthPage"
import ProtectedRoute from "../components/ProtectedRoute"
import ForbiddenPage from "../pages/ForbiddenPage"
import NotFoundPage from "../pages/NotFoundPage"
import { useAuth } from "../context/AuthContext"
import LoadingSpinner from "../components/ui/LoadingSpinner"

const ScooterListPage = lazy(() => import("../pages/ScooterListPage"))
const MyBookingsPage = lazy(() => import("../pages/MyBookingsPage"))
const MapPage = lazy(() => import("../pages/MapPage"))
const CreateFeedbackPage = lazy(() => import("../pages/CreateFeedbackPage"))
const MyFeedbacksPage = lazy(() => import("../pages/MyFeedbacksPage"))
const PaymentMethodsPage = lazy(() => import("../pages/PaymentMethodsPage"))
const FeedbackDetailPage = lazy(() => import("../pages/FeedbackDetailPage"))
const AdminDashboardPage = lazy(() => import("../pages/AdminDashboardPage"))
const AdminFleetPage = lazy(() => import("../pages/AdminFleetPage"))
const AdminPricingPage = lazy(() => import("../pages/AdminPricingPage"))
const RevenueStatisticsPage = lazy(() => import("../pages/RevenueStatisticsPage"))
const AdminFeedbacksPage = lazy(() => import("../pages/AdminFeedbacksPage"))
const HighPriorityPage = lazy(() => import("../pages/HighPriorityPage"))
const FAQPage = lazy(() => import("../pages/FAQPage"))
const TestScooterPage = lazy(() => import("../pages/TestScooterPage"))
const StaffBookingPage = lazy(() => import("../pages/StaffBookingPage"))
const UserManagementPage = lazy(() => import("../pages/UserManagementPage"))

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner />
    </div>
  )
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth()
  if (isAuthenticated) {
    const target = user?.role === 'MANAGER' ? '/admin' : '/scooters'
    return <Navigate to={target} replace />
  }
  return <>{children}</>
}

export default function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
        <Route path="/test-scooters" element={<TestScooterPage />} />
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="/faq" element={<FAQPage />} />

        {/* Protected routes */}
        <Route path="/scooters" element={<ProtectedRoute><ScooterListPage /></ProtectedRoute>} />
        <Route path="/bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
        <Route path="/map" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
        <Route path="/feedback/new" element={<ProtectedRoute><CreateFeedbackPage /></ProtectedRoute>} />
        <Route path="/my-feedbacks" element={<ProtectedRoute><MyFeedbacksPage /></ProtectedRoute>} />
        <Route path="/payment-methods" element={<ProtectedRoute><PaymentMethodsPage /></ProtectedRoute>} />

        <Route path="/feedbacks/:id" element={<ProtectedRoute><FeedbackDetailPage /></ProtectedRoute>} />

        {/* Admin Dashboard */}
        <Route path="/admin" element={<ProtectedRoute requiredRole="MANAGER"><AdminDashboardPage /></ProtectedRoute>} />

        {/* Admin sub-routes */}
        <Route path="/admin/fleet" element={<ProtectedRoute requiredRole="MANAGER"><AdminFleetPage /></ProtectedRoute>} />
        <Route path="/admin/pricing" element={<ProtectedRoute requiredRole="MANAGER"><AdminPricingPage /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute requiredRole="MANAGER"><UserManagementPage /></ProtectedRoute>} />
        <Route path="/admin/staff-booking" element={<ProtectedRoute requiredRole="MANAGER"><StaffBookingPage /></ProtectedRoute>} />
        <Route path="/admin/feedbacks" element={<ProtectedRoute requiredRole="MANAGER"><AdminFeedbacksPage /></ProtectedRoute>} />
        <Route path="/admin/feedbacks/:id" element={<ProtectedRoute requiredRole="MANAGER"><FeedbackDetailPage /></ProtectedRoute>} />
        <Route path="/admin/high-priority" element={<ProtectedRoute requiredRole="MANAGER"><HighPriorityPage /></ProtectedRoute>} />
        <Route path="/statistics" element={<ProtectedRoute requiredRole="MANAGER"><RevenueStatisticsPage /></ProtectedRoute>} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
