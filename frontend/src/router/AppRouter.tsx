import { BrowserRouter, Routes, Route } from "react-router-dom"

// Importing the pages
import AuthPage from "../pages/AuthPage"
import ScooterListPage from "../pages/ScooterListPage"
import MyBookingsPage from "../pages/MyBookingsPage"
import AdminFleetPage from "../pages/AdminFleetPage"

// Main App Router component
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Defining routes for different pages */}
        <Route path="/" element={<AuthPage />} />
        <Route path="/scooters" element={<ScooterListPage />} />
        <Route path="/my-bookings" element={<MyBookingsPage />} />
        <Route path="/admin" element={<AdminFleetPage />} />
      </Routes>
    </BrowserRouter>
  )
}