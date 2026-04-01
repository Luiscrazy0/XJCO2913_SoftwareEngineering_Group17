import { Scooter } from '../../types'

interface FleetStatsProps {
  scooters: Scooter[]
}

export function FleetStats({ scooters }: FleetStatsProps) {
  const total = scooters.length
  const available = scooters.filter((s) => s.status === 'AVAILABLE').length
  const unavailable = total - available

  const cards = [
    {
      title: '总车辆',
      value: total,
      accent: 'from-sky-500 to-blue-600',
      sub: `全部记录`,
      icon: (
        <svg className="h-5 w-5 text-white/90" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 5.5A2.5 2.5 0 014.5 3h11A2.5 2.5 0 0118 5.5v9A2.5 2.5 0 0115.5 17h-11A2.5 2.5 0 012 14.5v-9z" />
        </svg>
      ),
    },
    {
      title: '可用',
      value: available,
      accent: 'from-emerald-500 to-teal-600',
      sub: '可立即派用',
      icon: (
        <svg className="h-5 w-5 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    {
      title: '不可用',
      value: unavailable,
      accent: 'from-amber-400 to-orange-500',
      sub: '维护或下线',
      icon: (
        <svg className="h-5 w-5 text-white/90" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l6.518 11.598C19.02 15.92 18.277 17 17.264 17H2.736c-1.013 0-1.756-1.08-1.997-2.303L7.257 3.1zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-2a1 1 0 01-1-1V7a1 1 0 112 0v3a1 1 0 01-1 1z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.title}
          className="relative overflow-hidden rounded-2xl border border-[var(--border-line)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]"
        >
          <div className={`absolute inset-0 opacity-80 bg-gradient-to-br ${card.accent}`} />
          <div className="relative flex items-center justify-between px-5 py-4">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.15em] text-white/80">{card.title}</p>
              <p className="text-3xl font-semibold text-white drop-shadow-sm">{card.value}</p>
              <p className="text-sm text-white/80">{card.sub}</p>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/15 backdrop-blur-sm">
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
