import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { stationsApi } from '../api/stations'
import { scootersApi } from '../api/scooters'
import Navbar from '../components/Navbar'
import { useToast } from '../components/ToastProvider'
import { Station } from '../types'

const MapPage: React.FC = () => {
  const { showToast } = useToast()
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)

  // 获取用户位置
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        (error) => {
          console.error('Error getting location:', error)
          showToast('无法获取您的位置，请确保已开启位置权限', 'warning')
        }
      )
    }
  }, [showToast])

  // 获取站点数据
  const {
    data: stations = [],
    isLoading: isLoadingStations,
    isError: isStationsError,
    error: stationsError,
  } = useQuery({
    queryKey: ['stations'],
    queryFn: stationsApi.getAll,
    staleTime: 5 * 60 * 1000, // 5分钟缓存
  })

  // 获取滑板车数据
  const {
    data: scooters = [],
    isLoading: isLoadingScooters,
    isError: isScootersError,
    error: scootersError,
  } = useQuery({
    queryKey: ['scooters'],
    queryFn: scootersApi.getAll,
    staleTime: 5 * 60 * 1000, // 5分钟缓存
  })

  // 处理站点点击
  const handleStationClick = (station: Station) => {
    setSelectedStation(station)
  }

  // 计算可用滑板车数量
  const getAvailableScootersCount = (stationId: string) => {
    return scooters.filter(
      scooter => scooter.stationId === stationId && scooter.status === 'AVAILABLE'
    ).length
  }

  // 渲染加载状态
  if (isLoadingStations || isLoadingScooters) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)]">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--mclaren-orange)]"></div>
          </div>
        </div>
      </div>
    )
  }

  // 渲染错误状态
  if (isStationsError || isScootersError) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)]">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-800">加载失败</h3>
            <p className="mt-2 text-red-700">
              {stationsError?.message || scootersError?.message || '无法加载地图数据'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              重新加载
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      <Navbar />
      
      {/* 主内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-main)]">滑板车站点地图</h1>
          <p className="text-[var(--text-secondary)] mt-2">
            查看附近的滑板车站点及可用车辆信息
          </p>
        </div>

        {/* 地图容器 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：站点列表 */}
          <div className="lg:col-span-1">
            <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-line)] p-6">
              <h2 className="text-xl font-semibold text-[var(--text-main)] mb-4">站点列表</h2>
              
              {userLocation && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    📍 您的位置：{userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                  </p>
                </div>
              )}

              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {stations.map((station) => {
                  const availableCount = getAvailableScootersCount(station.id)
                  return (
                    <div
                      key={station.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                        selectedStation?.id === station.id
                          ? 'border-[var(--mclaren-orange)] bg-[rgba(255,106,0,0.16)]'
                          : 'border-[var(--border-line)] bg-[var(--bg-card)]'
                      }`}
                      onClick={() => handleStationClick(station)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-[var(--text-main)]">{station.name}</h3>
                          <p className="text-sm text-[var(--text-secondary)] mt-1">{station.address}</p>
                        </div>
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            availableCount > 0
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {availableCount} 辆可用
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-3 text-sm text-[var(--text-secondary)]">
                        <div className="flex items-center">
                          <span className="mr-2">📍</span>
                          <span>坐标：{station.latitude.toFixed(4)}, {station.longitude.toFixed(4)}</span>
                        </div>
                        {userLocation && (
                          <div className="mt-1 flex items-center">
                            <span className="mr-2">📏</span>
                            <span>
                              距离：{calculateDistance(
                                userLocation.latitude,
                                userLocation.longitude,
                                station.latitude,
                                station.longitude
                              ).toFixed(2)} 公里
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* 右侧：地图和详情 */}
          <div className="lg:col-span-2">
            <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-line)] p-6">
              <h2 className="text-xl font-semibold text-[var(--text-main)] mb-4">
                {selectedStation ? selectedStation.name : '选择站点查看详情'}
              </h2>

              {/* 模拟地图 */}
              <div className="relative h-[400px] bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
                {/* 用户位置标记 */}
                {userLocation && (
                  <div
                    className="absolute w-8 h-8 bg-blue-500 rounded-full border-2 border-white shadow-lg"
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                    title="您的位置"
                  >
                    <div className="absolute inset-0 flex items-center justify-center text-white text-xs">
                      👤
                    </div>
                  </div>
                )}

                {/* 站点标记 */}
                {stations.map((station, index) => {
                  const angle = (index / stations.length) * 2 * Math.PI
                  const radius = 150
                  const x = 200 + radius * Math.cos(angle)
                  const y = 200 + radius * Math.sin(angle)
                  const availableCount = getAvailableScootersCount(station.id)
                  
                  return (
                    <div
                      key={station.id}
                      className={`absolute w-10 h-10 rounded-full border-2 border-white shadow-lg cursor-pointer transition-transform hover:scale-110 ${
                        selectedStation?.id === station.id
                          ? 'bg-[var(--mclaren-orange)]'
                          : availableCount > 0
                          ? 'bg-green-500'
                          : 'bg-red-500'
                      }`}
                      style={{
                        left: `${x}px`,
                        top: `${y}px`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      onClick={() => handleStationClick(station)}
                      title={`${station.name} (${availableCount}辆可用)`}
                    >
                    <div className="absolute inset-0 flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                  </div>
                )
              })}

              {/* 地图说明 */}
              <div className="absolute bottom-4 left-4 bg-slate-900/85 text-slate-100 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-white/10">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                    <span>您的位置</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                    <span>有可用车辆</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                    <span>无可用车辆</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-[var(--mclaren-orange)] rounded-full mr-2"></div>
                    <span>选中站点</span>
                  </div>
                </div>
              </div>
              </div>

              {/* 站点详情 */}
              {selectedStation && (
                <div className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium text-[var(--text-main)] mb-3">站点信息</h3>
                      <div className="space-y-2">
                        <div className="flex">
                          <span className="w-24 text-[var(--text-secondary)]">名称：</span>
                          <span className="text-[var(--text-main)]">{selectedStation.name}</span>
                        </div>
                        <div className="flex">
                          <span className="w-24 text-[var(--text-secondary)]">地址：</span>
                          <span className="text-[var(--text-main)]">{selectedStation.address}</span>
                        </div>
                        <div className="flex">
                          <span className="w-24 text-[var(--text-secondary)]">坐标：</span>
                          <span className="text-[var(--text-main)]">
                            {selectedStation.latitude.toFixed(4)}, {selectedStation.longitude.toFixed(4)}
                          </span>
                        </div>
                        {userLocation && (
                          <div className="flex">
                            <span className="w-24 text-[var(--text-secondary)]">距离：</span>
                            <span className="text-[var(--text-main)]">
                              {calculateDistance(
                                userLocation.latitude,
                                userLocation.longitude,
                                selectedStation.latitude,
                                selectedStation.longitude
                              ).toFixed(2)} 公里
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-[var(--text-main)] mb-3">可用车辆</h3>
                      {getAvailableScootersCount(selectedStation.id) > 0 ? (
                        <div className="space-y-2">
                          {scooters
                            .filter(scooter => scooter.stationId === selectedStation.id && scooter.status === 'AVAILABLE')
                            .map(scooter => (
                              <div
                                key={scooter.id}
                                className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                              >
                                <div>
                                  <span className="font-medium text-[var(--text-main)]">{scooter.id}</span>
                                  <p className="text-sm text-[var(--text-secondary)]">{scooter.location}</p>
                                </div>
                                <button
                                  onClick={() => {
                                    // 导航到车辆列表页面并自动打开预订
                                    window.location.href = `/scooters?highlight=${scooter.id}&book=1`
                                  }}
                                  className="px-3 py-1 bg-[var(--mclaren-orange)] text-white text-sm rounded-lg hover:brightness-110 transition-colors"
                                >
                                  立即预订
                                </button>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-red-700">当前站点暂无可用车辆</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// 计算两点之间的距离（公里）
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // 地球半径，单位：公里
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  const distance = R * c
  return Math.round(distance * 100) / 100 // 保留两位小数
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180)
}

export default MapPage
