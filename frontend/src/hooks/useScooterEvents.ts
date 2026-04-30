import { useEffect, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { scooterKeys } from '../utils/queryKeys'
import { API_BASE_URL } from '../utils/axiosClient'

interface ScooterStatusEvent {
  scooterId: string
  status: string
  timestamp: string
}

export function useScooterEvents() {
  const queryClient = useQueryClient()
  const eventSourceRef = useRef<EventSource | null>(null)

  const connect = useCallback(() => {
    if (eventSourceRef.current) return

    const url = `${API_BASE_URL}/events/scooter-status`
    const es = new EventSource(url)

    es.onmessage = (event) => {
      try {
        const data: ScooterStatusEvent = JSON.parse(event.data)
        // Invalidate scooter queries to trigger UI refresh
        queryClient.invalidateQueries({ queryKey: scooterKeys.all })
        queryClient.invalidateQueries({ queryKey: ['employee-bookings'] })
      } catch {
        // Ignore malformed events
      }
    }

    es.onerror = () => {
      es.close()
      eventSourceRef.current = null
      // Reconnect after 5 seconds
      setTimeout(connect, 5000)
    }

    eventSourceRef.current = es
  }, [queryClient])

  useEffect(() => {
    connect()
    return () => {
      eventSourceRef.current?.close()
      eventSourceRef.current = null
    }
  }, [connect])
}
