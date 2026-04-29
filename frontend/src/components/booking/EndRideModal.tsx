import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { rideApi } from '../../api/ride'
import { stationsApi } from '../../api/stations'
import { Booking } from '../../types'

interface Props {
  isOpen: boolean
  booking: Booking
  onClose: () => void
  onSuccess: (result: { booking: Booking; damageReportCreated: boolean }) => void
}

export default function EndRideModal({ isOpen, booking, onClose, onSuccess }: Props) {
  const [returnStationId, setReturnStationId] = useState('')
  const [isScooterIntact, setIsScooterIntact] = useState(true)
  const [error, setError] = useState('')

  const { data: stationsData } = useQuery({
    queryKey: ['stations-for-return'],
    queryFn: () => stationsApi.getAll(1, 100),
    enabled: isOpen,
  })

  const stations = stationsData?.items || []

  const { mutate, isPending } = useMutation({
    mutationFn: () => rideApi.endRide(booking.id, { returnStationId, isScooterIntact }),
    onSuccess: (result) => {
      onSuccess({ booking: result.booking, damageReportCreated: result.damageReportCreated })
      onClose()
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || err.message || '还车失败')
    },
  })

  useEffect(() => {
    if (isOpen) {
      setReturnStationId(booking.pickupStationId || '')
      setIsScooterIntact(true)
      setError('')
    }
  }, [isOpen, booking.pickupStationId])

  const startTime = booking.actualStartTime ? new Date(booking.actualStartTime) : new Date(booking.startTime)
  const now = new Date()
  const rideMinutes = Math.floor((now.getTime() - startTime.getTime()) / 60000)
  const rideHours = Math.floor(rideMinutes / 60)
  const rideMins = rideMinutes % 60

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => { if (e.currentTarget === e.target) onClose() }}
    >
      <div className="w-full max-w-md rounded-3xl surface-card p-6 ring-1 ring-[var(--border-line)] max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-[var(--bg-input)] p-2 text-[var(--text-secondary)] hover:bg-white/10"
        >
          <span className="sr-only">关闭</span>×
        </button>

        <h2 className="text-xl font-bold text-[var(--text-main)]">结束骑行</h2>

        <div className="mt-4 rounded-2xl border border-[var(--border-line)] bg-[var(--bg-input)] p-4">
          <p className="text-sm text-[var(--text-main)]">🛴 {booking.scooterId?.substring(0, 8)}...</p>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            骑行时长: {rideHours}小时{rideMins}分
          </p>
          <p className="text-sm text-[var(--text-secondary)]">
            已付费用: ¥{booking.totalCost.toFixed(2)}
          </p>
        </div>

        <div className="mt-4">
          <label className="text-sm font-semibold text-[var(--text-main)]">还车站点</label>
          <select
            value={returnStationId}
            onChange={(e) => setReturnStationId(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-[var(--border-line)] bg-[var(--bg-input)] px-4 py-3 text-sm text-[var(--text-main)]"
          >
            <option value="">选择还车站点</option>
            {stations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} - {s.address}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isScooterIntact}
              onChange={(e) => setIsScooterIntact(e.target.checked)}
              className="mt-1 h-4 w-4 rounded accent-[var(--mclaren-orange)]"
            />
            <span className="text-sm text-[var(--text-secondary)]">
              车辆外观完好，已归还至站点
            </span>
          </label>
          {!isScooterIntact && (
            <p className="mt-2 text-xs text-amber-400">取消勾选将自动提交损坏报告</p>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-rose-500/15 px-4 py-3 text-sm text-rose-200">{error}</div>
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
            disabled={!returnStationId || isPending}
            onClick={() => mutate()}
            className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold text-white ${
              !returnStationId || isPending
                ? 'cursor-not-allowed bg-[var(--bg-input)] text-[var(--text-secondary)]'
                : 'bg-[var(--mclaren-orange)] hover:brightness-110'
            }`}
          >
            {isPending ? '处理中...' : '确认还车'}
          </button>
        </div>
      </div>
    </div>
  )
}
