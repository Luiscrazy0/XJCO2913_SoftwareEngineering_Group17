import { BrowserRouter, Routes, Route } from "react-router-dom"

// Importing the pages
import AuthPage from "../pages/AuthPage"
import ScooterListPage from "../pages/ScooterListPage"
import MyBookingsPage from "../pages/MyBookingsPage"
import AdminFleetPage from "../pages/AdminFleetPage"
import TestScooterPage from "../pages/TestScooterPage"
import ProtectedRoute from "../components/ProtectedRoute"

// Main App Router component
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<AuthPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/test-scooters" element={<TestScooterPage />} />
        
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
        
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="MANAGER">
            <AdminFleetPage />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}