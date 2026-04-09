import React, { useState } from 'react'
import { Booking } from '../types'
import { useToast } from './ToastProvider'

interface ExtendBookingModalProps {
  booking: Booking
  isOpen: boolean
  onClose: () => void
  onExtend: (bookingId: string, additionalHours: number) => Promise<void>
}

const ExtendBookingModal: React.FC<ExtendBookingModalProps> = ({
  booking,
  isOpen,
  onClose,
  onExtend,
}) => {
  const { showToast } = useToast()
  const [additionalHours, setAdditionalHours] = useState<number>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  // 计算续租费用
  const calculateExtensionCost = (hours: number) => {
    return hours * 5 // 每小时5元
  }

  // 计算新的结束时间
  const calculateNewEndTime = (hours: number) => {
    const currentEndTime = new Date(booking.endTime)
    const newEndTime = new Date(currentEndTime.getTime() + hours * 60 * 60 * 1000)
    return newEndTime
  }

  // 处理续租
  const handleExtend = async () => {
    if (additionalHours < 1 || additionalHours > 24) {
      showToast('续租时间必须在1-24小时之间', 'error')
      return
    }

    setIsSubmitting(true)
    try {
      await onExtend(booking.id, additionalHours)
      showToast('续租成功！', 'success')
      onClose()
    } catch (error: any) {
      showToast(error.message || '续租失败', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 格式化时间
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-line)] w-full max-w-md">
        {/* 模态框头部 */}
        <div className="px-6 py-4 border-b border-[var(--border-line)]">
          <h2 className="text-xl font-semibold text-[var(--text-main)]">续租滑板车</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            延长您的滑板车使用时间
          </p>
        </div>

        {/* 模态框内容 */}
        <div className="p-6">
          {/* 当前预订信息 */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">当前预订信息</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">车辆编号：</span>
                <span className="font-medium">{booking.scooter.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">当前位置：</span>
                <span>{booking.scooter.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">当前结束时间：</span>
                <span>{formatDateTime(booking.endTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">已续租次数：</span>
                <span>{booking.extensionCount} 次</span>
              </div>
            </div>
          </div>

          {/* 续租设置 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-main)] mb-2">
                续租小时数
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="1"
                  max="24"
                  step="1"
                  value={additionalHours}
                  onChange={(e) => setAdditionalHours(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="w-16 text-center font-medium text-[var(--text-main)]">
                  {additionalHours} 小时
                </span>
              </div>
              <div className="flex justify-between text-xs text-[var(--text-secondary)] mt-1">
                <span>1小时</span>
                <span>24小时</span>
              </div>
            </div>

            {/* 快速选择按钮 */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-main)] mb-2">
                快速选择
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 4, 8].map((hours) => (
                  <button
                    key={hours}
                    type="button"
                    onClick={() => setAdditionalHours(hours)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                      additionalHours === hours
                        ? 'bg-[var(--mclaren-orange)] text-white border-[var(--mclaren-orange)]'
                        : 'bg-[var(--bg-input)] text-[var(--text-main)] border-[var(--border-line)] hover:border-[var(--mclaren-orange)]'
                    }`}
                  >
                    {hours}小时
                  </button>
                ))}
              </div>
            </div>

            {/* 费用计算 */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-[var(--text-main)] mb-2">费用明细</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">原费用：</span>
                  <span>¥{booking.totalCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">续租费用：</span>
                  <span>¥{calculateExtensionCost(additionalHours).toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between font-medium">
                    <span>总费用：</span>
                    <span className="text-[var(--mclaren-orange)]">
                      ¥{(booking.totalCost + calculateExtensionCost(additionalHours)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 新结束时间 */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm text-green-700">新的结束时间：</span>
                  <p className="font-medium text-green-800">
                    {formatDateTime(calculateNewEndTime(additionalHours).toISOString())}
                  </p>
                </div>
                <div className="text-green-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 模态框底部 */}
        <div className="px-6 py-4 border-t border-[var(--border-line)] flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-[var(--text-main)] bg-[var(--bg-input)] border border-[var(--border-line)] rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleExtend}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-[var(--mclaren-orange)] rounded-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                处理中...
              </>
            ) : (
              `确认续租 (¥${calculateExtensionCost(additionalHours).toFixed(2)})`
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExtendBookingModal