import { useEffect, useState } from 'react'

interface Props {
  startTime: string
  className?: string
}

export default function RideTimer({ startTime, className = '' }: Props) {
  const [elapsed, setElapsed] = useState('00:00:00')

  useEffect(() => {
    const start = new Date(startTime).getTime()

    const tick = () => {
      const diff = Math.max(0, Date.now() - start)
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setElapsed(
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`,
      )
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [startTime])

  return (
    <span className={`font-mono tabular-nums ${className}`}>
      {elapsed}
    </span>
  )
}
