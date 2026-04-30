import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingsApi } from '../api/bookings'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/ToastProvider'
import BookingCard from '../components/BookingCard'
import BookingStats from '../components/BookingStats'
import BookingSkeleton from '../components/BookingSkeleton'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import Navbar from '../components/Navbar'
import ExtendBookingModal from '../components/ExtendBookingModal'
import { Booking } from '../types'
import { bookingKeys } from '../utils/queryKeys'

const MyBookingsPage: React.FC = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const navigate = useNavigate()
  
  const [extendModalOpen, setExtendModalOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('ALL') // 筛选状态：ALL, PENDING_PAYMENT, CONFIRMED, COMPLETED, CANCELLED

  const bookingsKey = bookingKeys.list(user?.id ?? null, user?.role ?? null)

  // 获取预约列表
  const {
    data: bookings = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: bookingsKey,
    queryFn: bookingsApi.getMyBookings,
    enabled: !!user?.id, // 只在用户登录时获取
    staleTime: 5 * 60 * 1000, // 5分钟缓存
  })

  // 取消预约的mutation
  const cancelMutation = useMutation({
    mutationFn: bookingsApi.cancel,
    onSuccess: (updatedBooking) => {
      // 更新缓存
      queryClient.setQueryData(bookingsKey, (oldData: any) => {
        if (!oldData) return oldData
        return oldData.map((booking: any) =>
          booking.id === updatedBooking.id ? updatedBooking : booking
        )
      })
      
      showToast('预约已成功取消', 'success')
    },
    onError: (error: any) => {
      showToast(error.message || '取消预约失败', 'error')
    }
  })

  // 续租预约的mutation
  const extendMutation = useMutation({
    mutationFn: ({ id, additionalHours }: { id: string; additionalHours: number }) =>
      bookingsApi.extend(id, { additionalHours }),
    onSuccess: (updatedBooking) => {
      // 更新缓存
      queryClient.setQueryData(bookingsKey, (oldData: any) => {
        if (!oldData) return oldData
        return oldData.map((booking: any) =>
          booking.id === updatedBooking.id ? updatedBooking : booking
        )
      })
      
      showToast('续租成功！', 'success')
      setExtendModalOpen(false)
      setSelectedBooking(null)
    },
    onError: (error: any) => {
      showToast(error.message || '续租失败', 'error')
    }
  })

  // 处理取消预约
  const handleCancelBooking = async (bookingId: string) => {
    if (window.confirm('确定要取消这个预约吗？')) {
      await cancelMutation.mutateAsync(bookingId)
    }
  }

  // 处理续租预约
  const handleExtendBooking = (booking: Booking) => {
    setSelectedBooking(booking)
    setExtendModalOpen(true)
  }

  // 处理续租确认
  const handleExtendConfirm = async (bookingId: string, additionalHours: number) => {
    await extendMutation.mutateAsync({ id: bookingId, additionalHours })
  }

  const payMutation = useMutation({
    mutationFn: ({ bookingId, amount }: { bookingId: string; amount: number }) => bookingsApi.pay(bookingId, amount),
    onSuccess: () => {
      showToast('支付成功！确认邮件已发送', 'success')
      queryClient.invalidateQueries({ queryKey: bookingsKey })
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : '支付失败，请重试'
      showToast(msg, 'error')
    },
  })

  const handlePayBooking = (bookingId: string, amount: number) => {
    payMutation.mutate({ bookingId, amount })
  }

  // 处理浏览车辆
  const handleBrowseScooters = () => {
    navigate('/scooters')
  }

  // 排序预约：待支付 > 已确认（进行中） > 其他状态 > 按时间倒序
  const sortedBookings = React.useMemo(() => {
    if (!bookings.length) return []
    
    // 先筛选
    const filteredBookings = filterStatus === 'ALL' 
      ? bookings 
      : bookings.filter(booking => booking.status === filterStatus)
    
    return [...filteredBookings].sort((a, b) => {
      // 状态优先级映射 - 使用实际存在的BookingStatus
      const statusOrder: Record<string, number> = {
        'PENDING_PAYMENT': 100,  // 最高优先级：待支付
        'CONFIRMED': 90,         // 高优先级：已确认（进行中）
        'EXTENDED': 80,          // 已续租
        'COMPLETED': 70,         // 已完成
        'CANCELLED': 60,         // 已取消
      }
      
      // 按状态优先级排序（降序）
      const statusDiff = (statusOrder[b.status] || 0) - (statusOrder[a.status] || 0)
      if (statusDiff !== 0) return statusDiff
      
      // 相同状态按开始时间倒序（最新的在前）
      return new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    })
  }, [bookings, filterStatus])

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
        
        {/* 状态筛选按钮 */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'ALL'
                  ? 'bg-[var(--mclaren-orange)] text-white'
                  : 'bg-[var(--bg-input)] text-[var(--text-secondary)] hover:bg-white/5'
              }`}
            >
              全部 ({bookings.length})
            </button>
            <button
              onClick={() => setFilterStatus('PENDING_PAYMENT')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'PENDING_PAYMENT'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-[var(--bg-input)] text-[var(--text-secondary)] hover:bg-white/5'
              }`}
            >
              待支付 ({bookings.filter(b => b.status === 'PENDING_PAYMENT').length})
            </button>
            <button
              onClick={() => setFilterStatus('CONFIRMED')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'CONFIRMED'
                  ? 'bg-blue-600 text-white'
                  : 'bg-[var(--bg-input)] text-[var(--text-secondary)] hover:bg-white/5'
              }`}
            >
              已确认 ({bookings.filter(b => b.status === 'CONFIRMED').length})
            </button>
            <button
              onClick={() => setFilterStatus('COMPLETED')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'COMPLETED'
                  ? 'bg-green-600 text-white'
                  : 'bg-[var(--bg-input)] text-[var(--text-secondary)] hover:bg-white/5'
              }`}
            >
              已完成 ({bookings.filter(b => b.status === 'COMPLETED').length})
            </button>
            <button
              onClick={() => setFilterStatus('CANCELLED')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'CANCELLED'
                  ? 'bg-red-600 text-white'
                  : 'bg-[var(--bg-input)] text-[var(--text-secondary)] hover:bg-white/5'
              }`}
            >
              已取消 ({bookings.filter(b => b.status === 'CANCELLED').length})
            </button>
          </div>
        </div>
        
        <div className="space-y-6">
          {sortedBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={handleCancelBooking}
              onPay={handlePayBooking}
              onExtend={handleExtendBooking}
            />
          ))}
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      <Navbar />
      
      {/* 主内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-main)]">我的预约</h1>
            <p className="text-[var(--text-secondary)] mt-2">
              查看和管理您的所有电动车租赁预约
            </p>
          </div>
          <Link to="/payment-methods" className="px-4 py-2 text-sm font-medium text-[var(--mclaren-orange)] hover:text-[var(--mclaren-orange-hover)] hover:bg-white/5 rounded-lg transition-colors">
            支付方式 →
          </Link>
        </div>

        {/* 页面内容 */}
        {renderContent()}

        {/* 续租模态框 */}
        {selectedBooking && (
          <ExtendBookingModal
            booking={selectedBooking}
            isOpen={extendModalOpen}
            onClose={() => {
              setExtendModalOpen(false)
              setSelectedBooking(null)
            }}
            onExtend={handleExtendConfirm}
          />
        )}

        {/* 加载状态指示器 */}
        {(cancelMutation.isPending || extendMutation.isPending) && (
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
