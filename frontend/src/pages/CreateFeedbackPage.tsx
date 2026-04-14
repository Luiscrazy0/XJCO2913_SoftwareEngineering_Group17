import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { feedbackApi, FeedbackCategory } from '../api/feedback'
import { scootersApi } from '../api/scooters'
import { bookingsApi } from '../api/bookings'
import { Scooter } from '../api/scooters'
import { Booking } from '../types'

export default function CreateFeedbackPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [scooters, setScooters] = useState<Scooter[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'FAULT' as FeedbackCategory,
    scooterId: '',
    bookingId: '',
    imageUrl: '',
  })

  useEffect(() => {
    fetchScooters()
    fetchBookings()
  }, [])

  const fetchScooters = async () => {
    try {
      const data = await scootersApi.getAll()
      setScooters(data)
      if (data.length > 0 && !formData.scooterId) {
        setFormData(prev => ({ ...prev, scooterId: data[0].id }))
      }
    } catch (error) {
      console.error('Failed to fetch scooters:', error)
    }
  }

  const fetchBookings = async () => {
    try {
      const data = await bookingsApi.getMyBookings()
      setBookings(data)
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        ...formData,
        bookingId: formData.bookingId || undefined,
        imageUrl: formData.imageUrl || undefined,
      }
      await feedbackApi.create(payload)
      navigate('/my-feedbacks')
    } catch (error) {
      console.error('Failed to create feedback:', error)
      alert('Failed to submit feedback. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Submit Feedback</h1>
        <p className="text-gray-600 mt-2">
          Report a fault, damage, or suggestion about our scooters.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Brief summary of the issue"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Detailed description of the issue..."
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="FAULT">Fault / Technical Issue</option>
            <option value="DAMAGE">Damage Report</option>
            <option value="SUGGESTION">Suggestion</option>
          </select>
          <p className="text-sm text-gray-500 mt-1">
            {formData.category === 'DAMAGE' && 'Damage reports are automatically marked as HIGH priority.'}
          </p>
        </div>

        <div>
          <label htmlFor="scooterId" className="block text-sm font-medium text-gray-700 mb-1">
            Scooter *
          </label>
          <select
            id="scooterId"
            name="scooterId"
            value={formData.scooterId}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a scooter</option>
            {scooters.map(scooter => (
              <option key={scooter.id} value={scooter.id}>
                {scooter.location} ({scooter.status})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="bookingId" className="block text-sm font-medium text-gray-700 mb-1">
            Related Booking (Optional)
          </label>
          <select
            id="bookingId"
            name="bookingId"
            value={formData.bookingId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">No specific booking</option>
            {bookings.map(booking => (
              <option key={booking.id} value={booking.id}>
                Booking #{booking.id.slice(0, 8)} - {new Date(booking.startTime).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
            Image URL (Optional)
          </label>
          <input
            type="url"
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </form>
    </div>
  )
}