import { BrowserRouter, Routes, Route } from "react-router-dom"

// Importing the pages
import AuthPage from "../pages/AuthPage"
import ScooterListPage from "../pages/ScooterListPage"
import MyBookingsPage from "../pages/MyBookingsPage"
import AdminFleetPage from "../pages/AdminFleetPage"
import ProtectedRoute from "../components/ProtectedRoute"

// Main App Router component
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<AuthPage />} />
        
        {/* Protected routes */}
        <Route path="/scooters" element={
          <ProtectedRoute>
            <ScooterListPage />
          </ProtectedRoute>
        } />
        
        <Route path="/my-bookings" element={
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