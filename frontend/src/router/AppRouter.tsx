//路由表 定义了应用程序中的不同页面和访问权限
import { BrowserRouter, Routes, Route } from "react-router-dom"

// Importing the pages
import AuthPage from "../pages/AuthPage"
import ScooterListPage from "../pages/ScooterListPage"
import MyBookingsPage from "../pages/MyBookingsPage"
import AdminFleetPage from "../pages/AdminFleetPage"
import TestScooterPage from "../pages/TestScooterPage"
import MapPage from "../pages/MapPage"
import RevenueStatisticsPage from "../pages/RevenueStatisticsPage"
import CreateFeedbackPage from "../pages/CreateFeedbackPage"
import MyFeedbacksPage from "../pages/MyFeedbacksPage"
import AdminFeedbacksPage from "../pages/AdminFeedbacksPage"
import FeedbackDetailPage from "../pages/FeedbackDetailPage"
import HighPriorityPage from "../pages/HighPriorityPage"
import RidePackagesPage from "../pages/RidePackagesPage"
import AdminPricingPage from "../pages/AdminPricingPage"
import ProtectedRoute from "../components/ProtectedRoute"
import ForbiddenPage from "../pages/ForbiddenPage"

// Main App Router component
export default function AppRouter() {
  return (
    <BrowserRouter>
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

        {/* Ride Packages */}
        <Route path="/ride-packages" element={
          <ProtectedRoute>
            <RidePackagesPage />
          </ProtectedRoute>
        } />

        {/* Admin Pricing */}
        <Route path="/admin/pricing" element={
          <ProtectedRoute requiredRole="MANAGER">
            <AdminPricingPage />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}
