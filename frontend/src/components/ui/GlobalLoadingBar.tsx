import { useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'

export default function GlobalLoadingBar() {
  const location = useLocation()
  const [visible, setVisible] = useState(false)
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setVisible(true)

    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)

    hideTimeoutRef.current = setTimeout(() => {
      setVisible(false)
    }, 600)

    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
    }
  }, [location.pathname])

  if (!visible) return null

  return <div className="loading-progress-bar" aria-hidden="true" />
}
