import React from 'react'
import { Booking } from '../types'
import dayjs from 'dayjs'
import Badge from './ui/Badge'

interface BookingCardProps {
  booking: Booking
  onCancel?: (bookingId: string) => void
  onPay?: (bookingId: string, amount: number) => void
  onExtend?: (booking: Booking) => void
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, onCancel, onPay, onExtend }) => {
  // 状态映射函数
  // 获取状态信息
  const getStatusMeta = (status: Booking['status']) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return {
          label: '待支付',
          variant: 'warning' as const,
        }
      case 'CONFIRMED':
        return {
          label: '已确认',
          variant: 'success' as const,
          showEmailIcon: true,
        }
      case 'CANCELLED':
        return {
          label: '已取消',
          variant: 'danger' as const,
        }
      case 'COMPLETED':
        return {
          label: '已完成',
          variant: 'neutral' as const,
        }
      case 'EXTENDED':
        return {
          label: '已续租',
          variant: 'info' as const,
        }
    }
  }

  // 格式化时间
  const formatTime = (isoString: string) => {
    return dayjs(isoString).format('YYYY-MM-DD HH:mm')
  }

  // 格式化租赁类型
  const formatHireType = (hireType: Booking['hireType']) => {
    switch (hireType) {
      case 'HOUR_1':
        return '1小时'
      case 'HOUR_4':
        return '4小时'
      case 'DAY_1':
        return '1天'
      case 'WEEK_1':
        return '1周'
    }
  }

  // 业务逻辑判断
  // Allow cancel unless already completed or cancelled; payment still only when pending
  const canCancel = booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED'
  const canPay = booking.status === 'PENDING_PAYMENT'
  const canExtend = (booking.status === 'CONFIRMED' || booking.status === 'EXTENDED') && onExtend

  const statusMeta = getStatusMeta(booking.status)

  return (
    <div className="surface-card surface-lift overflow-hidden">
      {/* 头部状态栏 */}
      <div className="px-6 py-4 border-b border-[var(--border-line)]">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="flex items-center gap-2">
              <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
              {statusMeta.showEmailIcon && (
                <span title="确认邮件已发送" className="text-lg cursor-help">📧</span>
              )}
            </div>
            <span className="text-sm text-[var(--text-secondary)] font-mono">
              ID: {booking.id.substring(0, 8)}...
            </span>
          </div>
          <div className="text-sm text-[var(--text-secondary)]">
            租赁类型: <span className="font-medium text-[var(--text-main)]">{formatHireType(booking.hireType)}</span>
            {booking.extensionCount > 0 && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                已续租 {booking.extensionCount} 次
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="p-6">
        {/* 时间信息 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-[var(--text-main)] mb-3">租赁时间</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[var(--bg-input)] rounded-lg p-4">
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 text-[var(--mclaren-orange)] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-[var(--text-secondary)] font-medium">开始时间</span>
              </div>
              <p className="text-[var(--text-main)] font-medium">{formatTime(booking.startTime)}</p>
            </div>
            <div className="bg-[var(--bg-input)] rounded-lg p-4">
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 text-[var(--mclaren-orange)] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-[var(--text-secondary)] font-medium">结束时间</span>
              </div>
              <p className="text-[var(--text-main)] font-medium">{formatTime(booking.endTime)}</p>
              {booking.originalEndTime && (
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  原结束时间: {formatTime(booking.originalEndTime)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 车辆信息 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-[var(--text-main)] mb-3">车辆信息</h3>
          <div className="bg-[var(--bg-input)] rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-[var(--text-secondary)] mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <p className="text-[var(--text-main)] mb-1">位置: {booking.scooter.location}</p>
                <p className="text-sm text-[var(--text-secondary)]">车辆ID: {booking.scooter.id.substring(0, 8)}...</p>
                {booking.scooter.station && (
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    站点: {booking.scooter.station.name}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 价格信息 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-[var(--text-main)] mb-3">费用信息</h3>
          <div className="bg-[rgba(255,106,0,0.12)] rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-[var(--mclaren-orange)] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-[var(--text-main)]">总费用</span>
              </div>
              <div className="text-2xl font-bold text-[var(--mclaren-orange)]">
                ¥{booking.totalCost.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-wrap gap-3">
          {canCancel && onCancel && (
            <button
              onClick={() => onCancel(booking.id)}
              className="flex-1 min-w-[120px] py-3 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 focus:ring-2 focus:ring-red-500/40 transition-colors duration-200"
            >
              取消预约
            </button>
          )}
          {canPay && onPay && (
            <button
              onClick={() => onPay(booking.id, booking.totalCost)}
              className="flex-1 min-w-[120px] py-3 px-4 bg-[var(--mclaren-orange)] text-white rounded-lg font-medium hover:brightness-110 focus:ring-2 focus:ring-[var(--mclaren-orange)]/40 transition-colors duration-200"
            >
              立即支付
            </button>
          )}
          {canExtend && (
            <button
              onClick={() => onExtend(booking)}
              className="flex-1 min-w-[120px] py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/40 transition-colors duration-200"
            >
              续租
            </button>
          )}
          {!canCancel && !canPay && !canExtend && (
            <div className="flex-1 py-3 px-4 text-center text-[var(--text-secondary)]">
              无可用操作
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BookingCard
