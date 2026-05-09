import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { bookingsApi } from '../api/bookings'
import { HireType, Scooter } from '../types'
import { useAuth } from '../context/AuthContext'
import { bookingKeys, scooterKeys } from '../utils/queryKeys'
import PriceEstimate from './booking/PriceEstimate'

interface BookingModalProps {
  isOpen: boolean
  scooter: Scooter
  onClose: () => void
  onBookingSuccess?: () => void
}

const hireTypeOptions: {
  value: HireType
  label: string
  description: string
  durationMinutes: number
}[] = [
  { value: 'HOUR_1', label: '1 小时', description: '轻量体验', durationMinutes: 60 },
  { value: 'HOUR_4', label: '4 小时', description: '半天出行', durationMinutes: 240 },
  { value: 'DAY_1', label: '1 天', description: '全天使用', durationMinutes: 1440 },
  { value: 'WEEK_1', label: '1 周', description: '长租优选', durationMinutes: 10080 },
]

const toDatetimeLocal = (date: Date) => {
  const timeOffset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - timeOffset * 60000)
  return local.toISOString().slice(0, 16)
}

const getInitialStartTime = () => {
  const now = new Date()
  now.setMinutes(now.getMinutes() + 15)
  return toDatetimeLocal(now)
}

export default function BookingModal({ isOpen, scooter, onClose, onBookingSuccess }: BookingModalProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [selectedHireType, setSelectedHireType] = useState<HireType>('HOUR_1')
  const [startTime, setStartTime] = useState<string>(getInitialStartTime)
  const [formError, setFormError] = useState<string>('')

  const successTimer = useRef<number | null>(null)

  const minStartTime = useMemo(() => toDatetimeLocal(new Date()), [isOpen])
  const selectedDuration = useMemo(() => {
    return hireTypeOptions.find((o) => o.value === selectedHireType)?.durationMinutes ?? 60
  }, [selectedHireType])

  const {
    mutate: createBooking,
    reset: resetBookingMutation,
    isPending,
    isSuccess,
    isError,
    error: mutationError,
  } = useMutation({
    mutationFn: (payload: Parameters<typeof bookingsApi.create>[0]) => bookingsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scooterKeys.all })
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: bookingKeys.list(user.id, user.role) })
      }
    },
  })

  const friendlyErrorMessage = useMemo(() => {
    if (isError) {
      if (mutationError instanceof Error && mutationError.message) {
        try {
          if ('response' in mutationError) {
            const axiosError = mutationError as any
            const errorData = axiosError.response?.data
            if (errorData?.message) return `预约失败: ${errorData.message}`
          }
        } catch {}
        return mutationError.message
      }
      return '预约失败，请稍后重试'
    }
    return ''
  }, [isError, mutationError])

  const statusMessage = useMemo(() => {
    if (isPending) return '正在创建预约...'
    if (isSuccess) return ''
    if (formError) return formError
    if (friendlyErrorMessage) return friendlyErrorMessage
    return ''
  }, [isPending, isSuccess, friendlyErrorMessage, formError])

  const statusState = useMemo(() => {
    if (isPending) return 'loading'
    if (isSuccess) return 'success'
    if (friendlyErrorMessage || formError) return 'error'
    return 'idle'
  }, [isPending, isSuccess, friendlyErrorMessage, formError])

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (!user) { setFormError('用户信息缺失，请重新登录'); return }
      if (scooter.status !== 'AVAILABLE') { setFormError('该车辆已被他人预约，请选择其他车辆'); return }
      const parsedStart = new Date(startTime)
      if (isNaN(parsedStart.getTime())) { setFormError('请选择有效的开始时间'); return }
      if (parsedStart < new Date()) { setFormError('开始时间不能早于当前时间'); return }
      setFormError('')
      createBooking({ scooterId: scooter.id, hireType: selectedHireType, startTime: parsedStart.toISOString() })
    },
    [createBooking, selectedHireType, scooter.id, startTime, user],
  )

  useEffect(() => {
    if (!isOpen) {
      resetBookingMutation()
      setStartTime(getInitialStartTime())
      setSelectedHireType('HOUR_1')
      setFormError('')
    }
  }, [isOpen, resetBookingMutation])

  useEffect(() => {
    if (isSuccess) {
      if (successTimer.current) window.clearTimeout(successTimer.current)
      successTimer.current = null
    }
    return () => { if (successTimer.current) { window.clearTimeout(successTimer.current); successTimer.current = null } }
  }, [isSuccess, navigate, onBookingSuccess, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-8"
      role="dialog"
      aria-modal="true"
      onClick={(e) => { if (e.currentTarget === e.target) onClose() }}
    >
      <div className="relative w-full max-w-2xl rounded-3xl surface-card p-6 ring-1 ring-[var(--border-line)] max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-[var(--bg-input)] p-2 text-[var(--text-secondary)] hover:bg-white/10"
        >
          <span className="sr-only">关闭弹窗</span>×
        </button>

        <h2 className="text-2xl font-bold text-[var(--text-main)]">预约滑板车</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">确认信息后提交预约请求</p>

        <section className="mt-6 rounded-2xl border border-[var(--border-line)] bg-[var(--bg-input)] p-4">
          <p className="text-xs font-medium text-[var(--text-secondary)]">车辆信息</p>
          <div className="mt-2 space-y-1">
            <p className="text-sm text-[var(--text-main)]">🛴 Scooter #{scooter.id.substring(0, 8)}...</p>
            {scooter.station && (
              <p className="text-sm text-[var(--text-secondary)]">
                📍 取车地点: {scooter.station.name} ({scooter.station.address})
              </p>
            )}
            <p className="text-xs text-[var(--text-secondary)]">{scooter.location}</p>
          </div>
        </section>

        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--text-main)]">租赁类型</h3>
            <span className="text-xs text-[var(--text-secondary)]">总共 {selectedDuration / 60} 小时</span>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {hireTypeOptions.map((option) => {
              const isSelected = option.value === selectedHireType
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedHireType(option.value)}
                  className={`flex flex-col rounded-2xl border px-4 py-3 text-left transition ${
                    isSelected
                      ? 'border-[var(--mclaren-orange)] bg-[rgba(255,106,0,0.12)] text-[var(--text-main)] shadow-sm'
                      : 'border-[var(--border-line)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--mclaren-orange)]'
                  }`}
                >
                  <span className="text-base font-semibold">{option.label}</span>
                  <span className="text-xs text-[var(--text-secondary)]">{option.description}</span>
                </button>
              )
            })}
          </div>
        </section>

        <section className="mt-6">
          <PriceEstimate hireType={selectedHireType} />
        </section>

        <form onSubmit={handleSubmit}>
          <section className="mt-6">
            <label htmlFor="startTime" className="text-sm font-semibold text-[var(--text-main)]">
              开始时间
            </label>
            <input
              id="startTime"
              name="startTime"
              type="datetime-local"
              value={startTime}
              min={minStartTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-[var(--border-line)] bg-[var(--bg-input)] px-4 py-3 text-sm text-[var(--text-main)] focus:border-[var(--mclaren-orange)] focus:outline-none focus:ring-2 focus:ring-[var(--mclaren-orange)]/20"
            />
            <p className="mt-1 text-xs text-[var(--text-secondary)]">支持未来 2 周内的开始时间</p>
          </section>

          {(statusMessage || isSuccess) && (
            <div
              aria-live="polite"
              className={`mt-6 rounded-2xl p-4 text-sm ${
                statusState === 'loading'
                  ? 'bg-[var(--bg-input)] text-[var(--text-secondary)]'
                  : statusState === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-200'
              }`}
            >
              {statusState === 'success' ? (
                <div className="text-center">
                  <div className="text-4xl mb-3">✅</div>
                  <p className="font-bold text-emerald-300 text-base mb-2">预约成功！</p>
                  <p className="text-[var(--text-secondary)] text-xs mb-4">您的预约已创建，请前往「我的预约」完成支付后即可取车。</p>
                  <button
                    type="button"
                    onClick={() => { onBookingSuccess?.(); onClose(); navigate('/bookings') }}
                    className="mclaren-btn-3d px-6 py-2.5 text-sm w-full"
                  >
                    查看我的预约 →
                  </button>
                </div>
              ) : (
                statusMessage
              )}
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-[var(--border-line)] px-5 py-3 text-sm font-semibold text-[var(--text-secondary)] hover:border-[var(--mclaren-orange)]"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isPending}
              className={`rounded-2xl px-5 py-3 text-sm font-semibold text-white transition ${
                isPending
                  ? 'cursor-not-allowed bg-[var(--bg-input)] text-[var(--text-secondary)]'
                  : 'bg-[var(--mclaren-orange)] hover:brightness-110 focus:ring-2 focus:ring-[var(--mclaren-orange)]/30'
              }`}
            >
              {isPending ? '处理中...' : '确认预约并支付 →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
