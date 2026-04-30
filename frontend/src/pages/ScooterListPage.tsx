import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { scootersApi } from '../api/scooters'
import ScooterCard from '../components/ScooterCard'
import BookingModal from '../components/BookingModal'
import PageLayout from '../components/PageLayout'
import Button from '../components/ui/Button'
import SidePromo from '../components/SidePromo'
import { Scooter } from '../types'
import { useSearchParams } from 'react-router-dom'
import { scooterKeys } from '../utils/queryKeys'

export default function ScooterListPage() {
  const [selectedScooter, setSelectedScooter] = useState<Scooter | null>(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [searchParams] = useSearchParams()
  const autoOpenedRef = useRef(false)

  // 使用TanStack Query获取车辆数据
  const {
    data: scootersData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: scooterKeys.list('public'),
    queryFn: async () => {
      try {
        const data = await scootersApi.getAll(1, 100)
        return data
      } catch (err) {
        console.error('获取车辆数据失败:', err)
        throw err
      }
    },
    retry: 1,
    refetchOnWindowFocus: false
  })

  const scooters = scootersData?.items ?? []

  // 处理预约按钮点击
  const handleBookClick = (scooter: Scooter) => {
    setSelectedScooter(scooter)
    setIsBookingModalOpen(true)
  }

  // 处理预约成功
  const handleBookingSuccess = () => {
    // 重新获取车辆数据
    refetch()
  }

  // 处理关闭预约弹窗
  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false)
    setSelectedScooter(null)
  }

  // 过滤出可用的车辆
  const availableScooters = scooters.filter(scooter => scooter.status === 'AVAILABLE')

  // 从地图页跳转时自动打开预订弹窗
  useEffect(() => {
    if (autoOpenedRef.current) return
    if (!scooters.length) return

    const highlightId = searchParams.get('highlight')
    const shouldAutoBook = searchParams.get('book') === '1'
    if (!highlightId || !shouldAutoBook) return

    const target = scooters.find(scooter => scooter.id === highlightId)
    if (target && target.status === 'AVAILABLE') {
      setSelectedScooter(target)
      setIsBookingModalOpen(true)
      autoOpenedRef.current = true
    }
  }, [scooters, searchParams])

  // 处理加载状态
  if (isLoading) {
    return (
      <PageLayout title="发现车辆" subtitle="正在从后端API获取数据中...">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--mclaren-orange)]"></div>
          <p className="mt-4 text-[var(--text-secondary)]">正在加载车辆信息...</p>
        </div>
      </PageLayout>
    )
  }

  // 处理错误状态
  if (isError) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : '获取车辆信息时发生未知错误'
    
    return (
      <PageLayout title="发现车辆" subtitle="获取数据时发生错误">
        <div className="bg-rose-500/15 border border-rose-500/30 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-rose-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-rose-200">加载失败</h3>
              <div className="mt-2 text-sm text-rose-200/80">
                <p>{errorMessage}</p>
                <p className="mt-1">请检查：</p>
                <ul className="list-disc pl-5 mt-1">
                  <li>后端服务是否运行 (http://localhost:3000)</li>
                  <li>网络连接是否正常</li>
                  <li>API端点是否正确</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Button variant="danger" size="sm" onClick={() => refetch()}>
              重试
            </Button>
          </div>
        </div>
      </PageLayout>
    )
  }

  // 处理空状态
  if (availableScooters.length === 0) {
    return (
      <PageLayout title="发现车辆" subtitle="当前没有可用的电动滑板车">
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-[var(--text-main)]">暂无可用车辆</h3>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            当前没有可用的电动滑板车，请稍后再试。
            {scooters.length > 0 && (
              <span className="block mt-1">
                共有 {scooters.length} 辆车辆，但都处于不可用状态。
              </span>
            )}
          </p>
        </div>
      </PageLayout>
    )
  }

  // 成功状态：显示车辆列表
  return (
    <>
      <PageLayout title="发现车辆" subtitle={`当前有 ${availableScooters.length} 辆可用车辆`}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableScooters.map((scooter: Scooter) => (
              <ScooterCard 
                key={scooter.id} 
                scooter={scooter}
                onBook={handleBookClick}
              />
            ))}
            </div>
          </div>

          {/* Sidebar ads - desktop only */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <SidePromo />
            </div>
          </div>
        </div>

        {/* 调试信息（开发环境显示） */}
          {import.meta.env.DEV && (
            <div className="mt-12 p-6 bg-[var(--bg-input)] rounded-xl border border-[var(--border-line)]">
              <h2 className="text-lg font-semibold text-[var(--text-main)] mb-4">调试信息</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2">API响应数据</h3>
                  <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--border-line)] overflow-auto">
                    <pre className="text-xs text-[var(--text-secondary)]">
                      {JSON.stringify(scooters, null, 2)}
                    </pre>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2">系统状态</h3>
                  <ul className="space-y-2 text-sm text-[var(--text-main)]">
                    <li className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">后端API:</span>
                      <span className="font-medium text-emerald-300">正常</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">车辆总数:</span>
                      <span className="font-medium">{scooters.length}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">可用车辆:</span>
                      <span className="font-medium text-emerald-300">{availableScooters.length}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">不可用车辆:</span>
                      <span className="font-medium text-rose-300">{scooters.length - availableScooters.length}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
        )}
      </PageLayout>

      {/* 预约弹窗 */}
      {selectedScooter && (
        <BookingModal
          scooter={selectedScooter}
          isOpen={isBookingModalOpen}
          onClose={handleCloseBookingModal}
          onBookingSuccess={handleBookingSuccess}
        />
      )}
    </>
  )
}
