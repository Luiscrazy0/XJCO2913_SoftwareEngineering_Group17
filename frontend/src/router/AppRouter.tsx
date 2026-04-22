//路由表 定义了应用程序中的不同页面和访问权限
import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { LoadingSpinner } from "../components/ui"
import ProtectedRoute from "../components/ProtectedRoute"

// Lazy-loaded page components for code splitting
const AuthPage = lazy(() => import("../pages/AuthPage"))
const ScooterListPage = lazy(() => import("../pages/ScooterListPage"))
const MyBookingsPage = lazy(() => import("../pages/MyBookingsPage"))
const AdminFleetPage = lazy(() => import("../pages/AdminFleetPage"))
const TestScooterPage = lazy(() => import("../pages/TestScooterPage"))
const MapPage = lazy(() => import("../pages/MapPage"))
const RevenueStatisticsPage = lazy(() => import("../pages/RevenueStatisticsPage"))
const CreateFeedbackPage = lazy(() => import("../pages/CreateFeedbackPage"))
const MyFeedbacksPage = lazy(() => import("../pages/MyFeedbacksPage"))
const AdminFeedbacksPage = lazy(() => import("../pages/AdminFeedbacksPage"))
const FeedbackDetailPage = lazy(() => import("../pages/FeedbackDetailPage"))
const HighPriorityPage = lazy(() => import("../pages/HighPriorityPage"))
const ForbiddenPage = lazy(() => import("../pages/ForbiddenPage"))

// Loading fallback for Suspense
function PageLoadingFallback() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
      <LoadingSpinner size="large" />
    </div>
  )
}

// Main App Router component
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoadingFallback />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<AuthPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/test-scooters" element={<TestScooterPage />} />
          <Route path="/403" element={<ForbiddenPage />} />
          
          {/* Protected routes */}
          <Route path="/scooters" element={
            <ProtectedRoute>
              <ScooterListPage />
            </ProtectedRoute>
          } />
          
          <Route path="/bookings" element={
            <ProtectedRoute>
              <MyBookingsPage />
            </ProtectedRoute>
          } />
          
          <Route path="/map" element={
            <ProtectedRoute>
              <MapPage />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="MANAGER">
              <AdminFleetPage />
            </ProtectedRoute>
          } />
          
          <Route path="/statistics" element={
            <ProtectedRoute requiredRole="MANAGER">
              <RevenueStatisticsPage />
            </ProtectedRoute>
          } />
          
          <Route path="/feedback/new" element={
            <ProtectedRoute>
              <CreateFeedbackPage />
            </ProtectedRoute>
          } />
          
          <Route path="/my-feedbacks" element={
            <ProtectedRoute>
              <MyFeedbacksPage />
            </ProtectedRoute>
          } />
          
          {/* Admin Feedback Management Routes */}
          <Route path="/admin/feedbacks" element={
            <ProtectedRoute requiredRole="MANAGER">
              <AdminFeedbacksPage />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/feedbacks/:id" element={
            <ProtectedRoute requiredRole="MANAGER">
              <FeedbackDetailPage />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/high-priority" element={
            <ProtectedRoute requiredRole="MANAGER">
              <HighPriorityPage />
            </ProtectedRoute>
          } />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
