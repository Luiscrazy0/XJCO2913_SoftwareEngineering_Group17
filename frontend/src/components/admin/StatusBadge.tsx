import { Scooter } from '../../types'

type Status = Scooter['status']

const styles: Record<Status, string> = {
  AVAILABLE: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30',
  UNAVAILABLE: 'bg-slate-500/15 text-slate-200 border-slate-400/30',
}

const labels: Record<Status, string> = {
  AVAILABLE: '可用',
  UNAVAILABLE: '不可用',
}

interface StatusBadgeProps {
  status: Status
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${styles[status]}`}
    >
      <span
        className={`h-2.5 w-2.5 rounded-full ${
          status === 'AVAILABLE' ? 'bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.18)]' : 'bg-slate-500'
        }`}
      />
      {labels[status]}
    </span>
  )
}
