import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import axiosClient from '../../utils/axiosClient'
import { Booking, ApiResponse, Payment } from '../../types'

interface Props {
  isOpen: boolean
  booking: Booking
  onClose: () => void
  onSuccess: (booking: Booking) => void
}

export default function PaymentModal({ isOpen, booking, onClose, onSuccess }: Props) {
  const [error, setError] = useState('')

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const idempotencyKey = `${booking.id}-${Date.now()}`
      const response = await axiosClient.post<ApiResponse<Payment>>('/payments', {
        bookingId: booking.id,
        amount: booking.totalCost,
        idempotencyKey,
      })
      if (!response.data.success) {
        throw new Error(response.data.message || 'Payment failed')
      }
      return response.data.data!
    },
    onSuccess: () => {
      onSuccess(booking)
      onClose()
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || err.message || '支付失败，请重试')
    },
  })

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.currentTarget === e.target) onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4"
      role="dialog"
      aria-modal="true"
      onClick={handleOverlayClick}
    >
      <div className="w-full max-w-md rounded-3xl surface-card p-6 ring-1 ring-[var(--border-line)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-[var(--bg-input)] p-2 text-[var(--text-secondary)] hover:bg-white/10"
        >
          <span className="sr-only">关闭</span>×
        </button>

        <h2 className="text-xl font-bold text-[var(--text-main)]">确认支付</h2>

        <div className="mt-4 rounded-2xl border border-[var(--border-line)] bg-[var(--bg-input)] p-4">
          <p className="text-xs font-medium text-[var(--text-secondary)]">订单摘要</p>
          <div className="mt-2 space-y-1 text-sm text-[var(--text-main)]">
            <p>车辆: {booking.scooterId?.substring(0, 8)}...</p>
            <p>租赁: {booking.hireType === 'HOUR_1' ? '1小时' : booking.hireType === 'HOUR_4' ? '4小时' : booking.hireType === 'DAY_1' ? '1天' : '1周'}</p>
            {booking.pickupStation && <p>取车站点: {booking.pickupStation.name}</p>}
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-[var(--text-secondary)]">应付金额</p>
          <p className="text-3xl font-bold text-[var(--mclaren-orange)]">¥{booking.totalCost.toFixed(2)}</p>
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
            className="flex-1 rounded-2xl border border-[var(--border-line)] px-4 py-3 text-sm font-semibold text-[var(--text-secondary)] hover:border-[var(--mclaren-orange)]"
          >
            取消
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => mutate()}
            className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold text-white ${
              isPending
                ? 'cursor-not-allowed bg-[var(--bg-input)]'
                : 'bg-[var(--mclaren-orange)] hover:brightness-110'
            }`}
          >
            {isPending ? '处理中...' : `确认支付 ¥${booking.totalCost.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  )
}
