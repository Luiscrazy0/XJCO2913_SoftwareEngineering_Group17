import { Routes, Route, Navigate } from "react-router-dom"

import AuthPage from "../pages/AuthPage"
import ScooterListPage from "../pages/ScooterListPage"
import MyBookingsPage from "../pages/MyBookingsPage"
import AdminDashboardPage from "../pages/AdminDashboardPage"
import AdminFleetPage from "../pages/AdminFleetPage"
import AdminPricingPage from "../pages/AdminPricingPage"
import TestScooterPage from "../pages/TestScooterPage"
import MapPage from "../pages/MapPage"
import RevenueStatisticsPage from "../pages/RevenueStatisticsPage"
import CreateFeedbackPage from "../pages/CreateFeedbackPage"
import MyFeedbacksPage from "../pages/MyFeedbacksPage"
import AdminFeedbacksPage from "../pages/AdminFeedbacksPage"
import FeedbackDetailPage from "../pages/FeedbackDetailPage"
import HighPriorityPage from "../pages/HighPriorityPage"
import FAQPage from "../pages/FAQPage"
import PaymentMethodsPage from "../pages/PaymentMethodsPage"
import StaffBookingPage from "../pages/StaffBookingPage"
import UserManagementPage from "../pages/UserManagementPage"
import ProtectedRoute from "../components/ProtectedRoute"
import ForbiddenPage from "../pages/ForbiddenPage"
import { useAuth } from "../context/AuthContext"

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
    <Routes>
        {/* Public routes */}
        <Route path="/" element={<PublicRoute><AuthPage /></PublicRoute>} />
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
      </Routes>
  )
}
