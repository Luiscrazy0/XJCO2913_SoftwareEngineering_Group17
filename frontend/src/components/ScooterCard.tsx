import React from 'react'
import Badge from './ui/Badge'
import { Scooter } from '../types'

interface ScooterCardProps {
  scooter: Scooter
  onBook?: (scooter: Scooter) => void
}

const ScooterCard: React.FC<ScooterCardProps> = ({ scooter, onBook }) => {
  const handleBookClick = () => {
    if (onBook) {
      onBook(scooter)
    } else {
      alert(`预约车辆 ${scooter.id} - 预约功能将在下一阶段实现`)
    }
  }

  const getStatusInfo = () => {
    switch (scooter.status) {
      case 'AVAILABLE':
        return { text: '可用', variant: 'success' as const }
      case 'UNAVAILABLE':
        return { text: '不可用', variant: 'danger' as const }
      default:
        return { text: '未知', variant: 'neutral' as const }
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <div className="surface-card surface-lift overflow-hidden flex flex-col h-full group">
      {/* Image area with gradient overlay */}
      <div className="h-48 bg-gradient-to-br from-[var(--bg-input)] via-[var(--bg-card)] to-[var(--bg-main)] flex items-center justify-center relative overflow-hidden">
        {/* Dot pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '16px 16px' }}
        />

        {/* Floating status badge */}
        <div className="absolute top-3 left-3 z-10">
          <Badge variant={statusInfo.variant} dot>{statusInfo.text}</Badge>
        </div>

        {/* Vehicle icon */}
        <svg className="w-20 h-20 text-[var(--mclaren-orange)]/30 relative z-[1] group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--bg-card)] to-transparent" />
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex-1">
          {/* ID line */}
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs text-[var(--text-secondary)] font-mono">ID: {scooter.id.substring(0, 8)}...</span>
            <span className="text-xs text-[var(--text-secondary)]">电动滑板车</span>
          </div>

          {/* Location */}
          <div className="mb-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-[var(--text-secondary)] mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                {scooter.amapAddress ? (
                  <>
                    <p className="text-[var(--text-main)] font-medium text-sm line-clamp-2">{scooter.amapAddress}</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">{scooter.location}</p>
                  </>
                ) : (
                  <p className="text-[var(--text-main)] text-sm line-clamp-2">{scooter.location}</p>
                )}
                {scooter.station && (
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    站点: {scooter.station.name}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={handleBookClick}
          disabled={scooter.status !== 'AVAILABLE'}
          className={`mt-4 w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--mclaren-orange)]/30 ${
            scooter.status === 'AVAILABLE'
              ? 'bg-[var(--mclaren-orange)] text-white hover:brightness-110 hover:shadow-[var(--shadow-3d-hover)]'
              : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border border-[var(--border-line)] cursor-not-allowed'
          }`}
        >
          {scooter.status === 'AVAILABLE' ? '立即预约' : '不可预约'}
        </button>
      </div>
    </div>
  )
}

export default ScooterCard
