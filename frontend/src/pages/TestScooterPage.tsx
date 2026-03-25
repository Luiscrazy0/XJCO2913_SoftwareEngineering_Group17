import ScooterCard from '../components/ScooterCard'
import { Scooter } from '../types'

// 测试数据
const testScooters: Scooter[] = [
  {
    id: '47ac4ef5-aa8c-4ae1-b158-3b8b963098d5',
    location: 'Campus Gate A - Main Entrance',
    status: 'AVAILABLE'
  },
  {
    id: '551c0400-4a1d-424c-a8f2-7092b6dfac26',
    location: 'Library Building - West Side',
    status: 'AVAILABLE'
  },
  {
    id: '789c0400-4a1d-424c-a8f2-7092b6dfac99',
    location: 'Student Center - Parking Lot B',
    status: 'UNAVAILABLE'
  },
  {
    id: '123c0400-4a1d-424c-a8f2-7092b6dfac00',
    location: 'Science Building - North Entrance',
    status: 'AVAILABLE'
  }
]

export default function TestScooterPage() {
  const handleBookClick = (scooter: Scooter) => {
    alert(`预约车辆 ${scooter.id} - 预约功能将在下一阶段实现`)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">车辆发现页 - 组件测试</h1>
        <p className="text-gray-600 mb-8">此页面用于测试ScooterCard组件和布局</p>
        
        <div className="mb-8 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">测试说明</h2>
          <ul className="list-disc pl-5 text-blue-700">
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
        <div className="mt-12 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">状态说明</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-3">
                可用
              </span>
              <span className="text-gray-700">车辆处于可用状态，可以预约</span>
            </div>
            <div className="flex items-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 mr-3">
                不可用
              </span>
              <span className="text-gray-700">车辆处于不可用状态，无法预约</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
