import React from 'react'
import { Booking } from '../types'

interface BookingStatsProps {
  bookings: Booking[]
}

const BookingStats: React.FC<BookingStatsProps> = ({ bookings }) => {
  // 计算统计数据
  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
    pending: bookings.filter(b => b.status === 'PENDING_PAYMENT').length,
    completed: bookings.filter(b => b.status === 'COMPLETED').length,
    cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
  }

  const statCards = [
    {
      title: '总预约数',
      value: stats.total,
      color: 'bg-[linear-gradient(135deg,#FF6A00,#C95000)]',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    {
      title: '待支付',
      value: stats.pending,
      color: 'bg-[linear-gradient(135deg,#F59E0B,#D97706)]',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: '已确认',
      value: stats.confirmed,
      color: 'bg-[linear-gradient(135deg,#10B981,#059669)]',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: '已完成',
      value: stats.completed,
      color: 'bg-[linear-gradient(135deg,#64748B,#475569)]',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    }
  ]

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-[var(--text-main)] mb-6">预约统计</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-stagger">
        {statCards.map((stat, index) => (
          <div key={index} className="surface-card surface-lift p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                {stat.icon}
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-[var(--text-main)]">{stat.value}</div>
                <div className="text-sm text-[var(--text-secondary)]">{stat.title}</div>
              </div>
            </div>
            <div className="text-xs text-[var(--text-secondary)]">
              {stat.title === '总预约数' && '所有预约的总数'}
              {stat.title === '待支付' && '等待支付的预约'}
              {stat.title === '已确认' && '已确认的预约'}
              {stat.title === '已完成' && '已完成的预约'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BookingStats
