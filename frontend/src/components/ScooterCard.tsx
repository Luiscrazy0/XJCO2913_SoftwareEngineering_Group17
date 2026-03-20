import React from 'react'
import { Scooter } from '../types'

interface ScooterCardProps {
  scooter: Scooter
  onBook?: (scooterId: string) => void
}

const ScooterCard: React.FC<ScooterCardProps> = ({ scooter, onBook }) => {
  // 处理预约按钮点击
  const handleBookClick = () => {
    if (onBook) {
      onBook(scooter.id)
    } else {
      // 默认行为：显示提示信息
      alert(`预约车辆 ${scooter.id} - 预约功能将在下一阶段实现`)
    }
  }

  // 根据状态获取颜色和文本
  const getStatusInfo = () => {
    switch (scooter.status) {
      case 'AVAILABLE':
        return {
          text: '可用',
          color: 'bg-green-100 text-green-800',
          borderColor: 'border-green-200'
        }
      case 'UNAVAILABLE':
        return {
          text: '不可用',
          color: 'bg-red-100 text-red-800',
          borderColor: 'border-red-200'
        }
      default:
        return {
          text: '未知',
          color: 'bg-gray-100 text-gray-800',
          borderColor: 'border-gray-200'
        }
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden border ${statusInfo.borderColor} hover:shadow-lg transition-shadow duration-300`}>
      {/* 车辆图片区域 */}
      <div className="h-48 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <p className="mt-2 text-sm text-blue-600 font-medium">电动滑板车</p>
        </div>
      </div>

      {/* 车辆信息区域 */}
      <div className="p-6">
        {/* 状态标签 */}
        <div className="flex justify-between items-start mb-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
            {statusInfo.text}
          </span>
          <span className="text-xs text-gray-500 font-mono">ID: {scooter.id.substring(0, 8)}...</span>
        </div>

        {/* 位置信息 */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">位置信息</h3>
          <div className="flex items-start">
            <svg className="w-5 h-5 text-gray-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-gray-700">{scooter.location}</p>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="mt-6">
          <button
            onClick={handleBookClick}
            disabled={scooter.status !== 'AVAILABLE'}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
              scooter.status === 'AVAILABLE'
                ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {scooter.status === 'AVAILABLE' ? '立即预约' : '不可预约'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ScooterCard