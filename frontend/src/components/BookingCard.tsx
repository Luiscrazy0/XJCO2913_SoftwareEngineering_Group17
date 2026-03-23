import React from 'react'
import { Booking } from '../types'
import dayjs from 'dayjs'

interface BookingCardProps {
  booking: Booking
  onCancel?: (bookingId: string) => void
  onPay?: (bookingId: string) => void
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, onCancel, onPay }) => {
  // 状态映射函数
  const mapBookingStatus = (status: Booking['status']) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return 'PENDING'
      case 'CONFIRMED':
        return 'CONFIRMED'
      case 'CANCELLED':
        return 'CANCELLED'
      case 'COMPLETED':
        return 'COMPLETED'
    }
  }

  // 获取状态样式
  const getStatusStyle = (status: Booking['status']) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          border: 'border-yellow-200'
        }
      case 'CONFIRMED':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-green-200'
        }
      case 'CANCELLED':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          border: 'border-red-200'
        }
      case 'COMPLETED':
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          border: 'border-gray-200'
        }
    }
  }

  // 格式化时间
  const formatTime = (isoString: string) => {
    return dayjs(isoString).format('MMM D, HH:mm')
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
  const canCancel = booking.status === 'PENDING_PAYMENT'
  const canPay = booking.status === 'PENDING_PAYMENT'

  const statusStyle = getStatusStyle(booking.status)
  const uiStatus = mapBookingStatus(booking.status)

  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden border ${statusStyle.border} hover:shadow-lg transition-shadow duration-300`}>
      {/* 头部状态栏 */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusStyle.bg} ${statusStyle.text}`}>
              {uiStatus}
            </span>
            <span className="text-sm text-gray-500 font-mono">
              ID: {booking.id.substring(0, 8)}...
            </span>
          </div>
          <div className="text-sm text-gray-600">
            租赁类型: <span className="font-medium">{formatHireType(booking.hireType)}</span>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="p-6">
        {/* 时间信息 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">租赁时间</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-gray-600 font-medium">开始时间</span>
              </div>
              <p className="text-gray-900 font-medium">{formatTime(booking.startTime)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-gray-600 font-medium">结束时间</span>
              </div>
              <p className="text-gray-900 font-medium">{formatTime(booking.endTime)}</p>
            </div>
          </div>
        </div>

        {/* 车辆信息 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">车辆信息</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-gray-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <p className="text-gray-700 mb-1">位置: {booking.scooter.location}</p>
                <p className="text-sm text-gray-500">车辆ID: {booking.scooter.id.substring(0, 8)}...</p>
              </div>
            </div>
          </div>
        </div>

        {/* 价格信息 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">费用信息</h3>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-700">总费用</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                £{booking.totalCost.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex space-x-3">
          {canCancel && onCancel && (
            <button
              onClick={() => onCancel(booking.id)}
              className="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
            >
              取消预约
            </button>
          )}
          {canPay && onPay && (
            <button
              onClick={() => onPay(booking.id)}
              className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
            >
              立即支付
            </button>
          )}
          {!canCancel && !canPay && (
            <div className="flex-1 py-3 px-4 text-center text-gray-500">
              无可用操作
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BookingCard