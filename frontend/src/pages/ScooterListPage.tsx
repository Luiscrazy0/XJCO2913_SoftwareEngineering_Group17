import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { scootersApi } from '../api/scooters'
import ScooterCard from '../components/ScooterCard'
import BookingModal from '../components/BookingModal'
import Navbar from '../components/Navbar'
import { Scooter } from '../types'

export default function ScooterListPage() {
  const [selectedScooter, setSelectedScooter] = useState<Scooter | null>(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

  // 使用TanStack Query获取车辆数据
  const {
    data: scooters = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['scooters'],
    queryFn: async () => {
      try {
        const data = await scootersApi.getAll()
        console.log('获取到的车辆数据:', data)
        return data
      } catch (err) {
        console.error('获取车辆数据失败:', err)
        throw err
      }
    },
    retry: 1,
    refetchOnWindowFocus: false
  })

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

  // 处理加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--mclaren-orange)]"></div>
            <p className="mt-4 text-[var(--text-secondary)]">正在加载车辆信息...</p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">从后端API获取数据中</p>
          </div>
        </div>
      </div>
    )
  }

  // 处理错误状态
  if (isError) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : '获取车辆信息时发生未知错误'
    
    return (
      <div className="min-h-screen bg-[var(--bg-main)] p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
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
              <button
                onClick={() => refetch()}
                className="inline-flex items-center px-3 py-2 border border-rose-500/30 text-sm leading-4 font-medium rounded-md text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
              >
                重试
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 处理空状态
  if (availableScooters.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
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
        </div>
      </div>
    )
  }

  // 成功状态：显示车辆列表
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[var(--bg-main)] p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* 页面标题和统计信息 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[var(--text-main)]">发现车辆</h1>
            <p className="mt-2 text-[var(--text-secondary)]">
              当前有 <span className="font-semibold text-[var(--mclaren-orange)]">{availableScooters.length}</span> 辆可用车辆
              {scooters.length > availableScooters.length && (
                <span className="ml-2 text-[var(--text-secondary)]">
                  (共 {scooters.length} 辆，{scooters.length - availableScooters.length} 辆不可用)
                </span>
              )}
            </p>
          </div>

          {/* 车辆网格列表 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {availableScooters.map((scooter: Scooter) => (
              <ScooterCard 
                key={scooter.id} 
                scooter={scooter}
                onBook={handleBookClick}
              />
            ))}
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
        </div>
      </div>

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
