import React from 'react'
import { Booking } from '../types'
import dayjs from 'dayjs'
import Badge from './ui/Badge'
import RideTimer from './booking/RideTimer'

interface BookingCardProps {
  booking: Booking
  onCancel?: (bookingId: string) => void
  onPay?: (bookingId: string) => void
  onExtend?: (booking: Booking) => void
  onStartRide?: (booking: Booking) => void
  onEndRide?: (booking: Booking) => void
}

const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onCancel,
  onPay,
  onExtend,
  onStartRide,
  onEndRide,
}) => {
  const getStatusMeta = (status: Booking['status']) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return { label: '待支付', variant: 'warning' as const }
      case 'CONFIRMED':
        return { label: '已确认', variant: 'success' as const }
      case 'IN_PROGRESS':
        return { label: '骑行中', variant: 'accent' as const }
      case 'CANCELLED':
        return { label: '已取消', variant: 'danger' as const }
      case 'COMPLETED':
        return { label: '已完成', variant: 'neutral' as const }
      case 'EXTENDED':
        return { label: '已续租', variant: 'info' as const }
    }
  }

  const formatTime = (isoString: string) => dayjs(isoString).format('YYYY-MM-DD HH:mm')

  const formatHireType = (hireType: Booking['hireType']) => {
    switch (hireType) {
      case 'HOUR_1': return '1小时'
      case 'HOUR_4': return '4小时'
      case 'DAY_1': return '1天'
      case 'WEEK_1': return '1周'
    }
  }

  const canCancel = booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED'
  const canPay = booking.status === 'PENDING_PAYMENT'
  const canStartRide = booking.status === 'CONFIRMED'
  const canEndRide = booking.status === 'IN_PROGRESS' || booking.status === 'EXTENDED'
  const canExtend = (booking.status === 'CONFIRMED' || booking.status === 'IN_PROGRESS' || booking.status === 'EXTENDED') && onExtend

  const statusMeta = getStatusMeta(booking.status)

  const actionButton = (label: string, color: string, onClick: () => void) => (
    <button
      onClick={onClick}
      className={`flex-1 min-w-[100px] py-3 px-4 rounded-lg font-medium transition-colors duration-200 text-sm md:text-base ${color}`}
    >
      {label}
    </button>
  )

  return (
    <div className="surface-card surface-lift overflow-hidden">
      <div className="px-4 md:px-6 py-4 border-b border-[var(--border-line)]">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center space-x-3">
            <Badge variant={statusMeta.variant} dot>{statusMeta.label}</Badge>
            <span className="text-sm text-[var(--text-secondary)] font-mono">
              ID: {booking.id.substring(0, 8)}...
            </span>
          </div>
          <div className="text-sm text-[var(--text-secondary)]">
            租赁类型: <span className="font-medium text-[var(--text-main)]">{formatHireType(booking.hireType)}</span>
            {booking.extensionCount > 0 && (
              <Badge variant="info" className="ml-2">{booking.extensionCount}次续租</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {/* Riding timer */}
        {booking.status === 'IN_PROGRESS' && booking.actualStartTime && (
          <div className="mb-4 rounded-2xl border border-[var(--mclaren-orange)]/40 bg-[rgba(255,106,0,0.08)] p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--mclaren-orange)] opacity-60" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--mclaren-orange)]" />
                </span>
                骑行中
              </span>
              <RideTimer startTime={booking.actualStartTime} className="text-2xl font-bold text-[var(--mclaren-orange)]" />
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              开始: {formatTime(booking.actualStartTime)} | 预计结束: {formatTime(booking.endTime)}
            </p>
          </div>
        )}

        {/* Station info */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-[var(--text-main)] mb-2">站点信息</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {booking.pickupStation && (
              <div className="bg-[var(--bg-input)] rounded-lg p-3">
                <p className="text-xs text-[var(--text-secondary)]">取车站点</p>
                <p className="text-sm text-[var(--text-main)] font-medium">{booking.pickupStation.name}</p>
                <p className="text-xs text-[var(--text-secondary)]">{booking.pickupStation.address}</p>
              </div>
            )}
            {booking.returnStation && (
              <div className="bg-[var(--bg-input)] rounded-lg p-3">
                <p className="text-xs text-[var(--text-secondary)]">还车站点</p>
                <p className="text-sm text-[var(--text-main)] font-medium">{booking.returnStation.name}</p>
                <p className="text-xs text-[var(--text-secondary)]">{booking.returnStation.address}</p>
              </div>
            )}
            {!booking.pickupStation && !booking.returnStation && booking.scooter.station && (
              <div className="bg-[var(--bg-input)] rounded-lg p-3">
                <p className="text-xs text-[var(--text-secondary)]">车辆站点</p>
                <p className="text-sm text-[var(--text-main)] font-medium">{booking.scooter.station.name}</p>
              </div>
            )}
          </div>
        </div>

        {/* Time info */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-[var(--text-main)] mb-2">租赁时间</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[var(--bg-input)] rounded-lg p-4">
              <p className="text-xs text-[var(--text-secondary)] font-medium">开始时间</p>
              <p className="text-[var(--text-main)] font-medium">{formatTime(booking.startTime)}</p>
            </div>
            <div className="bg-[var(--bg-input)] rounded-lg p-4">
              <p className="text-xs text-[var(--text-secondary)] font-medium">结束时间</p>
              <p className="text-[var(--text-main)] font-medium">{formatTime(booking.endTime)}</p>
              {booking.originalEndTime && (
                <p className="text-xs text-[var(--text-secondary)] mt-1">原结束时间: {formatTime(booking.originalEndTime)}</p>
              )}
            </div>
          </div>
        </div>

        {/* Vehicle info */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-[var(--text-main)] mb-2">车辆信息</h3>
          <div className="bg-[var(--bg-input)] rounded-lg p-4">
            <p className="text-[var(--text-main)]">位置: {booking.scooter.location}</p>
            <p className="text-sm text-[var(--text-secondary)]">车辆ID: {booking.scooter.id.substring(0, 8)}...</p>
          </div>
        </div>

        {/* Price */}
        <div className="mb-4">
          <div className="bg-[rgba(255,106,0,0.08)] rounded-xl p-4 flex justify-between items-center border border-[var(--mclaren-orange)]/20">
            <span className="text-[var(--text-main)] font-medium">费用</span>
            <span className="text-2xl font-bold text-[var(--mclaren-orange)]">¥{booking.totalCost.toFixed(2)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 md:flex md:flex-wrap gap-3">
          {canCancel && onCancel && actionButton('取消预约', 'bg-red-600 text-white hover:bg-red-700', () => onCancel(booking.id))}
          {canPay && onPay && actionButton('立即支付', 'bg-[var(--mclaren-orange)] text-white hover:brightness-110', () => onPay(booking.id))}
          {canStartRide && onStartRide && actionButton('开始骑行', 'bg-emerald-600 text-white hover:bg-emerald-700', () => onStartRide(booking))}
          {canEndRide && onEndRide && actionButton('结束骑行', 'bg-[var(--mclaren-orange)] text-white hover:brightness-110', () => onEndRide(booking))}
          {canExtend && actionButton('续租 +1h', 'bg-blue-600 text-white hover:bg-blue-700', () => onExtend(booking))}
          {booking.status === 'COMPLETED' && (
            <span className="col-span-2 py-3 text-center text-[var(--text-secondary)] text-sm">行程已结束，感谢使用！</span>
          )}
          {booking.status === 'CANCELLED' && (
            <span className="col-span-2 py-3 text-center text-[var(--text-secondary)] text-sm">此订单已取消</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default BookingCard
