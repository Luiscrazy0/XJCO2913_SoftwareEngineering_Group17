import ScooterCard from '../components/ScooterCard'
import { Scooter } from '../types'

// 测试数据
const testScooters: Scooter[] = [
  {
    id: '47ac4ef5-aa8c-4ae1-b158-3b8b963098d5',
    location: 'Campus Gate A - Main Entrance',
    status: 'AVAILABLE',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '551c0400-4a1d-424c-a8f2-7092b6dfac26',
    location: 'Library Building - West Side',
    status: 'AVAILABLE',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '789c0400-4a1d-424c-a8f2-7092b6dfac99',
    location: 'Student Center - Parking Lot B',
    status: 'UNAVAILABLE',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '123c0400-4a1d-424c-a8f2-7092b6dfac00',
    location: 'Science Building - North Entrance',
    status: 'AVAILABLE',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

export default function TestScooterPage() {
  const handleBookClick = (scooter: Scooter) => {
    alert(`预约车辆 ${scooter.id} - 预约功能将在下一阶段实现`)
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-[var(--text-main)] mb-2">车辆发现页 - 组件测试</h1>
        <p className="text-[var(--text-secondary)] mb-8">此页面用于测试ScooterCard组件和布局</p>
        
        <div className="mb-8 p-4 bg-[var(--bg-input)] rounded-lg border border-[var(--border-line)]">
          <h2 className="text-lg font-semibold text-[var(--text-main)] mb-2">测试说明</h2>
          <ul className="list-disc pl-5 text-[var(--text-secondary)]">
            <li>共 {testScooters.length} 辆测试车辆</li>
            <li>可用车辆: {testScooters.filter(s => s.status === 'AVAILABLE').length} 辆</li>
            <li>不可用车辆: {testScooters.filter(s => s.status === 'UNAVAILABLE').length} 辆</li>
            <li>点击"立即预约"按钮会显示提示信息</li>
          </ul>
        </div>

        {/* 车辆网格列表 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {testScooters.map((scooter) => (
            <ScooterCard 
              key={scooter.id} 
              scooter={scooter} 
              onBook={handleBookClick}
            />
          ))}
        </div>

        {/* 状态说明 */}
        <div className="mt-12 p-6 surface-card surface-lift rounded-xl">
          <h2 className="text-xl font-bold text-[var(--text-main)] mb-4">状态说明</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-200 mr-3 border border-emerald-400/30">
                可用
              </span>
              <span className="text-[var(--text-secondary)]">车辆处于可用状态，可以预约</span>
            </div>
            <div className="flex items-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-rose-500/15 text-rose-200 mr-3 border border-rose-400/30">
                不可用
              </span>
              <span className="text-[var(--text-secondary)]">车辆处于不可用状态，无法预约</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
