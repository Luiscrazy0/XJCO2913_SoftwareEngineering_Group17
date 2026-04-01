import { Scooter } from '../../types'
import Badge from '../ui/Badge'

type Status = Scooter['status']

const labels: Record<Status, string> = {
  AVAILABLE: '可用',
  UNAVAILABLE: '不可用',
}

interface StatusBadgeProps {
  status: Status
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variant = status === 'AVAILABLE' ? 'success' : 'neutral'
  return (
    <Badge variant={variant} dot>
      {labels[status]}
    </Badge>
  )
}
