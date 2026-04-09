import { Scooter } from '../../types'
import Badge from '../ui/Badge'

type Status = Scooter['status']

const labels: Record<Status, string> = {
  AVAILABLE: '可用',
  UNAVAILABLE: '不可用',
  RENTED: '租用中',
}

interface StatusBadgeProps {
  status: Status
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variant = status === 'AVAILABLE' ? 'success' : status === 'RENTED' ? 'info' : 'neutral'
  return (
    <Badge variant={variant} dot>
      {labels[status]}
    </Badge>
  )
}
