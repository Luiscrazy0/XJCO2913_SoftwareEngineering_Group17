import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { bookingsApi } from '../api/bookings'
import { HireType, Scooter } from '../types'
import { useAuth } from '../context/AuthContext'

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
  {
    value: 'HOUR_1',
    label: '1 小时',
    description: '轻量体验',
    durationMinutes: 60,
  },
  {
    value: 'HOUR_4',
    label: '4 小时',
    description: '半天出行',
    durationMinutes: 240,
  },
  {
    value: 'DAY_1',
    label: '1 天',
    description: '全天使用',
    durationMinutes: 1440,
  },
  {
    value: 'WEEK_1',
    label: '1 周',
    description: '长租优选',
    durationMinutes: 10080,
  },
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
    return hireTypeOptions.find((option) => option.value === selectedHireType)?.durationMinutes ?? 60
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
      queryClient.invalidateQueries({ queryKey: ['scooters'] })
    },
  })

  const friendlyErrorMessage = useMemo(() => {
    if (isError) {
      if (mutationError instanceof Error && mutationError.message) {
        // 尝试解析API错误响应
        try {
          if ('response' in mutationError) {
            const axiosError = mutationError as any;
            const errorData = axiosError.response?.data;
            if (errorData?.message) {
              return `预约失败: ${errorData.message}`;
            }
          }
        } catch (e) {
          // 如果解析失败，使用原始错误消息
        }
        return mutationError.message;
      }
      return '预约失败，请稍后重试';
    }
    return '';
  }, [isError, mutationError])

  const statusMessage = useMemo(() => {
    if (isPending) {
      return '正在创建预约...'
    }
    if (isSuccess) {
      return '预约成功！即将跳转到我的预约'
    }
    if (formError) {
      return formError
    }
    if (friendlyErrorMessage) {
      return friendlyErrorMessage
    }
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

      if (!user) {
        setFormError('用户信息缺失，请重新登录')
        return
      }

      const parsedStart = new Date(startTime)
      if (isNaN(parsedStart.getTime())) {
        setFormError('请选择有效的开始时间')
        return
      }

      const now = new Date()
      if (parsedStart < now) {
        setFormError('开始时间不能早于当前时间')
        return
      }

      setFormError('')

      createBooking({
        userId: user.id,
        scooterId: scooter.id,
        hireType: selectedHireType,
        startTime: parsedStart.toISOString(),
      })
    },
    [createBooking, selectedHireType, scooter.id, startTime, user],
  )

  const handleHireTypeChange = (value: HireType) => {
    setSelectedHireType(value)
  }

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.currentTarget === event.target) {
      onClose()
    }
  }

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
      if (successTimer.current) {
        window.clearTimeout(successTimer.current)
      }
      successTimer.current = window.setTimeout(() => {
        onBookingSuccess?.()
        onClose()
        navigate('/my-bookings')
      }, 1400)
    }

    return () => {
      if (successTimer.current) {
        window.clearTimeout(successTimer.current)
        successTimer.current = null
      }
    }
  }, [isSuccess, navigate, onBookingSuccess, onClose])

  if (!isOpen) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-8"
      role="dialog"
      aria-modal="true"
      onClick={handleOverlayClick}
    >
      <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          <span className="sr-only">关闭弹窗</span>
          ×
        </button>

        <h2 className="text-2xl font-bold text-slate-900">预约滑板车</h2>
        <p className="mt-1 text-sm text-slate-500">确认信息后提交预约请求</p>

        <section className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">车辆信息</p>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800">ID</p>
              <p className="text-xs text-slate-500">{scooter.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">位置</p>
              <p className="text-xs text-slate-500">{scooter.location}</p>
            </div>
          </div>
        </section>

        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">租赁类型</h3>
            <span className="text-xs text-slate-500">总共 {selectedDuration / 60} 小时</span>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {hireTypeOptions.map((option) => {
              const isSelected = option.value === selectedHireType
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => handleHireTypeChange(option.value)}
                  className={`flex flex-col rounded-2xl border px-4 py-3 text-left transition ${
                    isSelected
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-900 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="text-base font-semibold">{option.label}</span>
                  <span className="text-xs text-slate-500">{option.description}</span>
                </button>
              )
            })}
          </div>
        </section>

        <form onSubmit={handleSubmit}>
          <section className="mt-6">
            <label htmlFor="startTime" className="text-sm font-semibold text-slate-700">
              开始时间
            </label>
            <input
              id="startTime"
              name="startTime"
              type="datetime-local"
              value={startTime}
              min={minStartTime}
              onChange={(event) => setStartTime(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
            <p className="mt-1 text-xs text-slate-500">支持未来 2 周内的开始时间</p>
          </section>

          {statusMessage && (
            <div
              aria-live="polite"
              className={`mt-6 rounded-2xl px-4 py-3 text-sm ${
                statusState === 'loading'
                  ? 'bg-slate-100 text-slate-700'
                  : statusState === 'success'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {statusMessage}
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isPending}
              className={`rounded-2xl px-5 py-3 text-sm font-semibold text-white transition ${
                isPending
                  ? 'cursor-not-allowed bg-emerald-200'
                  : 'bg-emerald-500 hover:bg-emerald-600 focus:ring-2 focus:ring-emerald-300'
              }`}
            >
              {isPending ? '处理中...' : '确认预约'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
