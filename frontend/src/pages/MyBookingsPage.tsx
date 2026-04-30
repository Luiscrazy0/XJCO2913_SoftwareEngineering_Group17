import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingsApi } from '../api/bookings'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/ToastProvider'
import BookingCard from '../components/BookingCard'
import BookingStats from '../components/BookingStats'
import BookingSkeleton from '../components/BookingSkeleton'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import PageLayout from '../components/PageLayout'
import ExtendBookingModal from '../components/ExtendBookingModal'
import PaymentModal from '../components/booking/PaymentModal'
import StartRideModal from '../components/booking/StartRideModal'
import EndRideModal from '../components/booking/EndRideModal'
import { Booking } from '../types'
import { bookingKeys } from '../utils/queryKeys'

const PAGE_SIZE = 10

const MyBookingsPage: React.FC = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [page, setPage] = useState(1)
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [extendModalOpen, setExtendModalOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [paymentBooking, setPaymentBooking] = useState<Booking | null>(null)
  const [startRideBooking, setStartRideBooking] = useState<Booking | null>(null)
  const [endRideBooking, setEndRideBooking] = useState<Booking | null>(null)

  const bookingsKey = bookingKeys.list(user?.id ?? null, user?.role ?? null)

  const {
    data: pagedData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [...bookingsKey, page],
    queryFn: () => bookingsApi.getMyBookings(page, PAGE_SIZE),
    enabled: !!user?.id,
    staleTime: 30000,
  })

  const bookings = pagedData?.items ?? []
  const totalPages = pagedData?.totalPages ?? 1
  const totalItems = pagedData?.total ?? 0

  const cancelMutation = useMutation({
    mutationFn: bookingsApi.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingsKey })
      showToast('预约已成功取消', 'success')
    },
    onError: (error: any) => {
      showToast(error.message || '取消预约失败', 'error')
    },
  })

  const extendMutation = useMutation({
    mutationFn: ({ id, additionalHours }: { id: string; additionalHours: number }) =>
      bookingsApi.extend(id, { additionalHours }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingsKey })
      showToast('续租成功！', 'success')
      setExtendModalOpen(false)
      setSelectedBooking(null)
    },
    onError: (error: any) => {
      showToast(error.message || '续租失败', 'error')
    },
  })

  const handleCancelBooking = async (bookingId: string) => {
    if (window.confirm('确定要取消这个预约吗？')) {
      await cancelMutation.mutateAsync(bookingId)
    }
  }

  const handlePayBooking = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId)
    if (booking) setPaymentBooking(booking)
  }

  const handlePaymentSuccess = (_booking: Booking) => {
    queryClient.invalidateQueries({ queryKey: bookingsKey })
    showToast('支付成功！订单已确认', 'success')
  }

  const handleExtendBooking = (booking: Booking) => {
    setSelectedBooking(booking)
    setExtendModalOpen(true)
  }

  const handleExtendConfirm = async (bookingId: string, additionalHours: number) => {
    await extendMutation.mutateAsync({ id: bookingId, additionalHours })
  }

  const handleStartRide = (booking: Booking) => {
    setStartRideBooking(booking)
  }

  const handleStartRideSuccess = (_updated: Booking) => {
    queryClient.invalidateQueries({ queryKey: bookingsKey })
    showToast('骑行已开始！', 'success')
  }

  const handleEndRide = (booking: Booking) => {
    setEndRideBooking(booking)
  }

  const handleEndRideSuccess = (result: { booking: Booking; damageReportCreated: boolean }) => {
    queryClient.invalidateQueries({ queryKey: bookingsKey })
    if (result.damageReportCreated) {
      showToast('还车成功，已自动提交损坏报告', 'warning')
    } else {
      showToast('骑行已结束，感谢使用！', 'success')
    }
  }

  const filteredBookings = useMemo(() => {
    if (filterStatus === 'ALL') return bookings
    return bookings.filter(b => b.status === filterStatus)
  }, [bookings, filterStatus])

  const renderContent = () => {
    if (isLoading) return <BookingSkeleton />
    if (isError) return <ErrorState message={error?.message || '无法加载预约数据'} onRetry={refetch} />
    if (bookings.length === 0) {
      return <EmptyState onAction={() => navigate('/scooters')} />
    }

    const statusCounts: Record<string, number> = {}
    bookings.forEach(b => { statusCounts[b.status] = (statusCounts[b.status] || 0) + 1 })

    const filterButtons = [
      { key: 'ALL', label: '全部', count: totalItems },
      { key: 'PENDING_PAYMENT', label: '待支付', count: statusCounts['PENDING_PAYMENT'] || 0 },
      { key: 'CONFIRMED', label: '已确认', count: statusCounts['CONFIRMED'] || 0 },
      { key: 'IN_PROGRESS', label: '骑行中', count: statusCounts['IN_PROGRESS'] || 0 },
      { key: 'EXTENDED', label: '已续租', count: statusCounts['EXTENDED'] || 0 },
      { key: 'COMPLETED', label: '已完成', count: statusCounts['COMPLETED'] || 0 },
      { key: 'CANCELLED', label: '已取消', count: statusCounts['CANCELLED'] || 0 },
    ]

    const filterColors: Record<string, string> = {
      ALL: 'bg-[var(--mclaren-orange)] text-white',
      PENDING_PAYMENT: 'bg-yellow-600 text-white',
      CONFIRMED: 'bg-blue-600 text-white',
      IN_PROGRESS: 'bg-purple-600 text-white',
      EXTENDED: 'bg-cyan-600 text-white',
      COMPLETED: 'bg-green-600 text-white',
      CANCELLED: 'bg-red-600 text-white',
    }

    return (
      <>
        <BookingStats bookings={bookings} />

        <div className="mb-6 flex flex-wrap gap-2">
          {filterButtons.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => { setFilterStatus(key); setPage(1) }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === key
                  ? filterColors[key] || 'bg-[var(--mclaren-orange)] text-white'
                  : 'bg-[var(--bg-input)] text-[var(--text-secondary)] hover:bg-white/5'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {filteredBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={handleCancelBooking}
              onPay={handlePayBooking}
              onExtend={handleExtendBooking}
              onStartRide={handleStartRide}
              onEndRide={handleEndRide}
            />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-4 py-2 rounded-lg bg-[var(--bg-input)] text-[var(--text-secondary)] disabled:opacity-40"
            >
              上一页
            </button>
            <span className="px-4 py-2 text-sm text-[var(--text-secondary)]">
              第 {page} / {totalPages} 页
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="px-4 py-2 rounded-lg bg-[var(--bg-input)] text-[var(--text-secondary)] disabled:opacity-40"
            >
              下一页
            </button>
          </div>
        )}
      </>
    )
  }

  return (
    <PageLayout title="我的预约" subtitle="查看和管理您的所有电动车租赁预约">
      {renderContent()}

        {selectedBooking && (
          <ExtendBookingModal
            booking={selectedBooking}
            isOpen={extendModalOpen}
            onClose={() => { setExtendModalOpen(false); setSelectedBooking(null) }}
            onExtend={handleExtendConfirm}
          />
        )}

        {paymentBooking && (
          <PaymentModal
            isOpen={!!paymentBooking}
            booking={paymentBooking}
            onClose={() => setPaymentBooking(null)}
            onSuccess={handlePaymentSuccess}
          />
        )}

        {startRideBooking && (
          <StartRideModal
            isOpen={!!startRideBooking}
            booking={startRideBooking}
            onClose={() => setStartRideBooking(null)}
            onSuccess={handleStartRideSuccess}
          />
        )}

        {endRideBooking && (
          <EndRideModal
            isOpen={!!endRideBooking}
            booking={endRideBooking}
            onClose={() => setEndRideBooking(null)}
            onSuccess={handleEndRideSuccess}
          />
        )}

        {(cancelMutation.isPending || extendMutation.isPending) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[var(--bg-card)] rounded-lg p-6 shadow-xl border border-[var(--border-line)]">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--mclaren-orange)] mr-3" />
                <span className="text-[var(--text-secondary)]">正在处理...</span>
              </div>
            </div>
          </div>
        )}
    </PageLayout>
  )
}

export default MyBookingsPage
