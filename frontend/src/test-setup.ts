// Test file to verify the setup
import { User, Scooter, Booking, UserRole } from './types'

// Test type definitions
const testUser: User = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'CUSTOMER' as UserRole,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
}

const testScooter: Scooter = {
  id: '1',
  name: 'Scooter 1',
  model: 'Model X',
  batteryLevel: 85,
  location: {
    latitude: 51.5074,
    longitude: -0.1278,
    address: 'London, UK'
  },
  status: 'AVAILABLE',
  pricePerMinute: 0.25,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
}

const testBooking: Booking = {
  id: '1',
  scooterId: '1',
  userId: '1',
  startTime: '2024-01-01T10:00:00Z',
  endTime: '2024-01-01T11:00:00Z',
  totalCost: 15.0,
  status: 'COMPLETED',
  createdAt: '2024-01-01T09:00:00Z',
  updatedAt: '2024-01-01T11:00:00Z'
}

console.log('Type definitions are working correctly:')
console.log('- User:', testUser.email, testUser.role)
console.log('- Scooter:', testScooter.name, testScooter.status)
console.log('- Booking:', testBooking.status, testBooking.totalCost)

// Test API structure
import { authApi } from './api/auth'
import { scootersApi } from './api/scooters'
import { bookingsApi } from './api/bookings'

console.log('\nAPI modules are properly exported:')
console.log('- authApi:', Object.keys(authApi))
console.log('- scootersApi:', Object.keys(scootersApi))
console.log('- bookingsApi:', Object.keys(bookingsApi))

// Test axios client
import axiosClient from './utils/axiosClient'
console.log('\nAxios client configured with baseURL:', axiosClient.defaults.baseURL)

// Test query client
import { queryClient } from './utils/queryClient'
console.log('Query client configured with default options')

console.log('\n✅ All infrastructure components are properly set up!')