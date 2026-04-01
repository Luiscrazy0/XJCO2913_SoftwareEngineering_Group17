import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingsApi } from '../api/bookings'
import { useAuth } from '../context/AuthContext'
import BookingCard from '../components/BookingCard'
import BookingStats from '../components/BookingStats'
import BookingSkeleton from '../components/BookingSkeleton'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import Navbar from '../components/Navbar'

const MyBookingsPage: React.FC = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [notification, setNotification] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  // 获取预约列表
  const {
    data: bookings = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['bookings'],
    queryFn: bookingsApi.getMyBookings,
    enabled: !!user, // 只在用户登录时获取
    staleTime: 5 * 60 * 1000, // 5分钟缓存
  })

  // 取消预约的mutation
  const cancelMutation = useMutation({
    mutationFn: bookingsApi.cancel,
    onSuccess: (updatedBooking) => {
      // 更新缓存
      queryClient.setQueryData(['bookings'], (oldData: any) => {
        if (!oldData) return oldData
        return oldData.map((booking: any) =>
          booking.id === updatedBooking.id ? updatedBooking : booking
        )
      })
      
      setNotification({
        type: 'success',
        message: '预约已成功取消'
      })
      
      // 3秒后清除通知
      setTimeout(() => setNotification(null), 3000)
    },
    onError: (error: any) => {
      setNotification({
        type: 'error',
        message: error.message || '取消预约失败'
      })
      
      // 3秒后清除通知
      setTimeout(() => setNotification(null), 3000)
    }
  })

  // 处理取消预约
  const handleCancelBooking = async (bookingId: string) => {
    if (window.confirm('确定要取消这个预约吗？')) {
      await cancelMutation.mutateAsync(bookingId)
    }
  }

  // 处理支付（暂未实现）
  const handlePayBooking = (bookingId: string) => {
    alert(`支付功能将在下一阶段实现 - Booking ID: ${bookingId}`)
  }

  // 处理浏览车辆
  const handleBrowseScooters = () => {
    // 这里可以导航到车辆发现页面
    window.location.href = '/scooters'
  }

  // 显示通知
  const renderNotification = () => {
    if (!notification) return null

    const bgColor = notification.type === 'success' ? 'bg-emerald-500/15 border-emerald-400/30' : 'bg-rose-500/15 border-rose-400/30'
    const textColor = notification.type === 'success' ? 'text-emerald-200' : 'text-rose-200'
    const iconColor = notification.type === 'success' ? 'text-emerald-200' : 'text-rose-200'

    return (
      <div className={`fixed top-4 right-4 z-50 border rounded-lg p-4 shadow-lg ${bgColor} ${textColor} max-w-md`}>
        <div className="flex items-center">
          {notification.type === 'success' ? (
            <svg className={`w-5 h-5 mr-2 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className={`w-5 h-5 mr-2 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span>{notification.message}</span>
        </div>
      </div>
    )
  }

  // 渲染页面内容
  const renderContent = () => {
    if (isLoading) {
      return <BookingSkeleton />
    }

    if (isError) {
      return (
        <ErrorState
          message={error?.message || '无法加载预约数据'}
          onRetry={refetch}
        />
      )
    }

    if (bookings.length === 0) {
      return (
        <EmptyState
          onAction={handleBrowseScooters}
        />
      )
    }

    return (
      <>
        <BookingStats bookings={bookings} />
        <div className="space-y-6">
          {bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={handleCancelBooking}
              onPay={handlePayBooking}
            />
          ))}
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      <Navbar />
      
      {/* 通知 */}
      {renderNotification()}

      {/* 主内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-main)]">我的预约</h1>
          <p className="text-[var(--text-secondary)] mt-2">
            查看和管理您的所有电动车租赁预约
          </p>
        </div>

        {/* 页面内容 */}
        {renderContent()}

        {/* 加载状态指示器 */}
        {cancelMutation.isPending && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[var(--bg-card)] rounded-lg p-6 shadow-xl border border-[var(--border-line)]">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--mclaren-orange)] mr-3"></div>
                <span className="text-[var(--text-secondary)]">正在处理...</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default MyBookingsPage
