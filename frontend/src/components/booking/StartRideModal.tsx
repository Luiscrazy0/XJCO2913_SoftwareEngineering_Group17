import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { rideApi } from '../../api/ride'
import { Booking } from '../../types'

interface Props {
  isOpen: boolean
  booking: Booking
  onClose: () => void
  onSuccess: (booking: Booking) => void
}

export default function StartRideModal({ isOpen, booking, onClose, onSuccess }: Props) {
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState('')

  const { mutate, isPending } = useMutation({
    mutationFn: () => rideApi.startRide(booking.id),
    onSuccess: (updated) => {
      onSuccess(updated)
      onClose()
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || err.message || '取车失败')
    },
  })

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => { if (e.currentTarget === e.target) onClose() }}
    >
      <div className="w-full max-w-md rounded-3xl surface-card p-6 ring-1 ring-[var(--border-line)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-[var(--bg-input)] p-2 text-[var(--text-secondary)] hover:bg-white/10"
        >
          <span className="sr-only">关闭</span>×
        </button>

        <h2 className="text-xl font-bold text-[var(--text-main)]">确认取车</h2>

        <div className="mt-4 rounded-2xl border border-[var(--border-line)] bg-[var(--bg-input)] p-4">
          <p className="text-sm text-[var(--text-main)]">
            🛴 {booking.scooterId?.substring(0, 8)}...
          </p>
          {booking.pickupStation && (
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              📍 {booking.pickupStation.name}
            </p>
          )}
        </div>

        <div className="mt-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1 h-4 w-4 rounded accent-[var(--mclaren-orange)]"
            />
            <span className="text-sm text-[var(--text-secondary)]">
              我已到达取车站点，确认车辆外观完好，准备开始骑行。
            </span>
          </label>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-rose-500/15 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-[var(--border-line)] px-4 py-3 text-sm font-semibold text-[var(--text-secondary)]"
          >
            取消
          </button>
          <button
            type="button"
            disabled={!confirmed || isPending}
            onClick={() => mutate()}
            className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold text-white ${
              !confirmed || isPending
                ? 'cursor-not-allowed bg-[var(--bg-input)] text-[var(--text-secondary)]'
                : 'bg-[var(--mclaren-orange)] hover:brightness-110'
            }`}
          >
            {isPending ? '处理中...' : '确认取车，开始骑行'}
          </button>
        </div>
      </div>
    </div>
  )
}
